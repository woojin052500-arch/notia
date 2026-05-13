'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  Sparkles, 
  Gift, 
  CheckCircle2, 
  ArrowRight, 
  GraduationCap, 
  Building2,
  Users,
  Star
} from 'lucide-react'

export default function ReferralJoinPage({ params }: { params: { code: string } }) {
  const [referrer, setReferrer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', phone: '' })
  const [submitted, setSubmitted] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchReferrer = async () => {
      const { data } = await supabase
        .from('students')
        .select('name, academies(name)')
        .eq('referral_code', params.code)
        .single()
      
      if (data) setReferrer(data)
      setLoading(false)
    }
    fetchReferrer()
  }, [params.code])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    // In real app, this would save to a 'leads' table or 'students' table with referred_by
  }

  if (loading) return null

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-gray-100">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-12 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/30 shadow-xl">
              <Gift className="w-10 h-10 text-yellow-300" />
            </div>
            <h1 className="text-3xl font-black mb-2 tracking-tight">특별 초대 도착! 🎁</h1>
            <p className="text-purple-100 font-medium">
              {referrer?.name} 학생의 학부모님이 <br />
              <span className="font-black text-white">{referrer?.academies?.name}</span>에 초대하셨습니다.
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-10 space-y-8">
          {!submitted ? (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                  <Star className="w-5 h-5 text-purple-600 fill-purple-600" />
                  <p className="text-sm font-bold text-purple-900">신규 가입 시 첫 달 원비 10,000원 할인!</p>
                </div>
                <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                  <p className="text-sm font-bold text-indigo-900">AI 정밀 학습 리포트 무료 체험권 증정</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">학생 이름</label>
                  <input 
                    type="text" 
                    required
                    placeholder="이름을 입력하세요"
                    className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">학부모 연락처</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="010-0000-0000"
                    className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-5 bg-[#1A1A1A] text-white rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-gray-200 mt-6"
                >
                  초대 수락 및 상담 예약
                  <ArrowRight className="w-6 h-6" />
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-6 py-10 animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">예약이 완료되었습니다!</h2>
                <p className="text-gray-500 font-medium">학원에서 곧 안내 문자를 드릴 예정입니다. <br/> {referrer?.name}님께도 소식을 전달해 드릴게요!</p>
              </div>
              <button 
                onClick={() => setSubmitted(false)}
                className="text-[#0066FF] font-black text-xs uppercase tracking-widest hover:underline"
              >
                뒤로 가기
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-2">
          <GraduationCap className="w-5 h-5 text-[#0066FF]" />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Powered by Notia AI Referral System</p>
        </div>
      </div>
    </div>
  )
}
