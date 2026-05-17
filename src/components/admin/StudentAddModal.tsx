'use client'

import { useState } from 'react'
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
  Clock
} from 'lucide-react'

interface StudentAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  academyId: string
}

export default function StudentAddModal({ isOpen, onClose, onSuccess, academyId }: StudentAddModalProps) {
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

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Generate a simple unique QR token (you might want a more robust one in production)
    const qrToken = `qr_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`

    const { error: insertError } = await supabase
      .from('students')
      .insert([
        {
          academy_id: academyId,
          name,
          parent_phone: phone,
          school,
          grade,
          memo,
          qr_token: qrToken,
          status: 'active',
          next_payment_date: nextPaymentDate || null,
          estimated_travel_time: parseInt(travelTime) || 15
        }
      ])

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
    } else {
      setIsSuccess(true)
      setTimeout(() => {
        onSuccess()
        resetForm()
        onClose()
      }, 1500)
    }
  }

  const resetForm = () => {
    setName('')
    setPhone('')
    setMemo('')
    setError(null)
    setIsSuccess(false)
    setLoading(false)
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
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-wider mb-2">
              Registration
            </div>
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <User className="w-6 h-6 text-blue-600" />
              신규 학생 등록
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-900"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
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
                    className="w-full pl-9 pr-3 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600 transition-all font-bold text-xs"
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
                    className="w-full pl-9 pr-3 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600 transition-all font-bold text-xs"
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
                  className="w-full px-3 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600 transition-all font-bold text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 mb-1.5 ml-1">학년</label>
                <input
                  type="text"
                  placeholder="학년"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600 transition-all font-bold text-xs"
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
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-600 transition-all font-bold text-xs resize-none"
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
              학생 등록이 성공적으로 완료되었습니다!
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || isSuccess}
            className="w-full py-3.5 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-50 active:scale-95 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isSuccess ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                학생 등록 완료하기
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="px-6 pb-5 text-center">
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
            QR Token will be generated automatically
          </p>
        </div>
      </div>
    </div>
  )
}
