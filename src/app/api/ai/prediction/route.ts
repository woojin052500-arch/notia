import { Anthropic } from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function POST(req: Request) {
  try {
    const { studentId, goal } = await req.json()

    if (!studentId) {
      return NextResponse.json({ error: '?�생 ID가 ?�요?�니??' }, { status: 400 })
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
      ?�생 ?�름: ${student?.name}
      목표 ?�???�공: ${goal || '미정'}
      ?�재 ?�적 ?�이?? ${JSON.stringify(student?.current_grade_info || {})}
      최근 ?�원 ?�취??추이:
      ${reports?.map(r => `- [${r.created_at}] ?�취?? ${r.scores?.achievement}/5`).join('\n')}
    `

    // 2. AI Analysis (Simulating WJedulab Engine)
    const systemPrompt = `
      ?�신?� ?�?��?�?최상???�시 ?�이??분석 ?�진 'WJedulab AI'?�니??
      ?�공???�생???�신, 모의고사 ?�적 �??�원 ???�취??추이�?바탕?�로 ?��? ?�시 ?�측 리포?��? ?�성?�세??
      
      [분석 리포??구성]
      1. ?�격 가?�성 (Probability): 0~100% ?�이???�치?� �?근거
      2. 강점 분석 (Strengths): ?�시 관?�에?�의 ?�수 ?�소
      3. ?�략??보완??(Strategies): 목표 ?�성???�해 ?�요??구체?�인 ?�적 ?�상 목표
      4. WJedulab 총평: ?�이??기반??최종 조언
      
      말투??매우 ?�문?�이�??�뢰�??�는 ?�이??분석가 ?�을 ?��??�세??
      반드??JSON ?�식?�로�??�답?�세??
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
        { role: 'user', content: `???�생???�시 ?�측 리포?��? ?�성?�줘:\n${context}` }
      ]
    })

    const result = JSON.parse(response.content[0].type === 'text' ? response.content[0].text : '{}')

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('Prediction Error:', error)
    return NextResponse.json({ error: '?�시 ?�측 ?�성 �??�류가 발생?�습?�다.' }, { status: 500 })
  }
}
