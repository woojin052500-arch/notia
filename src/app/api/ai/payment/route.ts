import { Anthropic } from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function POST(req: Request) {
  try {
    const { studentId, tone = 'polite' } = await req.json()

    // Initialize Supabase
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Fetch Student and Recent Report Data
    const { data: student } = await supabase
      .from('students')
      .select('name, next_payment_date, academies(name)')
      .eq('id', studentId)
      .single()

    const { data: recentReport } = await supabase
      .from('reports')
      .select('ai_content')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const { data: unpaidTextbooks } = await supabase
      .from('student_textbooks')
      .select('textbook_name, textbook_price')
      .eq('student_id', studentId)
      .eq('is_billed', false)

    const textbooksText = unpaidTextbooks && unpaidTextbooks.length > 0 
      ? `추가 청구될 교재비 내역: ${unpaidTextbooks.map(tb => `${tb.textbook_name}(${tb.textbook_price}원)`).join(', ')}`
      : '추가 교재비 없음';

    // AI Generate Payment Reminder
    const systemPrompt = `
      ?�신?� ?�원 ?�영 ?�문 ?�담가?�니?? 
      ?��?모님�?결제 ?�내 메시지�?보내???�는?? ?�무 ?�무?�이지 ?�게 ?�생??최근 ?�습 ?�과�?�?��?�며 ?�연?�럽�?결제�??�내?�세??
      
      당신은 학원 운영 전문 상담가입니다. 
      학부모님께 결제 안내 메시지를 보내려 합니다. 정중하면서도 따뜻하게 최근 학습 결과를 언급하며 자연스럽게 결제를 안내하세요.
      
      [어조]
      - polite: 매우 정중하고 예의 바른 어조
      - friendly: 친근하고 따뜻한 어조
      - professional: 깔끔하고 명확한 어조
      
      [조건]
      1. 반드시 학생의 최근 학습 내용("${recentReport?.ai_content || '학습 태도가 매우 좋습니다'}")을 언급하며 대화를 시작하세요.
      2. 자연스럽게 원비 결제일(${student?.next_payment_date})을 안내하세요.
      3. ${textbooksText !== '추가 교재비 없음' ? `교재비 청구 내역이 있습니다. 원비와 함께 합산하여 다음 내역을 반드시 안내하세요: ${textbooksText}` : '원비만 안내하세요.'}
      4. 마지막에 입금 계좌 정보(NH농협 3516376760453)를 포함하세요.
      5. 면책 조항은 포함하지 마세요.
    `

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [
        { role: 'user', content: `${student?.name} ?�생???��?모님�?보낼 ${tone} ?�의 결제 ?�내 문구�??�성?�줘.` }
      ]
    })

    const result = response.content[0].type === 'text' ? response.content[0].text : ''

    return NextResponse.json({ message: result })

  } catch (error: any) {
    console.error('Payment AI Error:', error)
    return NextResponse.json({ error: '결제 ?�내 문구 ?�성 ?�패' }, { status: 500 })
  }
}
