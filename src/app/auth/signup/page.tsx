'use client'
// Rebuild trigger: 2026-05-10
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Building, ArrowRight, Loader2, User } from 'lucide-react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [academyName, setAcademyName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { full_name: fullName },
        emailRedirectTo: `${location.origin}/auth/callback` 
      }
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      // Create profile record
      await supabase.from('profiles').insert([{
        id: authData.user.id,
        full_name: fullName,
        email: email,
        phone: phone
      }])

      const slug = academyName.toLowerCase().replace(/ /g, '-') + '-' + Math.random().toString(36).substring(2, 7)
      const { error: dbError } = await supabase
        .from('academies')
        .insert([{ 
          owner_id: authData.user.id, 
          name: academyName, 
          slug: slug,
          status: 'pending',
          plan_type: 'premium'
        }])

      if (dbError) {
        setError(dbError.message)
        setLoading(false)
      } else {
        alert('회원가입 성공! 이메일을 확인하여 인증을 완료해 주세요.')
        router.push('/auth/login')
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-blob"></div>
        <div className="absolute top-40 -left-40 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-emerald-600 rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl border border-white/10 mb-6 backdrop-blur-md">
          <Building className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-4xl font-black text-white tracking-tight">Notia 시작하기</h2>
        <p className="mt-3 text-gray-400 font-medium text-lg">월 1,990원으로 학원 운영의 새로운 기준을 경험하세요.</p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/10 backdrop-blur-xl py-10 px-8 shadow-2xl shadow-black/50 rounded-[2.5rem] border border-white/20">
          <form className="space-y-6" onSubmit={handleSignup}>
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">원장님 성함</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 rounded-2xl border border-white/10 text-white placeholder-gray-500 focus:bg-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20 transition-all font-medium outline-none"
                  placeholder="예: 홍길동"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">원장님 휴대전화 번호</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 rounded-2xl border border-white/10 text-white placeholder-gray-500 focus:bg-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20 transition-all font-medium outline-none"
                  placeholder="숫자만 입력 (예: 01012345678)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">학원명</label>
              <div className="relative group">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="text"
                  required
                  value={academyName}
                  onChange={(e) => setAcademyName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 rounded-2xl border border-white/10 text-white placeholder-gray-500 focus:bg-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20 transition-all font-medium outline-none"
                  placeholder="예: 노티아 수학학원"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">이메일 주소</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 rounded-2xl border border-white/10 text-white placeholder-gray-500 focus:bg-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20 transition-all font-medium outline-none"
                  placeholder="admin@academy.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">비밀번호</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 rounded-2xl border border-white/10 text-white placeholder-gray-500 focus:bg-white/10 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20 transition-all font-medium outline-none"
                  placeholder="8자 이상 입력"
                />
              </div>
            </div>

            {error && <div className="text-red-400 text-sm font-bold bg-red-500/10 border border-red-500/20 p-4 rounded-xl">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-bold rounded-2xl hover:from-blue-500 hover:to-indigo-500 transition-all shadow-xl shadow-blue-900/50 disabled:opacity-50 border border-blue-500/50"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <>프리미엄 회원가입 완료하기 <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/auth/login" className="text-sm text-blue-400 font-bold hover:text-blue-300 hover:underline transition-colors">
              이미 계정이 있으신가요? 로그인하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
