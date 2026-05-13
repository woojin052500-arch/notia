'use client'

import { useState, useEffect } from 'react'
import { Settings, User, Bell, Shield, Sparkles, CreditCard, ChevronRight, Building, Laptop, Smartphone } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import PricingModal from '@/components/admin/PricingModal'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [academy, setAcademy] = useState<any>(null)
  const [isPricingOpen, setIsPricingOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single()
        const { data: academyData } = await supabase.from('academies').select('*').eq('owner_id', authUser.id).single()
        setUser(profile || authUser.user_metadata)
        setAcademy(academyData)
      }
    }
    fetchData()
  }, [])

  const handleNotReady = () => alert("해당 기능은 현재 개발 중입니다.")
  
  const handleDeleteAccount = () => {
    if (confirm("정말로 학원 계정을 탈퇴하고 모든 데이터를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.")) {
      alert("탈퇴 요청이 접수되었습니다. 고객센터에서 연락드리겠습니다.")
    }
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header with Title and Description */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-black uppercase tracking-wider mb-4">
          Configuration
        </div>
        <h1 className="text-4xl font-black text-[#1A1A1A] tracking-tight flex items-center gap-3">
          <Settings className="w-10 h-10 text-[#0066FF]" />
          학원 환경 설정
        </h1>
        <p className="text-[#666666] mt-2 font-medium">Notia OS를 학원의 특성에 맞춰 커스터마이징하세요.</p>
      </div>

      <div className="space-y-10">
        {/* Profile Section - Premium Card */}
        <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform"></div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-[#0066FF] to-blue-400 rounded-[2.5rem] flex items-center justify-center shadow-lg shadow-blue-100 border-4 border-white">
                <Building className="w-10 h-10 text-white" />
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-black text-[#1A1A1A]">{academy?.name || '노티아 아카데미'}</h2>
                <p className="text-sm text-[#999999] font-bold mt-1">
                  {academy?.location || '본점'} | 대표: {user?.full_name || '원장 선생님'}
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase ${academy?.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>{academy?.status || 'Pending'}</span>
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg uppercase">{academy?.plan_type || 'Starter'} Plan</span>
                </div>
              </div>
            </div>
            <button onClick={() => alert("프로필 수정 기능은 준비 중입니다.")} className="px-6 py-3 bg-[#F8F9FA] text-[#1A1A1A] font-black rounded-2xl border border-gray-100 hover:bg-gray-100 transition-all text-sm">
              프로필 수정
            </button>
          </div>
        </section>

        {/* AI & Automation Settings */}
        <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#1A1A1A]">AI 자동화 엔진</h2>
              <p className="text-sm text-[#999999] font-medium">리포트 생성 및 분석 자동화 설정</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ToggleItem 
              title="AI 리포트 문장 교정" 
              description="Claude 3.5가 거친 메모를 정제합니다." 
              defaultChecked 
            />
            <ToggleItem 
              title="하원 즉시 발송" 
              description="QR 스캔 완료 시 학부모님께 자동 발송" 
              defaultChecked 
            />
            <ToggleItem 
              title="심야 알림 제한" 
              description="오후 10시 이후 알림톡 발송 중단" 
            />
            <ToggleItem 
              title="부모님 반응 수집" 
              description="리포트 하단에 리액션 버튼 활성화" 
              defaultChecked 
            />
          </div>
        </section>

        {/* Device & Security Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <MenuCard 
            icon={<Bell className="text-orange-500" />} 
            title="알림 센터" 
            description="알림톡 템플릿 및 Push 설정" 
            count="3"
            onClick={handleNotReady}
          />
          <MenuCard 
            icon={<Shield className="text-green-500" />} 
            title="보안 관리" 
            description="2단계 인증 및 강사 접근 제어" 
            onClick={handleNotReady}
          />
          <MenuCard 
            icon={<CreditCard className="text-[#0066FF]" />} 
            title="요금 및 결제" 
            description="결제 내역 및 요금제 변경" 
            onClick={() => setIsPricingOpen(true)}
          />
          <MenuCard 
            icon={<Laptop className="text-gray-500" />} 
            title="연동 서비스" 
            description="카카오톡, 문자 서비스 연동" 
            onClick={handleNotReady}
          />
        </div>

        {/* Danger Zone */}
        <div className="pt-10 border-t border-gray-100">
          <p className="text-xs font-black text-red-500 uppercase tracking-widest mb-4">Danger Zone</p>
          <button onClick={handleDeleteAccount} className="text-[#999999] text-sm font-bold hover:text-red-500 transition-colors">학원 계정 탈퇴 및 데이터 삭제</button>
        </div>
      </div>
      
      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
    </div>
  )
}

function ToggleItem({ title, description, defaultChecked }: any) {
  const [enabled, setEnabled] = useState(defaultChecked || false)
  return (
    <div className="flex items-center justify-between p-6 bg-[#F8F9FA] rounded-[2rem] border border-transparent hover:border-blue-100 transition-all group">
      <div>
        <p className="font-black text-[#1A1A1A] text-sm mb-1">{title}</p>
        <p className="text-xs text-[#999999] font-medium leading-relaxed">{description}</p>
      </div>
      <div 
        onClick={() => setEnabled(!enabled)}
        className={`w-14 h-8 rounded-full p-1.5 cursor-pointer transition-all ${enabled ? 'bg-[#0066FF]' : 'bg-gray-200'}`}
      >
        <div className={`w-5 h-5 bg-white rounded-full transition-all shadow-sm ${enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
      </div>
    </div>
  )
}

function MenuCard({ icon, title, description, count, onClick }: any) {
  return (
    <div onClick={onClick} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:border-[#0066FF] transition-all cursor-pointer group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 transition-all border border-gray-50 group-hover:border-blue-100">
            {icon}
          </div>
          <div>
            <h3 className="font-black text-[#1A1A1A] text-base mb-1">{title}</h3>
            <p className="text-xs text-[#999999] font-medium">{description}</p>
          </div>
        </div>
        {count ? (
          <span className="w-6 h-6 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">{count}</span>
        ) : (
          <ChevronRight className="w-5 h-5 text-[#CCCCCC] group-hover:text-[#0066FF] transition-all group-hover:translate-x-1" />
        )}
      </div>
    </div>
  )
}
