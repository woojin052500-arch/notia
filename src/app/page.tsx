'use client'

import { 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  MessageSquare, 
  Zap, 
  ShieldCheck, 
  ChevronRight,
  Globe,
  Star,
  Activity,
  Layers,
  Shield
} from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500 selection:text-white overflow-x-hidden font-sans">
      {/* Premium Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/40 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-8 h-24 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/20 group-hover:rotate-6 transition-all duration-500">
              <Layers className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-[-0.05em] bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Notia</span>
          </Link>
          <div className="hidden md:flex items-center gap-12">
            <NavLink href="#vision">비전</NavLink>
            <NavLink href="#ecosystem">생태계</NavLink>
            <NavLink href="#pricing">솔루션</NavLink>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/auth/login" className="text-sm font-black text-gray-400 hover:text-white transition-colors tracking-widest uppercase">Login</Link>
            <Link href="/auth/signup" className="px-8 py-3.5 bg-white text-black text-xs font-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5 tracking-widest uppercase">
              Join Notia
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-60 pb-40 px-6 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-blue-600/10 rounded-full blur-[160px] animate-pulse"></div>
        <div className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[140px]"></div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-xs font-black mb-12 tracking-[0.2em] uppercase text-blue-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Beyond Management: The Academy OS</span>
          </div>
          <h1 className="text-7xl md:text-[9rem] font-black tracking-[-0.04em] leading-[0.9] mb-12">
            학원의 격을<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 italic">AI로 완성하다.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 font-medium max-w-3xl mx-auto mb-16 leading-relaxed">
            단순한 관리 툴을 넘어, 인공지능이 학부모 상담부터 성적 분석, <br className="hidden md:block" />
            마케팅까지 책임지는 대한민국 유일의 프리미엄 학원 OS입니다.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/auth/signup" className="px-12 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(37,99,235,0.3)] flex items-center gap-3 group">
              Notia OS 경험하기
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="#ecosystem" className="px-12 py-6 bg-white/5 backdrop-blur-xl border border-white/10 text-white text-lg font-black rounded-full hover:bg-white/10 transition-all flex items-center gap-3">
              생태계 살펴보기
            </Link>
          </div>
        </div>
      </section>

      {/* Ecosystem Section */}
      <section id="ecosystem" className="py-40 px-6 bg-white/0">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-32 items-center">
            <div className="space-y-12">
              <h2 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tighter">
                원장님은 교육에만<br />
                <span className="text-blue-500 underline decoration-8 underline-offset-[12px]">집중하세요.</span>
              </h2>
              <div className="space-y-10">
                <EcosystemItem 
                  icon={<Shield className="w-6 h-6 text-blue-400" />} 
                  title="24/7 AI 상담 및 보호" 
                  description="학부모의 날 선 메시지를 필터링하고, 밤낮없는 상담을 AI가 대신합니다." 
                />
                <EcosystemItem 
                  icon={<Activity className="w-6 h-6 text-emerald-400" />} 
                  title="정밀 성적 분석 리포트" 
                  description="WJedulab AI 연동으로 목표 대학 합격 확률까지 리포트에 담아냅니다." 
                />
                <EcosystemItem 
                  icon={<Globe className="w-6 h-6 text-purple-400" />} 
                  title="바이럴 마케팅 엔진" 
                  description="성과 데이터를 카드뉴스로 자동 전환하고 학부모 추천을 자동화합니다." 
                />
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-600/20 blur-[100px] rounded-full group-hover:bg-blue-600/30 transition-all duration-1000"></div>
              <div className="relative bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[4rem] p-16 shadow-2xl">
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[10px] font-black tracking-widest text-blue-400 uppercase">AI Analytics Mode</span>
                  </div>
                  <div className="space-y-4">
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-blue-600"></div>
                    </div>
                    <p className="text-sm font-medium text-gray-400 leading-relaxed">
                      "최근 민수의 수학 성취도는 상위 5%에 진입했습니다. AI가 분석한 다음 단계 학습은 미적분 심화 과정입니다."
                    </p>
                  </div>
                  <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                    <div className="flex -space-x-3">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-[#050505] bg-gray-800"></div>
                      ))}
                    </div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active in 1,240 Academies</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing - Strategic Solution */}
      <section id="pricing" className="py-40 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter">비즈니스 규모에 맞는<br />최적의 솔루션</h2>
            <p className="text-xl text-gray-500 font-medium">학원 성장의 단계별 파트너가 되어 드립니다.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <PricingCard 
              name="Mini"
              price="1,990"
              description="스마트한 출결 관리의 시작"
              features={["학생 10명 관리", "실시간 QR 출결 알림", "기본 리포트 (텍스트)", "간편 대시보드"]}
            />
            <PricingCard 
              name="Starter"
              price="9,900"
              description="AI로 완성하는 학부모 소통"
              features={["학생 30명 관리", "AI 리포트 (표준형)", "학부모 안심 문자", "월간 통계 분석"]}
            />
            <PricingCard 
              name="Basic"
              price="29,900"
              recommended
              description="학원 운영의 효율을 극대화"
              features={["학생 70명 관리", "AI 리포트 (심화 분석)", "AI 상담 가이드 엔진", "원비 자동 리마인더"]}
            />
            <PricingCard 
              name="Professional"
              price="49,900"
              description="강력한 마케팅과 입시 전략"
              features={["학생 150명 관리", "카드뉴스 자동 생성", "목표 대학 합격 분석", "성과 하이라이트 추출"]}
            />
            <PricingCard 
              name="Premium"
              price="99,900"
              description="최상위 학원의 압도적 경쟁력"
              features={["학생 무제한", "AI 감정 필터링 센터", "커스텀 도메인 브랜딩", "24/7 VIP 기술지원"]}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-32 px-8 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="space-y-6 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-white text-lg tracking-tighter">Notia OS</span>
            </div>
            <p className="text-xs font-bold text-gray-500 leading-relaxed max-w-sm">
              우리는 인공지능 기술을 통해 교육 현장의 번거로운 행정을 자동화하고, 
              선생님이 오직 학생의 성장에만 집중할 수 있는 환경을 만듭니다.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-4">
            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Built for the future of education</p>
            <p className="text-[10px] text-gray-600 font-medium">© 2026 Notia Technologies Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function NavLink({ href, children }: any) {
  return (
    <Link href={href} className="text-[10px] font-black text-gray-500 hover:text-white transition-all uppercase tracking-[0.3em]">{children}</Link>
  )
}

function EcosystemItem({ icon, title, description }: any) {
  return (
    <div className="flex gap-6 group">
      <div className="w-16 h-16 bg-white/[0.03] border border-white/5 rounded-3xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:border-blue-600 transition-all duration-500 shadow-xl">{icon}</div>
      <div>
        <h3 className="font-black text-xl mb-2 group-hover:text-blue-400 transition-colors">{title}</h3>
        <p className="text-gray-500 leading-relaxed font-medium text-sm">{description}</p>
      </div>
    </div>
  )
}

function PricingCard({ name, price, description, features, recommended }: any) {
  return (
    <div className={`p-14 rounded-[4rem] border transition-all duration-700 relative overflow-hidden group ${
      recommended 
      ? 'bg-white text-black shadow-[0_30px_100px_rgba(255,255,255,0.1)] hover:-translate-y-4' 
      : 'bg-white/[0.02] border-white/5 hover:border-white/20 text-white'
    }`}>
      {recommended && (
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
      )}
      <h3 className="text-2xl font-black mb-3">{name}</h3>
      <p className={`text-xs mb-10 font-bold tracking-tight ${recommended ? 'text-gray-500' : 'text-gray-500'}`}>{description}</p>
      <div className="flex items-baseline gap-2 mb-12">
        <span className="text-6xl font-black tracking-tighter">₩{price}</span>
        <span className="text-xs font-black uppercase tracking-widest opacity-40">/ mo</span>
      </div>
      <ul className="space-y-6 mb-16">
        {features.map((f: string) => (
          <li key={f} className="flex items-center gap-4 text-sm font-black tracking-tight">
            <CheckCircle2 className={`w-5 h-5 ${recommended ? 'text-blue-600' : 'text-blue-500 opacity-40'}`} />
            {f}
          </li>
        ))}
      </ul>
      <Link href="/auth/signup" className={`block text-center py-6 rounded-full font-black text-xs uppercase tracking-widest transition-all ${
        recommended 
        ? 'bg-black text-white hover:scale-105 active:scale-95' 
        : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
      }`}>
        Select Solution
      </Link>
    </div>
  )
}
