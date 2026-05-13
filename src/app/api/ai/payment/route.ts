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

    // AI Generate Payment Reminder
    const systemPrompt = `
      ?�신?� ?�원 ?�영 ?�문 ?�담가?�니?? 
      ?��?모님�?결제 ?�내 메시지�?보내???�는?? ?�무 ?�무?�이지 ?�게 ?�생??최근 ?�습 ?�과�?�?��?�며 ?�연?�럽�?결제�??�내?�세??
      
      [???�정]
      - polite: 매우 ?�중?�고 ?�의 바른 ?�조
      - friendly: 친근?�고 ?�뜻???�조
      - professional: 깔끔?�고 명확???�조
      
      [조건]
      1. 반드???�생??최근 ?�습 ?�용("${recentReport?.ai_content || '?�습 ?�도가 매우 좋습?�다'}")???�급?�며 ?�?��? ?�작?�세??
      2. ?�연?�럽�??�비 결제??${student?.next_payment_date})???�내?�세??
      3. 마�?막에 ?�금 계좌 ?�보(NH?�협 3516376760453)�??�함?�세??
      4. 면책 조항?� ?�함?��? 마세??
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
