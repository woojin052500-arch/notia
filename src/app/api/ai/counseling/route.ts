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
    
    // Fallback script if Anthropic API is not configured or fails
    const isKeyMissing = !process.env.ANTHROPIC_API_KEY
    const devAlert = isKeyMissing
      ? `\n\n⚠️ [안내: ANTHROPIC_API_KEY 환경 변수가 세팅되지 않아 데모 체험 모드로 작동 중입니다. Vercel이나 .env.local에 API 키를 등록하면 실시간 데이터 기반 고성능 AI 상담 대본이 자동 생성됩니다.]`
      : `\n\n⚠️ [안내: Claude AI API 호출 중 일시적 지연이 발생하여 데모 대본이 로드되었습니다.]`

    const fallbackScript = `학부모님, 안녕하세요! Notia 학원 원장입니다.

최근 우리 학생이 학원에 등원할 때마다 늘 밝고 긍정적인 에너지를 전해주어, 반 분위기를 이끌어주는 고마운 역할을 톡톡히 하고 있어 꼭 말씀드리고 싶었습니다.

최근 수업 관찰 일지에 따르면, 수업 도중 어려운 개념을 마주하더라도 포기하지 않고 끝까지 문제를 해결하려는 근성 있는 모습을 보여 깊은 감명을 받았습니다. 특히, 모르는 부분에 대해 적극적으로 질문하고 교사의 피드백을 스펀지처럼 흡수하는 능력이 매우 우수합니다.

다만, 최근 진도가 다소 심화되면서 복합 응용 문항에서 자잘한 계산 실수나 유형 혼동이 일부 관찰되었습니다. 이는 새로운 단계에 진입했을 때 겪는 아주 자연스러운 성장통입니다. 학원에서는 우리 학생을 위해 1:1 맞춤형 오답 관리 카드를 단독 매칭하여, 실수를 원천 방지하는 정밀 케어 수업을 다음 주부터 적극 밀어붙일 계획입니다.

가정에서도 최근 아이가 애쓰고 있는 부분을 아낌없이 격려해 주시고 안아주시면 큰 힘이 될 것입니다. 늘 학원을 전적으로 믿고 맡겨주셔서 진심으로 감사드리며, 혹시 가정에서 특별히 신경 쓰이시거나 전해주실 의견이 있으시다면 언제든 편하게 말씀해 주십시오. 감사합니다!${devAlert}`

    return NextResponse.json({ script: fallbackScript })
  }
}
