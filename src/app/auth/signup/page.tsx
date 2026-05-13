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
        email: email
      }])

      const slug = academyName.toLowerCase().replace(/ /g, '-') + '-' + Math.random().toString(36).substring(2, 7)
      const { error: dbError } = await supabase
        .from('academies')
        .insert([{ 
          owner_id: authData.user.id, 
          name: academyName, 
          slug: slug,
          status: 'pending',
          plan_type: 'starter'
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
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-black text-[#1A1A1A]">Notia 시작하기</h2>
        <p className="mt-2 text-[#666666] font-medium">월 1,990원으로 학원의 운영 효율을 200% 높이세요.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-8 shadow-2xl shadow-blue-100/50 rounded-[2.5rem] border border-gray-100">
          <form className="space-y-6" onSubmit={handleSignup}>
            <div>
              <label className="block text-sm font-bold text-[#333333] mb-2">원장님 성함</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#CCCCCC]" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-[#F8F9FA] rounded-2xl border-none focus:ring-2 focus:ring-[#0066FF] transition-all font-medium"
                  placeholder="예: 홍길동"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#333333] mb-2">학원명</label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#CCCCCC]" />
                <input
                  type="text"
                  required
                  value={academyName}
                  onChange={(e) => setAcademyName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-[#F8F9FA] rounded-2xl border-none focus:ring-2 focus:ring-[#0066FF] transition-all font-medium"
                  placeholder="예: 노티아 수학학원"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#333333] mb-2">이메일 주소</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#CCCCCC]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-[#F8F9FA] rounded-2xl border-none focus:ring-2 focus:ring-[#0066FF] transition-all font-medium"
                  placeholder="admin@academy.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#333333] mb-2">비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#CCCCCC]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-[#F8F9FA] rounded-2xl border-none focus:ring-2 focus:ring-[#0066FF] transition-all font-medium"
                  placeholder="8자 이상 입력"
                />
              </div>
            </div>

            {error && <div className="text-red-500 text-sm font-bold bg-red-50 p-4 rounded-xl">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 bg-[#0066FF] text-white text-lg font-bold rounded-2xl hover:bg-[#0052CC] transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <>회원가입 완료하기 <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/auth/login" className="text-sm text-[#0066FF] font-bold hover:underline">
              이미 계정이 있으신가요? 로그인하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
