import { Anthropic } from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function POST(req: Request) {
  try {
    const { studentId } = await req.json()

    if (!studentId) {
      return NextResponse.json({ error: '?�생 ID가 ?�요?�니??' }, { status: 400 })
    }

    // Initialize Supabase
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // 1. Fetch Student Cumulative Data (Recent 10 reports)
    const { data: reports } = await supabase
      .from('reports')
      .select('ai_content, teacher_memo, created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(10)

    const context = reports?.map(r => `- ${r.teacher_memo}`).join('\n')

    // 2. AI Generate Workbook Content
    const systemPrompt = `
      ?�신?� 최상?�권 ?�생?�을 지?�하??'?�만???�습지 ?�자?�너' AI?�니??
      ?�공???�생??최근 ?�습 기록??분석?�여, ???�생만을 ?�한 '개인�?맞춤 ?�크�? ?�용???�성?�세??
      
      [?�크�?구성]
      1. ?�심 취약??분석: 최근 ?�습?�서 공통?�으�?발견???�점 ?�약
      2. 개념 ?�시 보기: 취약?�을 극복?�기 ?�한 ?�심 개념 ?�리
      3. ?�전 과제: ?�생???�습?�야 ??구체?�인 ?�습 미션 3가지
      4. ?�원 메시지: ?�생?�의 진심 ?�린 격려
      
      말투???�문?�이면서??격려가 가?�한 ?�조�??�용?�세??
      반드??JSON ?�식?�로 ?�답?�세??
      {
        "title": "?�크�??�목 (?? 5???�학 ?�화 ?�답 ?�복)",
        "vulnerability": "분석??취약???�용",
        "concepts": ["개념1", "개념2", "개념3"],
        "missions": ["미션1", "미션2", "미션3"],
        "message": "?�뜻???�원 메시지"
      }
    `

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        { role: 'user', content: `???�생???�습 기록??바탕?�로 ?�크북을 만들?�줘:\n${context}` }
      ]
    })

    const result = JSON.parse(response.content[0].type === 'text' ? response.content[0].text : '{}')

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('Workbook Error:', error)
    return NextResponse.json({ error: '?�크�??�성 �??�류가 발생?�습?�다.' }, { status: 500 })
  }
}
