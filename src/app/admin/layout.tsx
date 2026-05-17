'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Bell,
  Instagram,
  CreditCard,
  Globe,
  QrCode,
  Search,
  Command,
  Lock,
  ShieldCheck,
  BookOpen,
  Menu,
  X as CloseIcon
} from 'lucide-react'
import CommandCenter from '@/components/admin/CommandCenter'
import PricingModal from '@/components/admin/PricingModal'
import UserTutorial from '@/components/admin/UserTutorial'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [authUser, setAuthUser] = useState<any>(null)
  const [academy, setAcademy] = useState<any>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(true)
  const [isPricingOpen, setIsPricingOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const getUserData = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          setAuthUser(authUser)
          
          // 1. 프로필 조회 및 자동 복구 생성
          const { data: profileRows } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .limit(1)
          
          let profile = profileRows && profileRows[0]
          if (!profile) {
            const { data: newProfile, error: createProfError } = await supabase
              .from('profiles')
              .insert([{
                id: authUser.id,
                full_name: authUser.user_metadata?.full_name || '원장 선생님',
                email: authUser.email || '',
                role: 'director'
              }])
              .select()
            
            if (createProfError) {
              console.error('Profile creation error:', createProfError)
            } else if (newProfile && newProfile.length > 0) {
              profile = newProfile[0]
            }
          }
          
          // 2. 학원 조회 및 자동 복구 생성
          const { data: academyRows } = await supabase
            .from('academies')
            .select('*')
            .eq('owner_id', authUser.id)
            .limit(1)
          
          let academyData = academyRows && academyRows[0]
          if (academyData && academyData.plan_type !== 'premium') {
            // 원장님의 요금제를 항상 프리미엄으로 자동 업그레이드 보장!
            const { data: updatedAcad } = await supabase
              .from('academies')
              .update({ plan_type: 'premium' })
              .eq('id', academyData.id)
              .select()
            if (updatedAcad && updatedAcad.length > 0) {
              academyData = updatedAcad[0]
            }
          }
          if (!academyData && profile) { // profile이 데이터베이스에 확실히 생성된 경우에만 진행하여 외래키 에러 방지
            const slug = 'academy-' + Math.random().toString(36).substring(2, 7)
            const { data: newAcademy, error: createAcadError } = await supabase
              .from('academies')
              .insert([{ 
                owner_id: authUser.id, 
                name: '노티아 학원', 
                slug: slug,
                status: 'active',
                plan_type: 'premium'
              }])
              .select()
            
            if (createAcadError) {
              console.error('Academy creation error:', createAcadError)
            } else if (newAcademy && newAcademy.length > 0) {
              academyData = newAcademy[0]
            }
          }
          
          setUser(profile)
          setAcademy(academyData)

          // Subscription Check: if not active, force pricing modal (bypass for dev/woojin0525)
          if (academyData && academyData.status !== 'active' && profile?.role !== 'dev' && !authUser?.email?.includes('woojin0525')) {
            setIsSubscribed(false)
            setIsPricingOpen(true)
          }
        }
      } catch (err) {
        console.error('Error auto-healing layout data:', err)
      }
    }
    getUserData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const planTiers = ['starter', 'standard', 'pro', 'premium']
  const currentPlanIndex = planTiers.indexOf(academy?.plan_type || 'starter')

  const menuItems = [
    { name: '대시보드', href: '/admin/dashboard', icon: LayoutDashboard, minPlan: 'starter' },
    { name: '학생 관리', href: '/admin/students', icon: Users, minPlan: 'starter' },
    { name: '맞춤 리포트', href: '/admin/reports', icon: MessageSquare, minPlan: 'starter' },
    { name: '마케팅 센터', href: '/admin/marketing', icon: Instagram, minPlan: 'pro' },
    { name: '수납 및 결제', href: '/admin/payments', icon: CreditCard, minPlan: 'starter' },
    { name: '교재 관리', href: '/admin/textbooks', icon: BookOpen, minPlan: 'starter' },
    { name: '프랜차이즈', href: '/admin/franchise', icon: Globe, minPlan: 'premium' },
    { name: '설정', href: '/admin/settings', icon: Settings, minPlan: 'starter' },
  ]

  if (user?.role === 'dev' || authUser?.email?.includes('woojin0525')) {
    menuItems.push({ name: '승인 관리(Admin)', href: '/admin/super', icon: ShieldCheck, minPlan: 'starter' })
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[140] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-100 flex flex-col h-screen z-[150] lg:sticky lg:top-0 transition-transform duration-300 lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative w-10 h-10 bg-[#1A1A1A] rounded-xl flex items-center justify-center border border-white/10 shadow-2xl">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4V20M4 20L20 4M20 4V20" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <span className="text-2xl font-black text-[#1A1A1A] tracking-tighter">Notia<span className="text-indigo-600">.</span></span>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              const itemPlanIndex = planTiers.indexOf(item.minPlan)
              const isLocked = user?.role !== 'dev' && !authUser?.email?.includes('woojin0525') && currentPlanIndex < itemPlanIndex
              
              if (isLocked) {
                return (
                  <button
                    key={item.name}
                    onClick={() => setIsPricingOpen(true)}
                    className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl font-semibold text-[#999999] hover:bg-gray-50 hover:text-[#1A1A1A] transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-[#CCCCCC] group-hover:text-[#999999]" />
                      {item.name}
                    </div>
                    <Lock className="w-4 h-4 text-orange-400 opacity-70" />
                  </button>
                )
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-[#0066FF]'
                      : 'text-[#666666] hover:bg-gray-50 hover:text-[#1A1A1A]'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-[#0066FF]' : 'text-[#999999]'}`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="mt-auto p-8 space-y-4">
          <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => setIsPricingOpen(true)}>
            <p className="text-xs font-bold text-[#999999] uppercase tracking-widest mb-2">Current Plan</p>
            <p className="text-sm text-[#1A1A1A] font-black capitalize leading-relaxed flex items-center justify-between">
              {academy?.plan_type || 'Starter'} Plan
              {currentPlanIndex < 2 && <span className="text-[9px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">UPGRADE</span>}
            </p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-[#FF4D4D] font-bold hover:bg-red-50 w-full rounded-2xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            로그아웃
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-100 px-4 md:px-8 flex items-center justify-between sticky top-0 z-[100]">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-gray-400 hover:text-gray-900 lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-[#999999] font-medium">
              <span>Admin</span>
              <span className="text-gray-300">/</span>
              <span className="text-[#1A1A1A]">{menuItems.find(i => i.href === pathname)?.name || '기타'}</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {/* Search Trigger */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-3 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-gray-400 hover:bg-gray-100 transition-all group"
            >
              <Search className="w-4 h-4" />
              <span className="text-xs font-bold">기능 검색...</span>
              <div className="flex items-center gap-1 ml-2 px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[8px] font-black group-hover:border-blue-200 transition-colors">
                <Command className="w-2 h-2" />
                <span>K</span>
              </div>
            </button>

            <Link 
              href="/attendance/scan" 
              className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-full font-black text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 mr-4"
            >
              <QrCode className="w-4 h-4" />
              출결 스캐너 실행
            </Link>
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-[#999999] hover:text-[#1A1A1A] transition-colors focus:outline-none"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-3xl shadow-2xl p-6 z-[200] animate-in fade-in slide-in-from-top-3 duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-black text-[#1A1A1A]">알림 센터</h4>
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-black">새 알림 3개</span>
                  </div>
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50/50 border border-blue-100/50 rounded-2xl flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0 animate-pulse"></div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 leading-snug">Notia 환영합니다! 🎉</p>
                        <p className="text-[10px] text-gray-500 font-medium mt-1">원장님, AI 기반 스마트 학원 관리 OS Notia가 성공적으로 세팅되었습니다.</p>
                      </div>
                    </div>
                    <div className="p-3 bg-green-50/50 border border-green-100/50 rounded-2xl flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 shrink-0 animate-pulse"></div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 leading-snug">출결 스캐너 준비 완료</p>
                        <p className="text-[10px] text-gray-500 font-medium mt-1">스마트 QR 출결 스캐너 시스템이 실시간 대기 상태입니다.</p>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50/50 border border-gray-100/50 rounded-2xl flex items-start gap-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 shrink-0"></div>
                      <div>
                        <p className="text-xs font-bold text-gray-700 leading-snug">스타터 혜택 이용 중</p>
                        <p className="text-[10px] text-gray-500 font-medium mt-1">현재 모든 스마트 기능이 잠금 해제된 프로모션 요금제를 무료로 적용받고 계십니다.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 pl-4 md:pl-6 border-l border-gray-100">
              <div className="text-right hidden xs:block">
                <p className="text-sm font-bold text-[#1A1A1A]">
                  {user?.full_name || authUser?.user_metadata?.full_name || '원장 선생님'}
                </p>
                <p className="text-[11px] text-[#999999]">{academy?.name || '노티아 아카데미'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white shadow-sm overflow-hidden">
                {user?.avatar_url || authUser?.user_metadata?.avatar_url ? (
                  <img src={user?.avatar_url || authUser?.user_metadata?.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-blue-600">
                    {(user?.full_name || authUser?.user_metadata?.full_name || 'N')[0]}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>

      <CommandCenter isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <PricingModal 
        isOpen={isPricingOpen} 
        onClose={() => setIsPricingOpen(false)} 
        isForce={!isSubscribed}
      />
      <UserTutorial />
    </div>
  )
}
