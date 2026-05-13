import { Anthropic } from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1000,
      system: "당신은 학원 운영 및 학생 관리를 돕는 전문 비서 'Notia AI'입니다. 원장님과 선생님들께 친절하고 전문적인 조언을 제공하세요.",
      messages: messages
    })

    return NextResponse.json({ 
      content: response.content[0].type === 'text' ? response.content[0].text : '' 
    })

  } catch (error: any) {
    console.error('Chat API Error:', error)
    return NextResponse.json({ error: 'AI 응답 생성 실패' }, { status: 500 })
  }
}
