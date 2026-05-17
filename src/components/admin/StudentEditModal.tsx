'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  X, 
  User, 
  Phone, 
  MessageSquare, 
  Loader2, 
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  Edit3,
  BookOpen,
  Plus
} from 'lucide-react'

interface StudentEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  student: any
}

export default function StudentEditModal({ isOpen, onClose, onSuccess, student }: StudentEditModalProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [school, setSchool] = useState('')
  const [grade, setGrade] = useState('')
  const [memo, setMemo] = useState('')
  const [nextPaymentDate, setNextPaymentDate] = useState('')
  const [travelTime, setTravelTime] = useState('15')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  // Textbooks
  const [availableTextbooks, setAvailableTextbooks] = useState<any[]>([])
  const [studentTextbooks, setStudentTextbooks] = useState<any[]>([])
  const [selectedTextbookId, setSelectedTextbookId] = useState('')
  const [dispensing, setDispensing] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (student) {
      setName(student.name || '')
      setPhone(student.parent_phone || '')
      setSchool(student.school || '')
      setGrade(student.grade || '')
      setMemo(student.memo || '')
      setNextPaymentDate(student.next_payment_date || '')
      setTravelTime(student.estimated_travel_time?.toString() || '15')
      
      fetchTextbooks(student.academy_id, student.id)
    }
  }, [student])

  const fetchTextbooks = async (academyId: string, studentId: string) => {
    // Get all textbooks for academy
    const { data: tbData } = await supabase
      .from('textbooks')
      .select('*')
      .eq('academy_id', academyId)
    
    setAvailableTextbooks(tbData || [])

    // Get student's textbooks
    const { data: stData } = await supabase
      .from('student_textbooks')
      .select('*')
      .eq('student_id', studentId)
      .order('given_at', { ascending: false })
    
    setStudentTextbooks(stData || [])
  }

  const handleDispenseTextbook = async () => {
    if (!selectedTextbookId || !student) return
    setDispensing(true)

    const textbook = availableTextbooks.find(tb => tb.id === selectedTextbookId)
    if (!textbook) return

    try {
      const { error: dispenseError } = await supabase
        .from('student_textbooks')
        .insert([{
          student_id: student.id,
          textbook_id: textbook.id,
          academy_id: student.academy_id,
          textbook_name: textbook.name,
          textbook_price: textbook.price,
          is_billed: false
        }])

      if (dispenseError) throw dispenseError
      
      await fetchTextbooks(student.academy_id, student.id)
      setSelectedTextbookId('')
    } catch (err: any) {
      alert('교재 지급 중 오류: ' + err.message)
    } finally {
      setDispensing(false)
    }
  }

  if (!isOpen || !student) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: updateError } = await supabase
      .from('students')
      .update({
        name,
        parent_phone: phone,
        school,
        grade,
        memo,
        next_payment_date: nextPaymentDate || null,
        estimated_travel_time: parseInt(travelTime) || 15
      })
      .eq('id', student.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
    } else {
      setIsSuccess(true)
      setTimeout(() => {
        onSuccess()
        setIsSuccess(false)
        onClose()
      }, 1500)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-8 pb-4 flex justify-between items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-wider mb-2">
              Modification
            </div>
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Edit3 className="w-6 h-6 text-indigo-600" />
              학생 정보 수정
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-900"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 pt-2 space-y-4 custom-scrollbar">
          {/* Input Fields */}
          <div className="space-y-4">
            {/* 학생 이름 & 학부모 연락처 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-500 mb-1.5 ml-1">학생 이름</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input
                    required
                    type="text"
                    placeholder="이름"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-600 transition-all font-bold text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 mb-1.5 ml-1">학부모 연락처</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input
                    required
                    type="tel"
                    placeholder="010-0000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-600 transition-all font-bold text-xs"
                  />
                </div>
              </div>
            </div>

            {/* 학교 & 학년 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-500 mb-1.5 ml-1">학교</label>
                <input
                  type="text"
                  placeholder="학교명"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full px-3 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-600 transition-all font-bold text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 mb-1.5 ml-1">학년</label>
                <input
                  type="text"
                  placeholder="학년"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-600 transition-all font-bold text-xs"
                />
              </div>
            </div>

            {/* 메모 (선택사항) */}
            <div>
              <label className="block text-xs font-black text-gray-500 mb-1.5 ml-1">메모 (선택사항)</label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-300" />
                <textarea
                  rows={2}
                  placeholder="학생 특이사항이나 정보를 입력하세요"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-600 transition-all font-bold text-xs resize-none"
                ></textarea>
              </div>
            </div>

            {/* 원비 결제일 & 안심 귀가 시간 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100/50 flex flex-col justify-between">
                <label className="block text-[10px] font-black text-orange-700 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  원비 결제일 설정
                </label>
                <input
                  type="date"
                  value={nextPaymentDate}
                  onChange={(e) => setNextPaymentDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-none rounded-xl focus:ring-2 focus:ring-orange-600 transition-all font-bold text-[11px] text-orange-950 shadow-sm"
                />
              </div>

              <div className="p-4 bg-green-50/50 rounded-2xl border border-green-100/50 flex flex-col justify-between">
                <label className="block text-[10px] font-black text-green-700 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  안심 귀가 시간
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={travelTime}
                    onChange={(e) => setTravelTime(e.target.value)}
                    placeholder="15"
                    className="w-16 px-3 py-2 bg-white border-none rounded-xl focus:ring-2 focus:ring-green-600 transition-all font-bold text-[11px] text-green-950 shadow-sm text-center"
                  />
                  <span className="text-[10px] font-bold text-green-700">분 소요</span>
                </div>
              </div>
            </div>

            {/* Textbook Section */}
            <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
              <label className="block text-sm font-black text-blue-700 mb-3 ml-1 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                교재 지급 및 내역
              </label>
              
              <div className="flex gap-2 mb-4">
                <select
                  value={selectedTextbookId}
                  onChange={(e) => setSelectedTextbookId(e.target.value)}
                  className="flex-1 px-4 py-3 bg-white border-none rounded-2xl focus:ring-2 focus:ring-blue-600 transition-all font-bold text-gray-900 shadow-sm"
                >
                  <option value="">교재를 선택하세요</option>
                  {availableTextbooks.map(tb => (
                    <option key={tb.id} value={tb.id}>{tb.name} ({tb.price.toLocaleString()}원)</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleDispenseTextbook}
                  disabled={!selectedTextbookId || dispensing}
                  className="px-4 py-3 bg-blue-600 text-white rounded-2xl font-black flex items-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {dispensing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  지급
                </button>
              </div>

              {studentTextbooks.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <ul className="divide-y divide-gray-50 max-h-40 overflow-y-auto">
                    {studentTextbooks.map(st => (
                      <li key={st.id} className="p-3 flex items-center justify-between text-sm">
                        <div>
                          <p className="font-bold text-gray-900">{st.textbook_name}</p>
                          <p className="text-xs text-gray-400">{new Date(st.given_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">{st.textbook_price.toLocaleString()}원</p>
                          <p className={`text-[10px] font-black uppercase ${st.is_billed ? 'text-green-500' : 'text-orange-500'}`}>
                            {st.is_billed ? '청구완료' : '미청구'}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          {isSuccess && (
            <div className="p-4 bg-green-50 text-green-600 rounded-2xl flex items-center gap-3 text-sm font-bold border border-green-100 animate-in slide-in-from-bottom-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              학생 정보가 수정되었습니다!
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || isSuccess}
            className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 disabled:opacity-50 active:scale-95 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isSuccess ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <>
                <Edit3 className="w-5 h-5" />
                학생 정보 수정 완료
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
