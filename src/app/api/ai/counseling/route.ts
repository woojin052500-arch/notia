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

    // 1. Fetch Student Cumulative Data
    const { data: student } = await supabase
      .from('students')
      .select('name, memo')
      .eq('id', studentId)
      .single()

    const { data: reports } = await supabase
      .from('reports')
      .select('ai_content, scores, created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(10)

    const { data: attendance } = await supabase
      .from('attendance')
      .select('status')
      .eq('student_id', studentId)

    const context = `
      학생 이름: ${student?.name}
      학생 기본 메모: ${student?.memo || '없음'}
      최근 학습 기록:
      ${reports?.map(r => `- [${r.created_at}] 성취도 ${r.scores?.achievement}/5, 리포트 ${r.ai_content}`).join('\n')}
      출결 현황: 전체 ${attendance?.length || 0}회 수업 중 지각/결석 ${attendance?.filter(a => a.status !== 'present').length || 0}회
    `

    // 2. AI Script Generation
    const systemPrompt = `
      당신은 학원 선생님의 전화 상담을 돕는 'AI 상담 코치'입니다.
      제공된 학생의 누적 데이터를 바탕으로 학부모님과의 '3분 전화 상담 대본'을 작성하세요.
      
      [대본구성]
      1. 도입부: 가벼운 인사와 학생의 최근 등원 현황 언급
      2. 칭찬 포인트: 데이터를 기반으로 한 학생의 강점 2가지 (칭찬 중심)
      3. 학습 진도 및 성취: 최근 학습한 내용과 성취도 요약
      4. 보완점 및 향후 계획: 부족한 부분을 어떻게 지도할 것인지에 대한 전문적인 계획
      5. 마무리: 학부모님의 의견 경청 유도 및 따뜻한 마무리
      
      말투는 선생님이 바로 읽거나 참고할 수 있도록 구어체(~요, ~습니다)를 사용하세요.
    `

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        { role: 'user', content: `이 학생의 누적 데이터를 분석해서 상담 대본을 짜줘:\n${context}` }
      ]
    })

    const script = response.content[0].type === 'text' ? response.content[0].text : ''

    return NextResponse.json({ script })

  } catch (error: any) {
    console.error('Counseling Script Error:', error)
    return NextResponse.json({ error: '상담 대본 생성 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
