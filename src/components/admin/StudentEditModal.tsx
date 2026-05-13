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
  Edit3
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
    }
  }, [student])

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
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
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

        <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-6">
          {/* Input Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">학생 이름</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                <input
                  required
                  type="text"
                  placeholder="학생의 본명을 입력하세요"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">학부모 연락처</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                <input
                  required
                  type="tel"
                  placeholder="010-0000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">학교</label>
                <input
                  type="text"
                  placeholder="학교명"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">학년</label>
                <input
                  type="text"
                  placeholder="학년"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">메모 (선택사항)</label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-gray-300" />
                <textarea
                  rows={3}
                  placeholder="학생에 대한 특징이나 정보를 입력하세요"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-600 transition-all font-medium resize-none"
                ></textarea>
              </div>
            </div>

            <div className="p-6 bg-orange-50/50 rounded-3xl border border-orange-100">
              <label className="block text-sm font-black text-orange-700 mb-3 ml-1 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                원비 결제일 설정
              </label>
              <input
                type="date"
                value={nextPaymentDate}
                onChange={(e) => setNextPaymentDate(e.target.value)}
                className="w-full px-5 py-4 bg-white border-none rounded-2xl focus:ring-2 focus:ring-orange-600 transition-all font-bold text-orange-900 shadow-sm"
              />
            </div>

            <div className="p-6 bg-green-50/50 rounded-3xl border border-green-100">
              <label className="block text-sm font-black text-green-700 mb-3 ml-1 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4" />
                안심 귀가 소요 시간 (분)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={travelTime}
                  onChange={(e) => setTravelTime(e.target.value)}
                  placeholder="15"
                  className="w-24 px-5 py-4 bg-white border-none rounded-2xl focus:ring-2 focus:ring-green-600 transition-all font-bold text-green-900 shadow-sm"
                />
                <span className="text-sm font-bold text-green-700">분 소요 예정</span>
              </div>
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
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 disabled:opacity-50 active:scale-95"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : isSuccess ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <>
                <Edit3 className="w-6 h-6" />
                학생 정보 수정 완료
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
