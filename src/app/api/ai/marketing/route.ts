import { Anthropic } from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function POST(req: Request) {
  try {
    const { studentId, achievementType } = await req.json()

    const systemPrompt = `
      당신은 학원 마케팅 전문가입니다. 
      학생의 성과와 장점을 바탕으로 SNS(인스타그램, 블로그)에 올리기 좋은 '카드뉴스' 문구를 만들어주세요.
      반드시 JSON 형식으로만 응답해야 하며, 백틱(\`\`\`) 등으로 감싸지 말고 순수 JSON 문자열로만 응답하세요.
      {
        "headline": "헤드라인 문구 (예: 김철수 학생, 수학 성취도 100% 달성!)",
        "subHeadline": "부제목 (예: 묵묵한 노력으로 만들어낸 값진 결과)",
        "content": "본문 내용",
        "hashtags": ["#수학우수", "#성장스토리", "#노티아학원"],
        "themeColor": "#0066FF"
      }
    `

    let response;
    try {
      response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [
          { role: 'user', content: `${achievementType} 성과를 바탕으로 마케팅 문구를 만들어줘.` }
        ]
      })
    } catch (sonnetErr) {
      console.warn('Sonnet-4-6 failed on marketing card, trying Haiku fallback:', sonnetErr)
      response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [
          { role: 'user', content: `${achievementType} 성과를 바탕으로 마케팅 문구를 만들어줘.` }
        ]
      })
    }

    let result = {}
    if (response && response.content[0].type === 'text') {
      try {
        const text = response.content[0].text.trim()
        // Simple sanitization to remove any accidental markdown block formatting
        const sanitizedText = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
        result = JSON.parse(sanitizedText)
      } catch (e) {
        console.error('JSON Parse Error:', e, response.content[0].text)
        result = {
          headline: `${achievementType} 달성!`,
          subHeadline: '노력으로 이뤄낸 값진 결실',
          content: '꾸준한 출석과 성실함으로 눈부신 성장을 보여주고 있습니다.',
          hashtags: ['#열공', '#학습기록', '#노티아'],
          themeColor: '#0066FF'
        }
      }
    }
    return NextResponse.json(result)

  } catch (error: any) {
    console.error('Marketing API Error:', error)
    return NextResponse.json({ error: '마케팅 문구 생성 실패' }, { status: 500 })
  }
}
