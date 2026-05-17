import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SolapiMessageService } from 'solapi'

export async function GET(req: Request) {
  // 1. 보안 설정: Vercel Cron 등 지정된 요청 또는 auth secret 허용
  const authHeader = req.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')
    if (token !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Service role to bypass RLS in CRON

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase service role configuration missing')
    return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    const today = new Date()
    
    // 5일 전 타겟 날짜
    const target5Days = new Date(today)
    target5Days.setDate(today.getDate() + 5)
    const targetDate5DaysStr = target5Days.toISOString().split('T')[0]

    // 1일 전 타겟 날짜
    const target1Day = new Date(today)
    target1Day.setDate(today.getDate() + 1)
    const targetDate1DayStr = target1Day.toISOString().split('T')[0]

    const results = []

    // 솔라피 메세지 서비스 초기화
    const solapiApiKey = process.env.SOLAPI_API_KEY
    const solapiApiSecret = process.env.SOLAPI_API_SECRET
    const solapiSenderNumber = process.env.SOLAPI_SENDER_NUMBER

    const isSmsEnabled = !!(solapiApiKey && solapiApiSecret && solapiSenderNumber)
    const messageService = isSmsEnabled 
      ? new SolapiMessageService(solapiApiKey!, solapiApiSecret!) 
      : null

    // -------------------------------------------------------------
    // PART A: 학원 만료일 체크 (5일 전, 1일 전 원장님께 안내 문자 발송)
    // -------------------------------------------------------------
    const { data: expiringAcademies, error: acadError } = await supabase
      .from('academies')
      .select(`
        id,
        name,
        expired_at,
        owner_id,
        profiles(full_name, phone)
      `)
      .eq('status', 'active')

    if (acadError) throw acadError

    for (const academy of (expiringAcademies || [])) {
      if (!academy.expired_at) continue
      const expiredDateStr = new Date(academy.expired_at).toISOString().split('T')[0]
      
      if (expiredDateStr === targetDate5DaysStr || expiredDateStr === targetDate1DayStr) {
        const daysLeft = expiredDateStr === targetDate5DaysStr ? 5 : 1
        const owner = Array.isArray(academy.profiles) ? academy.profiles[0] : academy.profiles
        
        if (owner && owner.phone) {
          const message = 
            daysLeft === 5 
            ? `[Notia] 원장님, Notia 이용권이 5일 뒤(${expiredDateStr}) 만료됩니다. 원활한 학원 운영을 위해 미리 연장해주세요! [결제하기: https://notia.vercel.app/admin/settings]`
            : `[Notia] (긴급) 원장님, Notia 이용권이 내일 만료됩니다. 서비스가 중단되지 않도록 지금 바로 결제해주세요! [결제하기: https://notia.vercel.app/admin/settings]`

          if (isSmsEnabled && messageService) {
            try {
              await messageService.send({
                to: owner.phone,
                from: solapiSenderNumber!,
                text: message
              })
              console.log(`[학원 만료 알림 발송 성공] TO: ${owner.phone}`)
              results.push({ type: 'academy_plan', name: academy.name, phone: owner.phone, daysLeft, status: 'sent' })
            } catch (err) {
              console.error(`[학원 만료 알림 발송 실패] TO: ${owner.phone}`, err)
              results.push({ type: 'academy_plan', name: academy.name, phone: owner.phone, daysLeft, status: 'failed', error: String(err) })
            }
          } else {
            console.log(`[학원 만료 시뮬레이션] TO: ${owner.phone} | CONTENT:\n${message}`)
            results.push({ type: 'academy_plan', name: academy.name, phone: owner.phone, daysLeft, status: 'simulated' })
          }
        }
      }
    }

    // -------------------------------------------------------------
    // PART B: 학생 결제 예정 알림 (5일 전, 1일 전 학부모님께 수납 안내 발송)
    // -------------------------------------------------------------
    const { data: targetStudents, error: studentError } = await supabase
      .from('students')
      .select(`
        id,
        name,
        parent_phone,
        next_payment_date,
        academy_id,
        academies(name)
      `)
      .in('next_payment_date', [targetDate5DaysStr, targetDate1DayStr])
      .eq('status', 'active')

    if (studentError) throw studentError

    for (const student of (targetStudents || []) as any[]) {
      const academyData = student.academies
      const academyName = (Array.isArray(academyData) ? academyData[0]?.name : academyData?.name) || '노티아 학원'
      const daysLeft = student.next_payment_date === targetDate5DaysStr ? 5 : 1

      // 해당 학생의 미청구 교재비 조회 및 합산
      const { data: unpaidTextbooks } = await supabase
        .from('student_textbooks')
        .select('textbook_name, textbook_price')
        .eq('student_id', student.id)
        .eq('is_billed', false)

      const baseTuition = 190000 // 기본 원비 19만원
      const textbookSum = unpaidTextbooks 
        ? unpaidTextbooks.reduce((acc, curr) => acc + curr.textbook_price, 0)
        : 0
      const totalAmount = baseTuition + textbookSum

      let textbookInfoText = ''
      if (unpaidTextbooks && unpaidTextbooks.length > 0) {
        textbookInfoText = `\n- 추가 교재비: ${textbookSum.toLocaleString()}원 (${unpaidTextbooks.map(tb => tb.textbook_name).join(', ')})`
      }

      const message = `[${academyName}] 결제 예정 안내
안녕하세요, ${academyName}입니다.
${student.name} 학생의 원비 수납 예정일이 ${daysLeft}일 전(${student.next_payment_date})으로 다가와 안내 드립니다.

■ 청구 내역
- 기본 수업료: ${baseTuition.toLocaleString()}원${textbookInfoText}
- 총 합산 금액: ${totalAmount.toLocaleString()}원

■ 입금 계좌: NH농협 3516376760453 (${academyName})
원활한 수업 진행과 학원 운영을 위해 기한 내에 수납해 주시면 감사하겠습니다.`

      if (isSmsEnabled && messageService) {
        try {
          await messageService.send({
            to: student.parent_phone,
            from: solapiSenderNumber!,
            text: message
          })
          console.log(`[수납 문자 발송 성공] TO: ${student.parent_phone} (학생: ${student.name})`)
          results.push({ type: 'student_tuition', student: student.name, phone: student.parent_phone, daysLeft, status: 'sent' })
        } catch (smsError) {
          console.error(`[수납 문자 발송 실패] TO: ${student.parent_phone} (학생: ${student.name})`, smsError)
          results.push({ type: 'student_tuition', student: student.name, phone: student.parent_phone, daysLeft, status: 'failed', error: String(smsError) })
        }
      } else {
        console.log(`[수납 문자 시뮬레이션] TO: ${student.parent_phone} | CONTENT:\n${message}`)
        results.push({ type: 'student_tuition', student: student.name, phone: student.parent_phone, daysLeft, status: 'simulated' })
      }
    }

    return NextResponse.json({ success: true, processedCount: results.length, details: results })

  } catch (err: any) {
    console.error('CRITICAL CRON REMINDER ERROR:', err)
    return NextResponse.json({ error: '알림 발송 중 오류가 발생했습니다: ' + err.message }, { status: 500 })
  }
}
