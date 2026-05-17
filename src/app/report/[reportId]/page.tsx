'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Sparkles, Heart, CheckCircle2, MessageCircle, Calendar, GraduationCap, TrendingUp, ThumbsUp, ChevronRight, Send, Loader2, Gift, Share2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

export default function PublicReportPage() {
  const { reportId } = useParams()
  const [report, setReport] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [feedbackInput, setFeedbackInput] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch current report
      const { data } = await supabase
        .from('reports')
        .select('*, students(name, id, next_payment_date)')
        .eq('id', reportId)
        .single()
      
      if (data) {
        setReport(data)
        
        // 2. Fetch history for graph ()
        const { data: historyData } = await supabase
          .from('reports')
          .select('created_at, scores')
          .eq('student_id', data.student_id)
          .order('created_at', { ascending: true })
          .limit(10)
        
        if (historyData) {
          const chartData = historyData.map((h: any) => ({
            date: new Date(h.created_at).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }),
            achievement: h.scores?.achievement || 5,
            effort: h.scores?.effort || 5
          }))
          setHistory(chartData)
        }
      }
      setLoading(false)
    }
    fetchData()
  }, [reportId, supabase])

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedbackInput) return

    setLoading(true)
    try {
      // 1. Get filtered version for teacher protection
      const filterRes = await fetch('/api/ai/filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: feedbackInput })
      })
      const filterData = await filterRes.json()

      // 2. Save both versions
      const { error } = await supabase
        .from('reports')
        .update({ 
          parent_feedback: feedbackInput,
          filtered_feedback: filterData.filtered || feedbackInput
        })
        .eq('id', report.id)

      if (!error) {
        setReport({ ...report, parent_feedback: feedbackInput })
        setFeedbackInput('')
        alert('소중한 의견이 전달되었습니다.')
      }
    } catch (err) {
      console.error('Feedback failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReaction = async (reaction: string) => {
    if (report.parent_reaction === reaction) return

    const { error } = await supabase
      .from('reports')
      .update({ 
        parent_reaction: reaction,
        read_at: new Date().toISOString() 
      })
      .eq('id', reportId)
    
    if (!error) {
      setReport({ ...report, parent_reaction: reaction })
    }
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput || chatLoading) return

    const userMsg = { role: 'user', content: chatInput }
    setChatMessages(prev => [...prev, userMsg])
    setChatInput('')
    setChatLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: chatInput,
          studentId: report.student_id,
          academyId: report.academy_id
        })
      })

      const data = await response.json()
      if (data.message) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.message }])
      }
    } catch (err) {
      console.error('Chat failed:', err)
    } finally {
      setChatLoading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-24 h-24 bg-blue-100 rounded-[2rem] mb-6 flex items-center justify-center">
          <GraduationCap className="w-12 h-12 text-[#0066FF]" />
        </div>
        <p className="text-[#0066FF] font-black text-lg">Notia AI가 리포트를 불러오고 있습니다...</p>
      </div>
    </div>
  )

  if (!report) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-10">
      <div className="text-center">
        <h2 className="text-2xl font-black text-gray-900 mb-2">리포트를 찾을 수 없습니다.</h2>
        <p className="text-gray-400 font-medium">링크가 만료되었거나 삭제된 리포트입니다.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6">
      <div className="max-w-xl mx-auto bg-white rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-[#0066FF] to-[#0052CC] p-12 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mx-auto mb-6 flex items-center justify-center border border-white/30">
              <Sparkles className="w-8 h-8 text-blue-100" />
            </div>
            <h1 className="text-3xl font-black mb-2 tracking-tight">{report.students?.name} 학생 학습 리포트</h1>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold border border-white/20">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(report.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 sm:p-12 space-y-12">
          {/* AI Content Box */}
          <section>
            <div className="bg-blue-50/50 p-8 sm:p-10 rounded-[2.5rem] border border-blue-100 relative">
              <div className="absolute -top-5 left-10 bg-white px-4 py-2 rounded-xl shadow-sm border border-blue-50 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#0066FF]" />
                <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Teacher's Note</span>
              </div>
              <p className="text-[#1A1A1A] leading-relaxed text-xl font-medium italic">
                &quot;{report.ai_content || "오늘의 학습 내용이 정리 중입니다."}&quot;
              </p>
            </div>
          </section>

          {/* Scores Grid */}
          <section>
            <div className="grid grid-cols-3 gap-4">
              <ScoreCard label="학습 열정" score={report.scores?.effort || 5} color="text-orange-500" bgColor="bg-orange-50" />
              <ScoreCard label="성취도" score={report.scores?.achievement || 5} color="text-green-500" bgColor="bg-green-50" />
              <ScoreCard label="수업 태도" score={report.scores?.attitude || 5} color="text-blue-500" bgColor="bg-blue-50" />
            </div>
          </section>

          {/* Notia AI Admission Analysis */}
          {report.prediction_content && (
            <section className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#0066FF]" />
                  AI 입시 전략 분석
                </h3>
                <div className="px-3 py-1 bg-blue-100 rounded-full text-[10px] font-black text-[#0066FF] uppercase tracking-tighter">
                  Real-time Analysis
                </div>
              </div>
              
              <div className="bg-[#1A1A1A] p-10 rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl border border-gray-800">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600 rounded-full opacity-10 -mr-40 -mt-40 blur-[100px]"></div>
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-600 rounded-full opacity-10 -ml-30 -mb-30 blur-[80px]"></div>
                
                <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-[1.5rem] flex items-center justify-center border border-white/20 shadow-inner">
                      <GraduationCap className="w-7 h-7 text-blue-300" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Target Strategy</p>
                      <h4 className="text-xl font-black text-white tracking-tight">AI 핵심 입시 진단</h4>
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-inner group hover:bg-white/10 transition-all duration-500">
                    <p className="text-lg sm:text-xl font-medium leading-relaxed text-blue-50 italic">
                      <span className="text-blue-400 text-3xl font-serif mr-2">&quot;</span>
                      {report.prediction_content}
                      <span className="text-blue-400 text-3xl font-serif ml-2">&quot;</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 px-4 py-3 bg-blue-900/30 rounded-2xl border border-blue-500/20">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <p className="text-[11px] font-bold text-blue-200">담당 선생님의 관찰 기록과 AI 입시 엔진이 결합된 맞춤형 분석입니다.</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* AI Homework Prescription */}
          {report.homework_prescription && report.homework_prescription.length > 0 && (
            <section className="space-y-6">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 px-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                AI 맞춤 복습 처방전
              </h3>
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-8 rounded-[2.5rem] border border-purple-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="space-y-4 relative z-10">
                  {report.homework_prescription.map((item: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white shadow-sm hover:translate-x-2 transition-transform">
                      <div className="w-6 h-6 bg-purple-600 text-white rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 shadow-lg shadow-purple-200">
                        0{idx + 1}
                      </div>
                      <p className="text-sm font-bold text-purple-900 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-purple-400 font-black mt-6 text-center uppercase tracking-widest">
                  오늘 수업 내용을 바탕으로 AI가 분석한 핵심 복습 항목입니다.
                </p>
              </div>
            </section>
          )}

          {/* Visual Growth Graph */}
          {history.length > 1 && (
            <section className="space-y-6">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 px-2">
                <TrendingUp className="w-5 h-5 text-[#0066FF]" />
                시각적 성장 트래킹
              </h3>
              <div className="bg-[#F8F9FA] p-6 rounded-[2.5rem] border border-gray-100 shadow-inner overflow-hidden">
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history}>
                      <defs>
                        <linearGradient id="colorAch" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0066FF" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#0066FF" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }}
                        dy={10}
                      />
                      <YAxis hide domain={[0, 5]} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 700 }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="achievement" 
                        stroke="#0066FF" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorAch)" 
                        animationDuration={2000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-center text-gray-400 font-bold mt-4 uppercase tracking-widest">
                  최근 {history.length}회차 학습 성취도 변화 추이
                </p>
              </div>
            </section>
          )}

          {/* Payment Reminder */}
          {report.students?.next_payment_date && (
            <section className="animate-in slide-in-from-bottom-4 duration-700 delay-300">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-orange-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-100">Premium Reminder</span>
                  </div>
                  <h3 className="text-xl font-black mb-2">원비 결제 예정 안내</h3>
                  <p className="text-sm font-medium text-orange-50 opacity-90 mb-6">
                    {report.students?.name || '학생'} 학생의 다음 원비 결제일은 <br />
                    <span className="font-black text-white underline decoration-2 underline-offset-4">
                      {report.students?.next_payment_date ? new Date(report.students.next_payment_date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }) : ''}
                    </span>입니다. 쾌적한 학습 환경 유지를 위해 확인 부탁드립니다.
                  </p>
                  <button className="w-full py-4 bg-white text-orange-600 rounded-2xl font-black text-sm hover:bg-orange-50 transition-all flex items-center justify-center gap-2 shadow-lg">
                    온라인 결제하기
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* 24/7 AI Admin Bot */}
          <section className="pt-12">
            <div className="bg-gray-900 rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600 rounded-full opacity-20 blur-3xl"></div>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/50">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">24/7 AI 행정 상담봇</h3>
                  <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Professional Assistant</p>
                </div>
              </div>

              <div className="space-y-4 mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl rounded-tl-none border border-white/5 text-sm font-medium leading-relaxed">
                  안녕하세요 학부모님! Notia AI 상담봇입니다. {report.students?.name || '학생'} 학생의 리포트나 학원 생활에 대해 궁금한 점이 있으신가요?
                </div>
                {chatMessages.map((msg: any, idx: number) => (
                  <div key={idx} className={`p-4 rounded-2xl text-sm font-medium leading-relaxed ${
                    msg.role === 'user' 
                    ? 'bg-blue-600 ml-8 rounded-tr-none' 
                    : 'bg-white/10 mr-8 rounded-tl-none border border-white/5'
                  }`}>
                    {msg.content}
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex items-center gap-2 text-[10px] text-blue-400 font-bold ml-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    AI가 답변을 생각하고 있습니다...
                  </div>
                )}
              </div>

              <form onSubmit={handleChatSubmit} className="relative">
                <input 
                  type="text"
                  placeholder="질문을 입력하세요..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={chatLoading}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                />
                <button 
                  type="submit"
                  disabled={chatLoading || !chatInput}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-blue-600 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-30"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </section>
          {/* Parent Feedback Text */}
          <section className="space-y-6">
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2 px-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              선생님께 한마디
            </h3>
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <textarea
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                placeholder="오늘 수업에 대한 의견이나 궁금한 점을 남겨주세요."
                className="w-full p-6 bg-gray-50 border border-gray-100 rounded-[2rem] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all min-h-[120px] resize-none"
              />
              <button
                type="submit"
                disabled={loading || !feedbackInput}
                className="w-full py-4 bg-[#1A1A1A] text-white rounded-2xl font-black text-sm hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95 disabled:opacity-30"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                피드백 보내기
              </button>
            </form>
          </section>

          {/* Referral Invite */}
          <section>
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-[2.5rem] border border-blue-100 relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-blue-600/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600">
                    <Gift className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-blue-900 uppercase tracking-widest">Referral Program</span>
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">지인 추천하고 혜택 받으세요!</h3>
                <p className="text-sm font-medium text-gray-500 mb-8 leading-relaxed">
                  {report.students?.name || '학생'} 학생의 친구를 {report.students?.academies?.name || '학원'}에 추천해 보세요. <br/>
                  지인 등록 시 두 분 모두에게 풍성한 혜택을 드립니다!
                </p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-white border border-gray-100 rounded-2xl px-6 py-4 flex items-center justify-between">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">내 추천 코드</p>
                    <p className="font-black text-blue-600">{report.students?.referral_code || 'REF-NOTIA'}</p>
                  </div>
                  <button 
                    onClick={() => {
                      const shareLink = `http://localhost:3000/join/${report.students?.referral_code || 'REF-NOTIA'}`
                      navigator.clipboard.writeText(shareLink)
                      alert('추천 링크가 복사되었습니다. 지인분께 공유해 주세요!')
                    }}
                    className="p-4 bg-[#1A1A1A] text-white rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95 flex items-center justify-center"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Interactive Feedback Buttons */}
          <section className="pt-8 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-400 mb-8 font-bold">리포트가 도움이 되셨다면 응원의 반응을 보내주세요!</p>
            <div className="flex gap-4">
              <button 
                onClick={() => handleReaction('thanks')}
                disabled={report.parent_reaction === 'thanks'}
                className={`flex-1 py-5 rounded-[1.5rem] font-black flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-100 ${
                  report.parent_reaction === 'thanks' 
                  ? 'bg-red-500 text-white shadow-red-200' 
                  : 'bg-red-50 text-red-500 hover:bg-red-100'
                }`}
              >
                <Heart className={`w-5 h-5 ${report.parent_reaction === 'thanks' ? 'fill-current' : ''}`} />
                감사해요!
              </button>
              <button 
                onClick={() => handleReaction('checked')}
                disabled={report.parent_reaction === 'checked'}
                className={`flex-1 py-5 rounded-[1.5rem] font-black flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-100 ${
                  report.parent_reaction === 'checked' 
                  ? 'bg-[#0066FF] text-white shadow-blue-200' 
                  : 'bg-blue-50 text-[#0066FF] hover:bg-blue-100'
                }`}
              >
                <ThumbsUp className="w-5 h-5" />
                확인했습니다
              </button>
            </div>
            
            {report.parent_reaction && (
              <p className="mt-4 text-[10px] text-green-600 font-black animate-pulse flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                피드백이 선생님께 전달되었습니다.
              </p>
            )}
          </section>
        </div>
      </div>
      
      <p className="text-center mt-12 text-gray-400 text-xs font-bold tracking-widest flex items-center justify-center gap-2">
        <GraduationCap className="w-4 h-4" />
        POWERED BY <span className="text-[#0066FF]">NOTIA AI OS</span>
      </p>
    </div>
  )
}

function ScoreCard({ label, score, color, bgColor }: any) {
  return (
    <div className={`${bgColor} p-6 rounded-[2rem] text-center border border-transparent hover:border-white hover:shadow-xl transition-all group`}>
      <p className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-widest group-hover:text-gray-600">{label}</p>
      <div className={`text-3xl font-black ${color} tracking-tighter`}>{score}<span className="text-xs opacity-40 ml-0.5">/5</span></div>
    </div>
  )
}
