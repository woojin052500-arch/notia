import { createClient } from '@/utils/supabase/client'
import { createBrowserClient } from '@supabase/ssr' // Note: In API route, better use createClient with service role if needed, but for now we use standard
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// In a real app, we would use createRouteHandlerClient from @supabase/auth-helpers-nextjs or @supabase/ssr
// For simplicity and since we are using createClient utility, let's adapt.

export async function POST(req: Request) {
  try {
    const { qrToken } = await req.json()

    if (!qrToken) {
      return NextResponse.json({ error: 'QR 토큰이 없습니다.' }, { status: 400 })
    }

    // Read the authorization header from the request to forward user RLS context if available
    const authHeader = req.headers.get('authorization')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
    
    // Build options. If we have a Bearer token, forward it to the Supabase client so it runs under the user's RLS session context.
    const clientOptions: any = {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      if (token) {
        clientOptions.global = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    }

    const supabase = createSupabaseClient(supabaseUrl, supabaseKey, clientOptions)

    // 1. Find student
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, name, academy_id, estimated_travel_time, parent_phone, academies(name)')
      .eq('qr_token', qrToken)
      .single()

    if (studentError || !student) {
      return NextResponse.json({ error: '학생을 찾을 수 없습니다.' }, { status: 404 })
    }

    // 2. Check today's attendance (synchronized with KST date)
    const now = new Date()
    const kstOffset = 9 * 60 * 60 * 1000
    const kstDate = new Date(now.getTime() + kstOffset).toISOString().split('T')[0]

    const { data: existing, error: existingError } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', student.id)
      .eq('created_at', kstDate)
      .maybeSingle()

    let type = ''
    let predictedArrival = ''

    if (!existing) {
      // 3. Check-in
      const { error: insertError } = await supabase
        .from('attendance')
        .insert([{
          student_id: student.id,
          academy_id: student.academy_id,
          check_in: new Date().toISOString(),
          status: 'present',
          created_at: kstDate
        }])
      
      if (insertError) throw insertError
      type = 'check-in'
    } else if (!existing.check_out) {
      // 4. Check-out
      const checkOutTime = new Date()
      
      const travelMinutes = student.estimated_travel_time || 15
      const arrivalTime = new Date(checkOutTime.getTime() + travelMinutes * 60000)
      predictedArrival = arrivalTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })

      const { error: updateError } = await supabase
        .from('attendance')
        .update({ 
          check_out: checkOutTime.toISOString()
        })
        .eq('id', existing.id)
      
      if (updateError) throw updateError
      type = 'check-out'
    }
 else {
      return NextResponse.json({ 
        message: '이미 하원 처리가 완료되었습니다.', 
        student: student.name,
        type: 'already-completed'
      })
    }

    const notificationMsg = type === 'check-in' 
      ? `${student.name} 학생 등원 처리가 완료되었습니다.`
      : `${student.name} 학생 하원 처리가 완료되었습니다. (예상 귀가: ${predictedArrival})`;

    // Automatically send SMS via Solapi if configured and parent's phone exists
    if (student.parent_phone) {
      const apiKey = process.env.SOLAPI_API_KEY
      const apiSecret = process.env.SOLAPI_API_SECRET
      const senderNumber = process.env.SOLAPI_SENDER_NUMBER
      
      if (apiKey && apiSecret && senderNumber) {
        try {
          const { SolapiMessageService } = await import('solapi')
          const messageService = new SolapiMessageService(apiKey, apiSecret)
          const academyName = (student.academies as any)?.name || '학원'
          await messageService.send({
            to: student.parent_phone,
            from: senderNumber,
            text: `[${academyName}] ${notificationMsg}`
          })
          console.log(`[SOLAPI ATTENDANCE SMS SUCCESS] TO: ${student.parent_phone}`);
        } catch (smsErr) {
          console.error('[SOLAPI ATTENDANCE SMS CRITICAL ERROR]', smsErr)
        }
      } else {
        const academyName = (student.academies as any)?.name || '학원'
        console.log(`[SOLAPI ATTENDANCE MOCK SMS] TO: ${student.parent_phone} | TEXT: [${academyName}] ${notificationMsg}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      type, 
      studentName: student.name,
      time: new Date().toLocaleTimeString('ko-KR'),
      predictedArrival: type === 'check-out' ? predictedArrival : null,
      notification: notificationMsg
    })

  } catch (error: any) {
    console.error('Attendance Scan Error:', error)
    return NextResponse.json({ error: '출결 처리 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
