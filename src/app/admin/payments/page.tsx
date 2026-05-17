'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  CreditCard, 
  Calendar, 
  MessageSquare, 
  Copy, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  ChevronLeft,
  BookOpen,
  Plus,
  Trash2,
  Loader2,
  Send
} from 'lucide-react'

export default function PaymentManagementPage() {
  const [students, setStudents] = useState<any[]>([])
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [aiMessage, setAiMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [sendingSms, setSendingSms] = useState(false)
  
  // Textbook management states
  const [studentTextbooks, setStudentTextbooks] = useState<any[]>([])
  const [availableTextbooks, setAvailableTextbooks] = useState<any[]>([])
  const [selectedTextbookId, setSelectedTextbookId] = useState('')
  const [dispensing, setDispensing] = useState(false)

  const supabase = createClient()

  // Fetch student list
  const fetchStudents = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('students')
      .select('*')
      .order('next_payment_date', { ascending: true })
    
    if (data) setStudents(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  // Fetch student's textbooks when selected student changes
  useEffect(() => {
    if (selectedStudent) {
      const fetchStudentTextbooks = async () => {
        const { data } = await supabase
          .from('student_textbooks')
          .select('*')
          .eq('student_id', selectedStudent.id)
          .order('given_at', { ascending: false })
        setStudentTextbooks(data || [])
      }
      fetchStudentTextbooks()
    }
  }, [selectedStudent])

  // Fetch all available textbooks for the academy
  useEffect(() => {
    const fetchAllTextbooks = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: academyRows } = await supabase
        .from('academies')
        .select('*')
        .eq('owner_id', user.id)
        .limit(1)
      const academyData = academyRows && academyRows[0]
      if (academyData) {
        const { data } = await supabase
          .from('textbooks')
          .select('*')
          .eq('academy_id', academyData.id)
        setAvailableTextbooks(data || [])
      }
    }
    fetchAllTextbooks()
  }, [])

  // Generate AI Reminder Message
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

  const handleSendSms = async () => {
    if (!selectedStudent || !aiMessage) return
    setSendingSms(true)
    try {
      const res = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedStudent.parent_phone,
          text: aiMessage
        })
      })
      const data = await res.json()
      if (data.success) {
        if (data.mode === 'live') {
          alert('솔라피를 통해 학부모님께 실시간 문자 메시지가 성공적으로 발송되었습니다!')
        } else {
          alert('데모 체험 모드: 솔라피 문자 메시지 전송 시뮬레이션이 완료되었습니다!\n(발송 번호 설정 시 실시간으로 발송됩니다)')
        }
      } else {
        alert('문자 발송 실패: ' + (data.error || '알 수 없는 오류'))
      }
    } catch (err: any) {
      console.error(err)
      alert('문자 발송 중 오류가 발생했습니다: ' + err.message)
    } finally {
      setSendingSms(false)
    }
  }

  // Charge a new textbook fee
  const handleAddTextbookFee = async () => {
    if (!selectedTextbookId || !selectedStudent) return
    setDispensing(true)
    const textbook = availableTextbooks.find(tb => tb.id === selectedTextbookId)
    if (!textbook) return

    try {
      const { error } = await supabase
        .from('student_textbooks')
        .insert([{
          student_id: selectedStudent.id,
          textbook_id: textbook.id,
          academy_id: selectedStudent.academy_id,
          textbook_name: textbook.name,
          textbook_price: textbook.price,
          is_billed: false
        }])

      if (error) throw error

      // Refresh student's textbooks list
      const { data } = await supabase
        .from('student_textbooks')
        .select('*')
        .eq('student_id', selectedStudent.id)
        .order('given_at', { ascending: false })
      setStudentTextbooks(data || [])
      setSelectedTextbookId('')
      alert('교재비 청구가 완료되었습니다!')
    } catch (err: any) {
      alert('교재비 청구 중 오류가 발생했습니다: ' + err.message)
    } finally {
      setDispensing(false)
    }
  }

  // Delete a textbook charge
  const handleDeleteTextbookFee = async (id: string) => {
    if (!confirm('해당 교재비 청구 내역을 삭제하시겠습니까?')) return
    
    const { error } = await supabase
      .from('student_textbooks')
      .delete()
      .eq('id', id)

    if (!error) {
      setStudentTextbooks(prev => prev.filter(t => t.id !== id))
      alert('교재비 청구가 성공적으로 삭제되었습니다.')
    } else {
      alert('교재비 삭제 중 오류가 발생했습니다.')
    }
  }

  // Confirm standard tuition fee + textbook payment
  const handleMarkAsPaid = async (student: any) => {
    if (!confirm(`${student.name} 학생의 원비 및 모든 미청구 교재비 수납을 확인하셨습니까?\n원비 결제 예정일이 1달 뒤로 연장되고 미청구 교재비가 수납 완료 처리됩니다.`)) return
    
    setLoading(true)
    const currentDate = student.next_payment_date ? new Date(student.next_payment_date) : new Date()
    const nextMonth = new Date(currentDate)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    
    const { error } = await supabase
      .from('students')
      .update({ next_payment_date: nextMonth.toISOString().split('T')[0] })
      .eq('id', student.id)
    
    // Mark textbooks as billed
    await supabase
      .from('student_textbooks')
      .update({ is_billed: true })
      .eq('student_id', student.id)
      .eq('is_billed', false)
    
    // Refresh student textbooks
    if (selectedStudent && selectedStudent.id === student.id) {
      const { data } = await supabase
        .from('student_textbooks')
        .select('*')
        .eq('student_id', student.id)
        .order('given_at', { ascending: false })
      setStudentTextbooks(data || [])
    }
    
    if (!error) {
      setStudents(prev => prev.map(s => 
        s.id === student.id ? { ...s, next_payment_date: nextMonth.toISOString().split('T')[0] } : s
      ))
      alert('원비 및 교재비 수납 처리가 완료되었습니다.')
    } else {
      alert('수납 처리 중 오류가 발생했습니다.')
    }
    setLoading(false)
  }

  // Cost calculation
  const unbilledTextbooks = studentTextbooks.filter(tb => !tb.is_billed)
  const unbilledTextbookSum = unbilledTextbooks.reduce((acc, curr) => acc + curr.textbook_price, 0)
  const baseTuition = 190000 // 19만원 기본 원비
  const totalSum = baseTuition + unbilledTextbookSum

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
          <p className="text-gray-400 font-bold">미납 방지를 위한 스마트 안내 문구를 생성하고 결제 현황을 실시간으로 추적하세요.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        {/* Left: Interactive Student List */}
        <div className={`lg:col-span-1 space-y-6 ${selectedStudent ? 'hidden lg:block' : 'block'}`}>
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
                      Premium Plan
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

        {/* Right: Smart Payment Assistant & Textbook Fee Billing */}
        <div className={`lg:col-span-2 ${selectedStudent ? 'block' : 'hidden lg:block'}`}>
          {selectedStudent ? (
            <div className="bg-white rounded-[2.5rem] md:rounded-[4rem] border border-gray-100 shadow-sm p-6 md:p-12 space-y-8 md:space-y-10 animate-in fade-in slide-in-from-right-8 duration-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
              
              <button 
                onClick={() => setSelectedStudent(null)}
                className="flex items-center gap-2 text-gray-400 hover:text-gray-900 font-bold mb-4 lg:hidden"
              >
                <ChevronLeft className="w-5 h-5" />
                목록으로 돌아가기
              </button>

              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center group">
                    <Sparkles className="w-10 h-10 text-emerald-600 group-hover:rotate-12 transition-transform" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tight">{selectedStudent.name} 학생 청구 관리</h3>
                    <p className="text-sm font-bold text-gray-400">교재비와 기본 수납 원비를 안전하게 합산하고 AI 청구 대본을 생성하세요.</p>
                  </div>
                </div>
              </div>

              {/* Textbook Fee Charging Section */}
              <div className="bg-[#F8F9FA] rounded-[2.5rem] p-8 border border-gray-100 space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-black text-gray-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    교재비 개별 청구
                  </h4>
                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full uppercase tracking-wider">
                    Textbook Billing
                  </span>
                </div>

                {/* Billing Summary Box */}
                <div className="grid grid-cols-3 gap-4 bg-white p-6 rounded-2xl border border-gray-100">
                  <div className="text-center border-r border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">기본 수업료</p>
                    <p className="text-lg font-black text-gray-900">{baseTuition.toLocaleString()}원</p>
                  </div>
                  <div className="text-center border-r border-gray-100">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">미청구 교재비</p>
                    <p className="text-lg font-black text-indigo-600">{unbilledTextbookSum.toLocaleString()}원</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">총 청구 합산</p>
                    <p className="text-lg font-black text-emerald-600">{totalSum.toLocaleString()}원</p>
                  </div>
                </div>

                {/* Add Textbook Form */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <select 
                    value={selectedTextbookId}
                    onChange={(e) => setSelectedTextbookId(e.target.value)}
                    className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl font-bold text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  >
                    <option value="">청구할 교재를 선택해 주세요...</option>
                    {availableTextbooks.map(tb => (
                      <option key={tb.id} value={tb.id}>
                        {tb.name} ({tb.price.toLocaleString()}원)
                      </option>
                    ))}
                  </select>
                  <button
                    disabled={dispensing || !selectedTextbookId}
                    onClick={handleAddTextbookFee}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-50 transition-all active:scale-95 cursor-pointer"
                  >
                    {dispensing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        교재 청구 추가
                      </>
                    )}
                  </button>
                </div>

                {/* Student's Textbooks List */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">교재 청구 내역 및 상태</p>
                  {studentTextbooks.length === 0 ? (
                    <p className="text-xs text-gray-400 py-4 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                      청구된 교재가 없습니다.
                    </p>
                  ) : (
                    <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {studentTextbooks.map(tb => (
                        <div key={tb.id} className="flex justify-between items-center bg-white px-5 py-3 rounded-xl border border-gray-100 hover:border-indigo-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className={`text-[8px] font-black px-2 py-1 rounded-md ${
                              tb.is_billed 
                                ? 'bg-green-50 text-green-600 border border-green-100' 
                                : 'bg-red-50 text-red-600 border border-red-100'
                            }`}>
                              {tb.is_billed ? '청구 완료' : '미청구'}
                            </span>
                            <span className="text-xs font-bold text-gray-700">{tb.textbook_name}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-black text-gray-900">{tb.textbook_price.toLocaleString()}원</span>
                            {!tb.is_billed && (
                              <button 
                                onClick={() => handleDeleteTextbookFee(tb.id)}
                                className="text-red-400 hover:text-red-600 p-1 rounded-md transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Advanced Tone Selector for AI payment reminder */}
              <div className="space-y-4">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest relative z-10">
                  AI 수납 안내 대본 생성 어조
                </p>
                <div className="grid grid-cols-3 gap-4 relative z-10">
                  <ToneButton label="정중하게" onClick={() => generateReminder(selectedStudent, 'polite')} active={generating} />
                  <ToneButton label="친근하게" onClick={() => generateReminder(selectedStudent, 'friendly')} active={generating} />
                  <ToneButton label="명확하게" onClick={() => generateReminder(selectedStudent, 'professional')} active={generating} />
                </div>
              </div>

              {/* Premium Message Console */}
              <div className="relative group z-10">
                <div className={`w-full min-h-[400px] bg-[#F8F9FA] border-2 border-dashed border-gray-200 rounded-[3rem] p-10 text-gray-700 text-base font-medium leading-relaxed transition-all duration-500 ${
                  generating ? 'opacity-30' : 'opacity-100'
                }`}>
                  {generating ? (
                    <div className="h-full flex flex-col items-center justify-center gap-6 text-center mt-20">
                      <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="font-black text-gray-400 uppercase tracking-widest text-xs">수납 비서가 문구를 작성 중입니다...</p>
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
                  <div className="absolute bottom-8 right-8 flex gap-4">
                    <button 
                      onClick={copyToClipboard}
                      className="px-8 py-5 bg-white text-gray-700 rounded-[2rem] border border-gray-200 font-black text-sm flex items-center gap-2 hover:bg-gray-50 transition-all shadow-md active:scale-95"
                    >
                      <Copy className="w-4 h-4" />
                      안내 문구 복사
                    </button>
                    <button 
                      onClick={handleSendSms}
                      disabled={sendingSms}
                      className="px-8 py-5 bg-[#0066FF] text-white rounded-[2rem] font-black text-sm flex items-center gap-2 hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/30 active:scale-95 disabled:opacity-50"
                    >
                      {sendingSms ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      솔라피로 바로 전송
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 flex items-start gap-6 relative z-10">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                  <AlertCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-blue-800 uppercase tracking-[0.2em] mb-2">Professional Tip</p>
                  <p className="text-sm font-bold text-blue-700/70 leading-relaxed">
                    본 안내 문구는 학생의 긍정적인 성장을 서두에 언급하고 청구된 개별 교재비 합산 내역을 투명하게 안내하여 학부모님의 수납 저항감을 낮추도록 설계되었습니다. 
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
      className="py-5 bg-white border border-gray-100 rounded-[2rem] font-black text-xs text-gray-900 hover:border-blue-600 hover:text-blue-600 hover:shadow-xl hover:shadow-blue-50 transition-all active:scale-95 disabled:opacity-30 cursor-pointer"
    >
      {label}
    </button>
  )
}
