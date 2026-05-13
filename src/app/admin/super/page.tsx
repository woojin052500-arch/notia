'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ShieldCheck, CheckCircle2, XCircle, Clock, Building, Mail, CreditCard } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SuperAdminPage() {
  const [academies, setAcademies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const supabase = createClient()
  const router = useRouter()

  const fetchAcademies = async () => {
    // We need to use a query that bypasses RLS if possible, 
    // but since role='dev' has dev_academy_access, we can just select all
    const { data, error } = await supabase
      .from('academies')
      .select(`
        *,
        profiles!academies_owner_id_fkey (
          email,
          full_name
        )
      `)
      .order('created_at', { ascending: false })
    
    if (data) {
      setAcademies(data)
    } else {
      console.error('Failed to fetch academies', error)
    }
    setIsLoading(false)
  }

  const checkAuthorizationAndFetch = async () => {
    setIsLoading(true)
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      router.push('/')
      return
    }

    setAdminEmail(authUser.email || '')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', authUser.id).single()
    if (profile?.role === 'dev' || authUser.email?.includes('woojin0525')) {
      setIsAuthorized(true)
      fetchAcademies()
    } else {
      setIsAuthorized(false)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuthorizationAndFetch()
  }, [])

  const handleApprove = async (id: string, currentPlan: string) => {
    if (!confirm('해당 학원의 결제를 승인하고 활성화하시겠습니까?')) return

    const { error } = await supabase
      .from('academies')
      .update({ status: 'active' })
      .eq('id', id)

    if (error) {
      alert('승인 처리 중 오류가 발생했습니다.')
    } else {
      alert('정상적으로 승인되었습니다.')
      fetchAcademies()
    }
  }

  const handlePlanChange = async (id: string, newPlan: string) => {
    const { error } = await supabase
      .from('academies')
      .update({ plan_type: newPlan })
      .eq('id', id)

    if (error) {
      alert('요금제 변경 중 오류가 발생했습니다.')
    } else {
      fetchAcademies()
    }
  }

  if (isLoading) return <div className="p-10 text-center font-bold text-gray-500">권한 확인 중...</div>

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-black text-gray-900 mb-2">접근 권한이 없습니다</h1>
        <p className="text-gray-500">Notia 최고 관리자(woojin0525) 전용 페이지입니다.</p>
        <p className="text-sm font-bold text-blue-500 mt-4">현재 계정: {adminEmail}</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-black uppercase tracking-wider mb-4">
          Super Admin
        </div>
        <h1 className="text-4xl font-black text-[#1A1A1A] tracking-tight flex items-center gap-3">
          <ShieldCheck className="w-10 h-10 text-red-500" />
          학원 결제 및 승인 관리
        </h1>
        <p className="text-[#666666] mt-2 font-medium">가입된 모든 학원의 상태를 확인하고 결제 승인을 처리합니다.</p>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">학원 정보</th>
                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">원장 (이메일)</th>
                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">현재 플랜</th>
                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">상태</th>
                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">관리 액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {academies.map((academy) => (
                <tr key={academy.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                        <Building className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-black text-gray-900">{academy.name}</p>
                        <p className="text-xs font-bold text-gray-400 mt-1">{new Date(academy.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">{academy.profiles?.full_name || '미입력'}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Mail className="w-3 h-3" />
                        {academy.profiles?.email || '이메일 없음'}
                      </span>
                    </div>
                  </td>
                  <td className="p-6">
                    <select 
                      value={academy.plan_type || 'starter'}
                      onChange={(e) => handlePlanChange(academy.id, e.target.value)}
                      className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 font-bold outline-none"
                    >
                      <option value="starter">Starter</option>
                      <option value="standard">Standard</option>
                      <option value="pro">Pro</option>
                      <option value="premium">Premium</option>
                    </select>
                  </td>
                  <td className="p-6">
                    {academy.status === 'active' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-black uppercase">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="p-6 text-right">
                    {academy.status !== 'active' ? (
                      <button 
                        onClick={() => handleApprove(academy.id, academy.plan_type)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl transition-all shadow-lg shadow-blue-200"
                      >
                        승인하기
                      </button>
                    ) : (
                      <button 
                        onClick={async () => {
                          if(confirm('이 학원을 차단(대기 상태로 변경)하시겠습니까?')) {
                            await supabase.from('academies').update({ status: 'pending' }).eq('id', academy.id)
                            fetchAcademies()
                          }
                        }}
                        className="px-4 py-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-500 font-black text-xs rounded-xl transition-all"
                      >
                        차단/해제
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              
              {academies.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-500 font-bold">
                    등록된 학원이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
