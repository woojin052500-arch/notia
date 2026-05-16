'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { getPlanLimits } from '@/utils/plan-limits'
import { 
  ArrowLeft, 
  Sparkles, 
  MessageSquare, 
  Loader2, 
  CheckCircle2, 
  ChevronRight,
  Send,
  AlertCircle,
  RotateCcw,
  ShieldCheck,
  Copy,
  TrendingUp,
  Share2
} from 'lucide-react'
import Link from 'next/link'

export default function NewReportPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [student, setStudent] = useState<any>(null)
  const [academy, setAcademy] = useState<any>(null)
  const [memo, setMemo] = useState('')
  const [targetGoal, setTargetGoal] = useState('')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [aiContent, setAiContent] = useState('')
  const [homework, setHomework] = useState<string[]>([])
  const [prediction, setPrediction] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch Academy for Plan Verification
      const { data: academyData } = await supabase
        .from('academies')
        .select('*')
        .eq('owner_id', user.id)
        .single()
      
      setAcademy(academyData)

      // Fetch Student
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', params.id)
        .single()
      
      if (studentError) {
        setError(studentError.message)
      } else {
        setStudent(studentData)
      }
    }
    fetchData()
  }, [params.id, supabase])

  const handleGenerateAI = async () => {
    setGenerating(true)
    setError(null)
    
    try {
      const response = await fetch('/api/ai/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          memo, 
          studentName: student.name,
          targetGoal 
        }),
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      setAiContent(data.content)
      setHomework(data.homework || [])
      setPrediction(data.prediction || '')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleSaveReport = async () => {
    if (!aiContent) return
    setSaving(true)

    const { data, error: saveError } = await supabase
      .from('reports')
      .insert([
        {
          student_id: student.id,
          academy_id: student.academy_id,
          teacher_memo: memo,
          ai_content: aiContent,
          homework_prescription: homework,
          prediction_content: prediction,
          approval_status: 'approved',
          is_sent: false
        }
      ])
      .select()
      .single()

    if (saveError) {
      setError(saveError.message)
      setSaving(false)
    } else if (data) {
      const publicLink = `${window.location.origin}/report/${data.id}`
      const smsFormat = `[리포트 알림] ${student.name} 학생의 오늘 학습 리포트가 도착했습니다.\n\n▶ 리포트 확인하기:\n${publicLink}\n\n오늘도 정성을 다해 지도했습니다. 감사합니다.`
      
      await navigator.clipboard.writeText(smsFormat)
      
      setIsSuccess(true)
      setTimeout(() => {
        router.push('/admin/reports')
      }, 3000)
    }
  }

  if (!student && !error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      <p className="mt-4 text-gray-400 font-bold">학생 정보를 불러오는 중...</p>
    </div>
  )

  const plan = getPlanLimits(academy?.plan_type)

  if (academy && !plan.hasAiReport) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-12">
      <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center mb-8">
        <Sparkles className="w-10 h-10 text-blue-600" />
      </div>
      <h2 className="text-3xl font-black text-gray-900 mb-4">기능 사용이 일시적으로 제한되었습니다</h2>
      <p className="text-gray-400 font-bold max-w-sm mb-12">현재 계정 상태를 확인해 주세요. 지속적인 이용을 위해 요금제 확인이 필요합니다.</p>
      <Link href="/admin/dashboard" className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all">
        요금제 업그레이드 하러가기
      </Link>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto pb-20 relative">
      {/* Plan Badge */}
      <div className="absolute top-0 right-0 mt-4 mr-4 flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
        <ShieldCheck className="w-3 h-3" />
        {plan.name} Plan Active
      </div>
      {isSuccess && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center text-center p-10 animate-in fade-in duration-500">
          <div className="w-24 h-24 bg-green-50 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl shadow-green-100 border border-green-100">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">리포트 저장 및 문구 복사 완료!</h2>
          <p className="text-lg font-bold text-gray-500 leading-relaxed">
            학부모 전송용 문구와 링크가 클립보드에 복사되었습니다.<br />
            이제 카카오톡이나 문자에 바로 '붙여넣기' 하세요!
          </p>
          <div className="mt-12 flex items-center gap-2 text-green-600 font-black text-sm bg-green-50 px-6 py-3 rounded-full border border-green-100">
            <Loader2 className="w-4 h-4 animate-spin" />
            잠시 후 목록으로 이동합니다...
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <Link 
          href="/admin/students"
          className="p-3 bg-white rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all shadow-sm"
        >
          <ArrowLeft className="w-6 h-6 text-gray-400" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">리포트 작성</h1>
          <p className="text-sm font-medium text-gray-400">AI가 선생님의 정성을 전문적인 문장으로 다듬어 드립니다.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Input Section */}
        <div className="space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-3xl border border-gray-100">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-100">
                {student?.name?.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">{student?.name} 학생</h2>
                <p className="text-sm text-gray-400 font-bold">{student?.grade}학년 • {student?.school}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Lesson Observation</label>
                <div className="relative">
                  <MessageSquare className="absolute left-6 top-6 w-5 h-5 text-gray-300" />
                  <textarea
                    rows={8}
                    placeholder="예: 오늘 삼각함수 개념 잘 이해함. 문제 풀이 속도가 빨라짐. 숙제는 다 해왔으나 오답 정리가 조금 더 필요해 보임."
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    className="w-full pl-16 pr-8 py-6 bg-gray-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-[2.5rem] focus:ring-4 focus:ring-blue-50 transition-all font-medium resize-none text-gray-700 shadow-inner"
                  ></textarea>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-4">Student Goal</label>
                <div className="relative">
                  <TrendingUp className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                  <input
                    type="text"
                    placeholder="목표 대학/학과 (예: 서울대 컴공, 의예과 등)"
                    value={targetGoal}
                    onChange={(e) => setTargetGoal(e.target.value)}
                    className="w-full pl-16 pr-8 py-5 bg-gray-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-[1.5rem] focus:ring-4 focus:ring-blue-50 transition-all font-black text-gray-700 shadow-inner"
                  />
                </div>
              </div>
              
              <button
                onClick={handleGenerateAI}
                disabled={generating || !memo}
                className="group w-full py-6 bg-[#1A1A1A] text-white rounded-[2.5rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-[#0066FF] active:scale-[0.98] transition-all shadow-2xl shadow-blue-100 disabled:opacity-30 disabled:hover:bg-[#1A1A1A]"
              >
                {generating ? (
                  <Loader2 className="w-7 h-7 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-7 h-7 group-hover:animate-pulse" />
                    AI 리포트 & 분석 생성하기
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-blue-100 rounded-full opacity-50 group-hover:scale-120 transition-transform"></div>
            <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-1.5 relative z-10">
              <Sparkles className="w-3.5 h-3.5" />
              Notia AI 엔진 활성화
            </h4>
            <p className="text-sm text-blue-800 leading-relaxed font-bold relative z-10">
              현재 <span className="text-blue-600 underline decoration-2 underline-offset-4">칭찬 중심 문장 교정</span> 모드가 활성화되어 있습니다. 거친 메모도 따뜻한 격려로 변환됩니다.
            </p>
          </div>
        </div>

        {/* Right: Result Section */}
        <div className="space-y-6">
          <div className={`bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm transition-all h-full flex flex-col ${aiContent ? 'ring-2 ring-blue-500 shadow-blue-100' : ''}`}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <CheckCircle2 className={`w-6 h-6 ${aiContent ? 'text-blue-600' : 'text-gray-200'}`} />
                AI 생성 리포트
              </h2>
              {aiContent && (
                <button 
                  onClick={() => setAiContent('')}
                  className="p-2 text-gray-300 hover:text-gray-900 transition-colors"
                  title="다시 생성"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="flex-1 relative">
              {!aiContent && !generating && (
                <div key="empty-state" className="absolute inset-0 flex flex-col items-center justify-center text-center p-10">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-10 h-10 text-gray-200" />
                  </div>
                  <p className="text-gray-400 font-bold leading-relaxed">
                    왼쪽에 메모를 작성하고<br />버튼을 누르면 리포트가 생성됩니다.
                  </p>
                </div>
              )}

              {generating && (
                <div key="generating-state" className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 bg-white/80 backdrop-blur-sm z-10">
                  <div className="relative">
                    <div className="w-20 h-20 bg-blue-50 rounded-full animate-pulse flex items-center justify-center">
                      <Sparkles className="w-10 h-10 text-blue-600 animate-spin-slow" />
                    </div>
                    <div className="absolute top-0 right-0">
                      <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    </div>
                  </div>
                  <p className="mt-6 text-blue-600 font-black animate-bounce">AI가 정성을 담아 리포트를 작성 중입니다...</p>
                </div>
              )}

              <div>
                <textarea
                  value={aiContent}
                  onChange={(e) => setAiContent(e.target.value)}
                  placeholder="생성된 리포트 내용이 여기에 표시됩니다. 직접 수정도 가능합니다."
                  className={`w-full h-full min-h-[300px] p-6 bg-gray-50 border-none rounded-[2rem] focus:ring-2 focus:ring-blue-600 transition-all font-medium text-gray-700 leading-relaxed italic ${!aiContent ? 'opacity-0' : 'opacity-100'}`}
                ></textarea>
              </div>

              {aiContent && homework.length > 0 && (
                <div key="homework-state" className="mt-8 p-6 bg-purple-50 rounded-3xl border border-purple-100 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-white rounded-lg shadow-sm">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">AI 숙제 처방전</span>
                  </div>
                  <ul className="space-y-3">
                    {homework.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm font-bold text-purple-900 leading-relaxed">
                        <span className="shrink-0 w-5 h-5 bg-white rounded-full flex items-center justify-center text-[10px] text-purple-600 shadow-sm border border-purple-100">
                          {idx + 1}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {aiContent && (
              <div className="mt-8 space-y-4">
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(aiContent)
                      alert('리포트 본문 텍스트가 복사되었습니다.')
                    }}
                    className="px-8 py-5 bg-gray-100 text-gray-600 rounded-[2rem] font-black text-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition-all shadow-xl shadow-gray-100 border border-gray-200"
                    title="본문 복사"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSaveReport}
                    disabled={saving}
                    className="flex-1 py-5 bg-[#1A1A1A] text-white rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-[#0066FF] active:scale-[0.98] transition-all shadow-xl shadow-blue-100"
                  >
                    {saving ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <Share2 className="w-6 h-6" />
                        학부모 전송용 문구 & 링크 복사
                      </>
                    )}
                  </button>
                </div>
                
                <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 flex items-start gap-4">
                  <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <p className="text-[11px] text-blue-800 font-black leading-relaxed">
                    <strong>사용 안내:</strong> 저장 버튼을 누르면 학부모 전용 리포트 링크와 전송용 문구가 자동으로 복사됩니다. <br/>
                    카카오톡 등에서 바로 '붙여넣기'하여 학부모님께 전송하세요.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
