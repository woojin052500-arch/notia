import { NextResponse } from 'next/server'
import { SolapiMessageService } from 'solapi'

export async function POST(req: Request) {
  try {
    const { to, text } = await req.json()
    
    if (!to || !text) {
      return NextResponse.json({ error: '필수 매개변수가 누락되었습니다.' }, { status: 400 })
    }

    const apiKey = process.env.SOLAPI_API_KEY
    const apiSecret = process.env.SOLAPI_API_SECRET
    const senderNumber = process.env.SOLAPI_SENDER_NUMBER

    if (apiKey && apiSecret && senderNumber) {
      try {
        const messageService = new SolapiMessageService(apiKey, apiSecret);
        await messageService.send({
          to,
          from: senderNumber,
          text
        })
        console.log(`[SOLAPI LIVE SMS SUCCESS] TO: ${to} | TEXT: ${text}`);
        return NextResponse.json({ success: true, mode: 'live' })
      } catch (solapiErr: any) {
        console.error('[SOLAPI LIVE SMS CRITICAL ERROR]', solapiErr);
        return NextResponse.json({ error: solapiErr.message || 'Solapi 전송 실패' }, { status: 500 })
      }
    } else {
      // Fallback: Simulation/Demo Mode
      console.log(`[SOLAPI MOCK SMS SIMULATION] TO: ${to} | TEXT: ${text}`);
      return NextResponse.json({ success: true, mode: 'demo' })
    }
  } catch (error: any) {
    console.error('SMS Send Route Error:', error)
    return NextResponse.json({ error: error.message || 'SMS 전송 실패' }, { status: 500 })
  }
}
