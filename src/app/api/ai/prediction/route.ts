import { Anthropic } from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function POST(req: Request) {
  try {
    const { studentId, goal } = await req.json()

    if (!studentId) {
      return NextResponse.json({ error: '학생 ID가 필요합니다.' }, { status: 400 })
    }

    // Initialize Supabase
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // 1. Fetch Student Data
    const { data: student } = await supabase
      .from('students')
      .select('name, current_grade_info')
      .eq('id', studentId)
      .single()

    const { data: reports } = await supabase
      .from('reports')
      .select('scores, ai_content, created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(20)

    const context = `
      학생 이름: ${student?.name}
      목표 대학/전공: ${goal || '미정'}
      현재 성적 데이터: ${JSON.stringify(student?.current_grade_info || {})}
      최근 학원 성취도 추이:
      ${reports?.map(r => `- [${r.created_at}] 성취도 ${r.scores?.achievement}/5`).join('\n')}
    `

    // 2. AI Analysis (Simulating WJedulab Engine)
    const systemPrompt = `
      당신은 대치동 최상위 입시 데이터 분석 엔진 'WJedulab AI'입니다.
      제공된 학생의 내신, 모의고사 성적 및 학원 내 성취도 추이를 바탕으로 전문 입시 예측 리포트를 작성하세요.
      
      [분석 리포트 구성]
      1. 합격 가능성 (Probability): 0~100% 사이의 수치와 그 근거
      2. 강점 분석 (Strengths): 입시 관점에서의 우수 요소
      3. 전략 및 보완점 (Strategies): 목표 달성을 위해 필요한 구체적인 성적 향상 목표
      4. WJedulab 총평: 데이터 기반의 최종 조언
      
      말투는 매우 전문적이고 신뢰감 있는 데이터 분석가 톤을 유지하세요.
      반드시 JSON 형식으로만 응답하세요.
      {
        "probability": number,
        "strengths": string,
        "strategies": string,
        "summary": string
      }
    `

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        { role: 'user', content: `이 학생의 입시 예측 리포트를 작성해줘:\n${context}` }
      ]
    })

    const result = JSON.parse(response.content[0].type === 'text' ? response.content[0].text : '{}')

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('Prediction Error:', error)
    return NextResponse.json({ error: '입시 예측 생성 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
