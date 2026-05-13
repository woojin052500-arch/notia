'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/admin/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-[#0066FF] rounded-xl flex items-center justify-center text-white font-black text-xl">N</div>
          <span className="text-2xl font-black text-[#1A1A1A] tracking-tighter">Notia</span>
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-[#1A1A1A]">원장님 로그인</h2>
        <p className="mt-2 text-center text-sm text-[#666666]">
          Notia와 함께 학원을 더 스마트하게 운영하세요.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-8 shadow-2xl shadow-blue-100/50 rounded-[2.5rem] border border-gray-100">
          <form className="space-y-6" onSubmit={handleLogin}>
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
                  placeholder="name@example.com"
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
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm font-bold bg-red-50 p-4 rounded-xl">
                이메일 또는 비밀번호가 일치하지 않습니다.
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 bg-[#0066FF] text-white text-lg font-bold rounded-2xl hover:bg-[#0052CC] transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    로그인하기
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-[#666666] font-medium">
              계정이 없으신가요?{' '}
              <Link href="/auth/signup" className="text-[#0066FF] font-bold hover:underline">
                지금 바로 시작하기 (월 1,990원)
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
