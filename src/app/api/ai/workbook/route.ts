import { Anthropic } from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function POST(req: Request) {
  try {
    const { studentId } = await req.json()

    if (!studentId) {
      return NextResponse.json({ error: '학생 ID가 필요합니다.' }, { status: 400 })
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
      당신은 최상위권 학생들을 지도하는 '나만의 학습지 디자이너' AI입니다.
      제공된 학생의 최근 학습 기록을 분석하여, 이 학생만을 위한 '개인화 맞춤 워크북 내용'을 작성하세요.
      
      [워크북 구성]
      1. 핵심 취약점 분석: 최근 학습에서 공통적으로 발견된 약점 요약
      2. 개념 다시 보기: 취약점을 극복하기 위한 핵심 개념 정리
      3. 도전 과제: 학생이 수행해야 할 구체적인 학습 미션 3가지
      4. 응원 메시지: 학생을 향한 진심 어린 격려
      
      말투는 전문적이면서도 격려가 가득한 어조를 사용하세요.
      반드시 JSON 형식으로 응답하세요.
      {
        "title": "워크북 제목 (예: 5주차 수학 심화 정복)",
        "vulnerability": "분석된 취약점 내용",
        "concepts": ["개념1", "개념2", "개념3"],
        "missions": ["미션1", "미션2", "미션3"],
        "message": "따뜻한 응원 메시지"
      }
    `

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        { role: 'user', content: `이 학생의 학습 기록을 바탕으로 워크북을 만들어줘:\n${context}` }
      ]
    })

    const result = JSON.parse(response.content[0].type === 'text' ? response.content[0].text : '{}')

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('Workbook Error:', error)
    return NextResponse.json({ error: '워크북 생성 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
