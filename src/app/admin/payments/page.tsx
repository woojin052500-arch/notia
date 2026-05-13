'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  CreditCard, 
  Calendar, 
  User, 
  MessageSquare, 
  Copy, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ChevronRight,
  Filter,
  Search,
  Sparkles,
  Send
} from 'lucide-react'

export default function PaymentManagementPage() {
  const [students, setStudents] = useState<any[]>([])
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [aiMessage, setAiMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('students')
        .select('*')
        .order('next_payment_date', { ascending: true })
      
      if (data) setStudents(data)
      setLoading(false)
    }
    fetchStudents()
  }, [])

  const generateReminder = async (student: any, tone: string) => {
    setGenerating(true)
    setSelectedStudent(student)
    setAiMessage('')
    try {
      const res = await fetch('/api/ai/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: student.id, tone })
      })
      const data = await res.json()
      setAiMessage(data.message)
    } catch (err) {
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(aiMessage)
    alert('안내 문구가 복사되었습니다. 학부모님께 전달해 주세요!')
  }

  const handleMarkAsPaid = async (student: any) => {
    if (!confirm(`${student.name} 학생의 원비 수납을 확인하셨습니까?\n결제 예정일이 한 달 뒤로 업데이트됩니다.`)) return
    
    setLoading(true)
    const currentDate = student.next_payment_date ? new Date(student.next_payment_date) : new Date()
    const nextMonth = new Date(currentDate)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    
    const { error } = await supabase
      .from('students')
      .update({ next_payment_date: nextMonth.toISOString().split('T')[0] })
      .eq('id', student.id)
    
    if (!error) {
      setStudents(prev => prev.map(s => 
        s.id === student.id ? { ...s, next_payment_date: nextMonth.toISOString().split('T')[0] } : s
      ))
      alert('수납 처리가 완료되었습니다.')
    } else {
      alert('수납 처리 중 오류가 발생했습니다.')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="relative p-12 rounded-[4rem] bg-[#0A0A0A] overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 blur-[100px] rounded-full"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-600/20 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-6">
            <CreditCard className="w-3 h-3" />
            Payment Intelligence
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">수납 및 결제 관리</h1>
          <p className="text-gray-400 font-bold">미납 방지를 위한 AI 안내 문구를 생성하고 결제 현황을 실시간으로 추적하세요.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Interactive Student List */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex justify-between items-center px-4">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              결제 예정 명단
            </h2>
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{students.length} Total</span>
          </div>

          <div className="space-y-4">
            {loading ? (
              [1,2,3,4].map(i => (
                <div key={i} className="h-32 bg-gray-50 rounded-[2.5rem] animate-pulse"></div>
              ))
            ) : students.map((s) => {
              const isOverdue = s.next_payment_date && new Date(s.next_payment_date) < new Date()
              const isSelected = selectedStudent?.id === s.id
              return (
                <button 
                  key={s.id}
                  onClick={() => setSelectedStudent(s)}
                  className={`w-full p-8 rounded-[3rem] border-2 text-left transition-all duration-500 relative group overflow-hidden ${
                    isSelected 
                    ? 'bg-[#1A1A1A] border-black text-white shadow-2xl shadow-gray-300 -translate-y-1' 
                    : 'bg-white border-gray-100 hover:border-blue-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-colors ${
                        isSelected ? 'bg-white/10 text-white' : 'bg-gray-50 text-blue-600'
                      }`}>
                        {s.name[0]}
                      </div>
                      <div>
                        <p className="font-black text-lg">{s.name} 학생</p>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-gray-500' : 'text-gray-400'}`}>
                          Due: {s.next_payment_date ? new Date(s.next_payment_date).toLocaleDateString() : '미지정'}
                        </p>
                      </div>
                    </div>
                    {isOverdue && (
                      <span className="bg-red-500 text-white text-[9px] font-black px-3 py-1.5 rounded-full animate-pulse shadow-lg shadow-red-500/20">OVERDUE</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-full ${
                      isSelected ? 'bg-white/5 text-gray-400' : 'bg-gray-50 text-gray-500'
                    }`}>
                      Regular Plan
                    </span>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMarkAsPaid(s)
                        }}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          isSelected ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                        }`}
                      >
                        {isSelected ? <CheckCircle2 className="w-4 h-4 mx-auto" /> : '수납 완료'}
                      </button>
                      <ArrowUpRight className={`w-4 h-4 transition-all duration-500 ${isSelected ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right: AI Guidance Console */}
        <div className="lg:col-span-2">
          {selectedStudent ? (
            <div className="bg-white rounded-[4rem] border border-gray-100 shadow-sm p-12 space-y-10 animate-in fade-in slide-in-from-right-8 duration-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center group">
                    <Sparkles className="w-10 h-10 text-emerald-600 group-hover:rotate-12 transition-transform" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tight">{selectedStudent.name} 학생 전용 AI 안내</h3>
                    <p className="text-sm font-bold text-gray-400">학부모님의 성향과 학생의 성과를 조합한 맞춤형 안내</p>
                  </div>
                </div>
              </div>

              {/* Advanced Tone Selector */}
              <div className="grid grid-cols-3 gap-4 relative z-10">
                <ToneButton label="정중하게" onClick={() => generateReminder(selectedStudent, 'polite')} active={generating} />
                <ToneButton label="친근하게" onClick={() => generateReminder(selectedStudent, 'friendly')} active={generating} />
                <ToneButton label="명확하게" onClick={() => generateReminder(selectedStudent, 'professional')} active={generating} />
              </div>

              {/* Premium Message Console */}
              <div className="relative group z-10">
                <div className={`w-full min-h-[400px] bg-[#F8F9FA] border-2 border-dashed border-gray-200 rounded-[3rem] p-10 text-gray-700 text-base font-medium leading-relaxed transition-all duration-500 ${
                  generating ? 'opacity-30' : 'opacity-100'
                }`}>
                  {generating ? (
                    <div className="h-full flex flex-col items-center justify-center gap-6 text-center mt-20">
                      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="font-black text-gray-400 uppercase tracking-widest text-xs">AI Composer is working...</p>
                    </div>
                  ) : aiMessage ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <pre className="whitespace-pre-wrap font-sans text-lg">{aiMessage}</pre>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-6 text-center mt-20 opacity-30">
                      <MessageSquare className="w-12 h-12 text-gray-400" />
                      <p className="font-black text-gray-400 uppercase tracking-widest text-xs">상단 버튼을 눌러 안내 문구를 생성하세요</p>
                    </div>
                  )}
                </div>

                {aiMessage && !generating && (
                  <button 
                    onClick={copyToClipboard}
                    className="absolute bottom-8 right-8 px-10 py-5 bg-[#0066FF] text-white rounded-[2rem] font-black text-sm flex items-center gap-3 hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/30 active:scale-95"
                  >
                    <Copy className="w-4 h-4" />
                    안내 문구 복사하기
                  </button>
                )}
              </div>

              <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 flex items-start gap-6 relative z-10">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                  <AlertCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-blue-800 uppercase tracking-[0.2em] mb-2">Professional Tip</p>
                  <p className="text-sm font-bold text-blue-700/70 leading-relaxed">
                    본 안내 문구는 학생의 긍정적인 성장을 서두에 언급하여 학부모님의 수납 저항감을 낮추도록 설계되었습니다. 
                    복사 후 카카오톡이나 문자로 간편하게 전달하세요.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[600px] bg-gray-50 rounded-[4rem] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center text-center p-12">
              <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center shadow-sm mb-8">
                <CreditCard className="w-10 h-10 text-gray-200" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">대상 학생을 선택하세요</h3>
              <p className="text-gray-400 font-bold max-w-xs">좌측 리스트에서 결제 안내가 필요한 원생을 선택하면 AI가 즉시 도움을 드립니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ToneButton({ label, onClick, active }: any) {
  return (
    <button 
      disabled={active}
      onClick={onClick}
      className="py-5 bg-white border border-gray-100 rounded-[2rem] font-black text-xs text-gray-900 hover:border-blue-600 hover:text-blue-600 hover:shadow-xl hover:shadow-blue-50 transition-all active:scale-95 disabled:opacity-30"
    >
      {label}
    </button>
  )
}
