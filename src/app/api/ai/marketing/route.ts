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
      반드시 JSON 형식으로 응답하세요:
      {
        "headline": "헤드라인 문구",
        "subHeadline": "부제목",
        "content": "본문 내용",
        "hashtags": ["#태그1", "#태그2"],
        "themeColor": "#0066FF"
      }
    `

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [
        { role: 'user', content: `${achievementType} 성과를 바탕으로 마케팅 문구를 만들어줘.` }
      ]
    })

    const result = JSON.parse(response.content[0].type === 'text' ? response.content[0].text : '{}')
    return NextResponse.json(result)

  } catch (error: any) {
    console.error('Marketing API Error:', error)
    return NextResponse.json({ error: '마케팅 문구 생성 실패' }, { status: 500 })
  }
}
