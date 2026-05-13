import { Anthropic } from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function POST(req: Request) {
  try {
    const { studentId } = await req.json()

    if (!studentId) {
      return NextResponse.json({ error: '?�생 ID가 ?�요?�니??' }, { status: 400 })
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
      ?�생 ?�름: ${student?.name}
      ?�생 기본 메모: ${student?.memo || '?�음'}
      최근 ?�습 기록:
      ${reports?.map(r => `- [${r.created_at}] ?�취?? ${r.scores?.achievement}/5, 리포?? ${r.ai_content}`).join('\n')}
      출결 ?�황: ?�체 ${attendance?.length || 0}???�업 �?지�?결석 ${attendance?.filter(a => a.status !== 'present').length || 0}??    `

    // 2. AI Script Generation
    const systemPrompt = `
      ?�신?� ?�원 ?�생?�의 ?�화 ?�담???�는 'AI ?�담 코치'?�니??
      ?�공???�생???�적 ?�이?��? 바탕?�로 ?��?모님과의 '3�??�화 ?�담 ?��????�성?�세??
      
      [?��?구성]
      1. ?�입부: 가벼운 ?�사?� ?�생??최근 ?�원 ?�황 ?�급
      2. �?�� ?�인?? ?�이?��? 기반?�로 ???�생??강점 2가지 (�?�� 중심)
      3. ?�습 진도 �??�취: 최근 ?�습???�용�??�취???�약
      4. 보완??�??�후 계획: 부족한 부분을 ?�떻�?지?�할 것인지???�???�문?�인 계획
      5. 마무�? ?��?모님???�견 경청 ?�도 �??�뜻???�인??      
      말투???�생?�이 바로 ?�거??참고?????�도�?구어�?~?? ~�?�??�용?�세??
    `

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        { role: 'user', content: `???�생???�적 ?�이?��? 분석?�서 ?�담 ?�본을 짜줘:\n${context}` }
      ]
    })

    const script = response.content[0].type === 'text' ? response.content[0].text : ''

    return NextResponse.json({ script })

  } catch (error: any) {
    console.error('Counseling Script Error:', error)
    return NextResponse.json({ error: '?�담 ?��??�성 �??�류가 발생?�습?�다.' }, { status: 500 })
  }
}
