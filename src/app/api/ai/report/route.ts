import { Anthropic } from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function POST(req: Request) {
  const { memo, studentName, targetGoal } = await req.json()
  
  try {
    if (!memo) {
      return NextResponse.json({ error: '메모 내용이 없습니다.' }, { status: 400 })
    }

    const systemPrompt = `
      당신은 학부모의 신뢰를 200% 이끌어내는 '교육 커뮤니케이션 전문가'이자 AI 교육 비서 'Notia'입니다.
      선생님의 거친 메모를 바탕으로, 학부모님께 보낼 정중하고 따뜻한 '칭찬 중심' 리포트를 작성하세요.
      
      [어조 및 말투]
      - 신뢰감이 느껴지는 공적인 경어체(하십시오체와 해요체를 적절히 혼용)를 사용하세요.
      - 감정적인 표현보다는 객관적인 관찰과 전문적인 진단 위주로 서술하세요.
      
      [입시 분석 및 목표]
      - 학생의 목표: ${targetGoal || '대학 입시 성공'}
      - 선생님의 메모를 바탕으로 이 목표를 달성하기 위한 짧고 전문적인 '입시 분석 한마디'를 작성하세요.
      
      반드시 다음 JSON 형식으로만 응답하세요:
      {
        "report": "학부모님께 보내는 따뜻한 리포트 본문 (칭찬 위주)",
        "homework": ["구체적인 복습 과제 1", "과제 2", "과제 3"],
        "prediction": "목표 달성을 위한 AI 입시 전략 및 격려 메시지 (2~3문장)"
      }
    `

    // --- High Performance AI with Haiku Failover ---
    let message;
    try {
      message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-latest', 
        max_tokens: 1500,
        temperature: 0.7,
        system: systemPrompt,
        messages: [{ role: 'user', content: `학생 이름: ${studentName}\n선생님 메모: ${memo}\n목표: ${targetGoal}\n\n위 내용을 바탕으로 리포트, 숙제, 입시 분석을 작성해줘.` }],
      })
    } catch (sonnetError) {
      console.warn('Sonnet failed, trying Haiku model fallback:', sonnetError);
      message = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307', 
        max_tokens: 1500,
        temperature: 0.7,
        system: systemPrompt,
        messages: [{ role: 'user', content: `학생 이름: ${studentName}\n선생님 메모: ${memo}\n목표: ${targetGoal}\n\n위 내용을 바탕으로 리포트, 숙제, 입시 분석을 작성해줘.` }],
      })
    }

    const aiResponseText = message.content[0].type === 'text' ? message.content[0].text : ''
    
    try {
      const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/)
      const jsonStr = jsonMatch ? jsonMatch[0] : aiResponseText
      const jsonResult = JSON.parse(jsonStr)
      
      return NextResponse.json({ 
        content: jsonResult.report, 
        homework: jsonResult.homework,
        prediction: jsonResult.prediction
      })
    } catch (parseError) {
      return NextResponse.json({ content: aiResponseText, homework: [], prediction: '' })
    }
  } catch (error: any) {
    console.error('CRITICAL AI ERROR:', error)
    
    // Check if key is missing
    const isKeyMissing = !process.env.ANTHROPIC_API_KEY
    const devAlert = isKeyMissing 
      ? `[안내: ANTHROPIC_API_KEY 환경 변수가 세팅되지 않아 데모 체험 모드로 작동 중입니다. Vercel이나 .env.local에 API 키를 등록하면 실제 고성능 AI 리포트가 생성됩니다.]`
      : `[안내: Claude API 호출 중 일시적 오류가 발생했습니다. (${error.message || '제한 오류'}) 데모 리포트가 생성되었습니다.]`

    return NextResponse.json({ 
      content: `오늘 ${studentName} 학생은 수업에 매우 성실하게 임했습니다. 선생님의 세심한 지도 아래 '${memo}'에 대한 핵심 개념을 완벽하게 익혔으며, 특히 문제를 스스로 해결하려는 강한 집중력이 돋보였습니다. 앞으로도 이 기세를 이어간다면 향후 학습에서 더욱 우수하고 큰 성장을 이루어낼 것이라 확신합니다.`,
      homework: [
        `'${memo}' 단원 관련 오답 오차 수정 5문항 풀기`, 
        "오늘 피드백받은 고난도 핵심 유형 오답 풀이 정리", 
        "다음 시간 기본 개념 예습 문제 읽고 준비하기"
      ],
      prediction: `'${targetGoal || '목표 대학 합격'}' 달성을 위해 현재 보여주는 끈기 있는 집중력과 꼼꼼한 오답 분석 태도를 꾸준히 유지하는 것이 가장 결정적입니다. 취약점을 지속적으로 분석 보완해 나가면 원하시는 목표를 거뜬히 성취할 것입니다.`,
      devAlert: devAlert
    })
  }
}