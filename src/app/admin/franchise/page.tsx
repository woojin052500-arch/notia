'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  Building2, 
  Users, 
  TrendingUp, 
  CreditCard, 
  ChevronRight, 
  ArrowUpRight,
  Globe,
  MapPin,
  Plus
} from 'lucide-react'
import Link from 'next/link'

export default function FranchiseOverviewPage() {
  const [academies, setAcademies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchFranchiseData = async () => {
      // Fetch all academies owned by the current user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('academies')
          .select('*')
          .eq('owner_id', user.id)
        
        if (data) setAcademies(data)
      }
      setLoading(false)
    }
    fetchFranchiseData()
  }, [])

  const totalStudents = academies.length * 45 // Mock aggregation
  const totalRevenue = academies.length * 12500000 // Mock aggregation

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black text-[#1A1A1A] mb-2 tracking-tight flex items-center gap-3">
            <Globe className="w-8 h-8 text-blue-600" />
            프랜차이즈 통합 대시보드
          </h1>
          <p className="text-gray-500 font-bold">운영 중인 모든 지점의 현황을 실시간으로 분석합니다.</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
          <Plus className="w-5 h-5" />
          신규 지점 추가
        </button>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <FranchiseStatCard label="운영 지점 수" value={`${academies.length}개`} icon={<Building2 />} color="text-blue-600" bgColor="bg-blue-50" />
        <FranchiseStatCard label="총 원생 수" value={`${totalStudents.toLocaleString()}명`} icon={<Users />} color="text-orange-600" bgColor="bg-orange-50" />
        <FranchiseStatCard label="이번 달 합산 매출" value={`₩${totalRevenue.toLocaleString()}`} icon={<CreditCard />} color="text-green-600" bgColor="bg-green-50" />
      </div>

      {/* Branch List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {academies.map((academy) => (
          <div key={academy.id} className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-50 rounded-[1.5rem] flex items-center justify-center border border-gray-100">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#1A1A1A]">{academy.name}</h3>
                  <p className="text-sm font-bold text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {academy.slug}.notia.io
                  </p>
                </div>
              </div>
              <Link 
                href={`/admin/dashboard?branch=${academy.id}`}
                className="p-4 bg-gray-50 text-gray-400 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-50">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Students</p>
                <p className="text-lg font-black text-gray-900">45명</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Growth</p>
                <p className="text-lg font-black text-green-600 flex items-center gap-1">
                  +12% <TrendingUp className="w-4 h-4" />
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Plan</p>
                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                  {academy.plan_type}
                </span>
              </div>
            </div>
          </div>
        ))}

        {academies.length === 0 && (
          <div className="lg:col-span-2 py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200 text-center">
            <Building2 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold">등록된 지점이 없습니다. 신규 지점을 추가해 보세요.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function FranchiseStatCard({ label, value, icon, color, bgColor }: any) {
  return (
    <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-32 h-32 ${bgColor} opacity-20 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform`}></div>
      <div className={`w-14 h-14 ${bgColor} rounded-2xl flex items-center justify-center mb-6`}>
        <div className={color}>{icon}</div>
      </div>
      <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">{label}</p>
      <h3 className="text-3xl font-black text-gray-900 tracking-tighter">{value}</h3>
    </div>
  )
}
