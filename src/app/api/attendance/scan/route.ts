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

    // Initialize Supabase (Use service role if this is a public API, but here we assume it's protected or scoped)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    // Using a simple fetch or a temporary client for the API route
    // In production, you'd use a server-side client with appropriate permissions
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
    const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

    // 1. Find student
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, name, academy_id, estimated_travel_time, parent_phone, academies(id)')
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
      
      // Minimum Attendance Time Check
      const minMinutes = 50;
      const checkInTime = new Date(existing.check_in);
      const elapsedMinutes = (checkOutTime.getTime() - checkInTime.getTime()) / 60000;
      
      if (elapsedMinutes < minMinutes) {
        return NextResponse.json({
          error: `최소 학습 시간(${minMinutes}분)이 지나지 않아 하원할 수 없습니다. (현재 ${Math.floor(elapsedMinutes)}분 경과)`
        }, { status: 400 });
      }

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
          await messageService.send({
            to: student.parent_phone,
            from: senderNumber,
            text: `[Notia 출결 알림] ${notificationMsg}`
          })
          console.log(`[SOLAPI ATTENDANCE SMS SUCCESS] TO: ${student.parent_phone}`);
        } catch (smsErr) {
          console.error('[SOLAPI ATTENDANCE SMS CRITICAL ERROR]', smsErr)
        }
      } else {
        console.log(`[SOLAPI ATTENDANCE MOCK SMS] TO: ${student.parent_phone} | TEXT: [Notia 출결 알림] ${notificationMsg}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      type, 
      student: student.name,
      time: new Date().toLocaleTimeString('ko-KR'),
      predictedArrival: type === 'check-out' ? predictedArrival : null,
      notification: notificationMsg
    })

  } catch (error: any) {
    console.error('Attendance Scan Error:', error)
    return NextResponse.json({ error: '출결 처리 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
