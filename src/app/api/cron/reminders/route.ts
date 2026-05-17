import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SolapiMessageService } from 'solapi'

export async function GET(req: Request) {
  // 1. 보안 설정: Vercel Cron 등 지정된 요청만 허용 (옵션)
  const authHeader = req.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase configuration missing');
    return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const today = new Date()
    
    // 만료 5일 전 타겟 날짜
    const target5Days = new Date(today)
    target5Days.setDate(today.getDate() + 5)
    const targetDate5DaysStr = target5Days.toISOString().split('T')[0]

    // 만료 1일 전 타겟 날짜
    const target1Day = new Date(today)
    target1Day.setDate(today.getDate() + 1)
    const targetDate1DayStr = target1Day.toISOString().split('T')[0]

    // 2. 만료 예정인 학원(원장님) 조회 (plan_expires_at 필드 사용 가정)
    // 주의: profiles 테이블에 원장님의 전화번호(phone)가 있다고 가정합니다.
    const { data: expiringAcademies, error } = await supabase
      .from('academies')
      .select(`
        id,
        name,
        plan_expires_at,
        owner_id,
        profiles!academies_owner_id_fkey(full_name, email, phone)
      `)
      .in('plan_expires_at', [targetDate5DaysStr, targetDate1DayStr])
      .eq('status', 'active')

    if (error) throw error

    if (!expiringAcademies || expiringAcademies.length === 0) {
      return NextResponse.json({ message: 'No expiring academies found for today.' })
    }

    const results = []

    // 3. 각 원장님에게 알림 발송 처리
    for (const academy of expiringAcademies) {
      const owner = Array.isArray(academy.profiles) ? academy.profiles[0] : academy.profiles;
      if (!owner || !owner.phone) {
        console.warn(`[알림 실패] 학원 ${academy.name}의 원장님 연락처가 없습니다.`);
        continue;
      }

      const daysLeft = academy.plan_expires_at === targetDate5DaysStr ? 5 : 1;
      const message = 
        daysLeft === 5 
        ? `[Notia] 원장님, Notia 이용권이 5일 뒤(${academy.plan_expires_at}) 만료됩니다. 원활한 학원 운영을 위해 미리 연장해주세요! [결제하기: https://notia.com/admin/settings]`
        : `[Notia] (긴급) 원장님, Notia 이용권이 내일 만료됩니다. 서비스가 중단되지 않도록 지금 바로 결제해주세요! [결제하기: https://notia.com/admin/settings]`

      // 솔라피 연동 발송 로직
      if (process.env.SOLAPI_API_KEY && process.env.SOLAPI_API_SECRET && process.env.SOLAPI_SENDER_NUMBER) {
        try {
          const messageService = new SolapiMessageService(process.env.SOLAPI_API_KEY, process.env.SOLAPI_API_SECRET);
          
          await messageService.send({
            to: owner.phone,
            from: process.env.SOLAPI_SENDER_NUMBER,
            text: message
          });
          console.log(`[알림 발송 성공] TO: ${owner.phone}`);
          results.push({ academy: academy.name, daysLeft, phone: owner.phone, status: 'sent' });
        } catch (error) {
          console.error(`[알림 발송 실패] TO: ${owner.phone}`, error);
          results.push({ academy: academy.name, daysLeft, phone: owner.phone, status: 'failed', error: String(error) });
        }
      } else {
        // 환경 변수가 없을 때 시뮬레이션
        console.log(`[알림 발송 시뮬레이션] TO: ${owner.phone} | CONTENT: ${message}`);
        results.push({ academy: academy.name, daysLeft, phone: owner.phone, status: 'sent_mock' });
      }
    }

    return NextResponse.json({ success: true, processed: results.length, details: results })
    
  } catch (err: any) {
    console.error('Cron Reminder Error:', err)
    return NextResponse.json({ error: '알림 발송 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
