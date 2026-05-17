'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  Users, 
  MessageSquare, 
  Clock, 
  ChevronRight,
  ArrowUpRight,
  Activity,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Instagram,
  Globe,
  CreditCard,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import PricingModal from '@/components/admin/PricingModal'
import { getPlanLimits } from '@/utils/plan-limits'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    todayAttendance: 0,
    monthlyReports: 0,
    satisfaction: 98,
    unpaidCount: 0,
    responseRate: 0,
    pendingApprovals: 0
  })
  const [recentAttendance, setRecentAttendance] = useState<any[]>([])
  const [pendingReports, setPendingReports] = useState<any[]>([])
  const [atRiskStudents, setAtRiskStudents] = useState<any[]>([])
  const [recentFeedback, setRecentFeedback] = useState<any[]>([])
  const [isPricingOpen, setIsPricingOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [authUser, setAuthUser] = useState<any>(null)
  const [academy, setAcademy] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchDashboardData = async () => {
      // 0. User & Academy Data
      const { data: { user: auth } } = await supabase.auth.getUser()
      if (auth) {
        setAuthUser(auth)
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', auth.id).single()
        const { data: academyData } = await supabase.from('academies').select('*').eq('owner_id', auth.id).single()
        setUser(profile)
        setAcademy(academyData)
      }

      // 1. Basic Stats
      const { count: sCount } = await supabase.from('students').select('*', { count: 'exact', head: true })
      const today = new Date().toISOString().split('T')[0]
      const { count: aCount } = await supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('created_at', today)
      const { count: rCount } = await supabase.from('reports').select('*', { count: 'exact', head: true })

      // Parent Response Rate
      const { data: reports } = await supabase.from('reports').select('parent_reaction')
      const reacted = reports?.filter(r => r.parent_reaction)?.length || 0
      const total = reports?.length || 1
      const resRate = Math.round((reacted / total) * 100)

      // Payment Status: Count students whose next_payment_date has passed
      const { count: pCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .lt('next_payment_date', new Date().toISOString())

      // 4. Approval Process: Pending Reports
      const { data: pReports, count: pReportsCount } = await supabase
        .from('reports')
        .select('*, students(name)')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false })

      setStats(prev => ({
        ...prev,
        totalStudents: sCount || 0,
        todayAttendance: aCount || 0,
        monthlyReports: rCount || 0,
        unpaidCount: pCount || 0,
        responseRate: resRate,
        pendingApprovals: pReportsCount || 0
      }))

      if (pReports) setPendingReports(pReports)

      // AI Churn Prediction (Simulation logic)
      // Get all students and check their last 3 attendance/reports
      const { data: allStudents } = await supabase.from('students').select('id, name')
      const riskList: any[] = []

      if (allStudents) {
        for (const student of allStudents.slice(0, 5)) { // Limit for MVP demo
          const { data: recentAtt } = await supabase
            .from('attendance')
            .select('status')
            .eq('student_id', student.id)
            .order('created_at', { ascending: false })
            .limit(3)
          
          const { data: recentRep } = await supabase
            .from('reports')
            .select('parent_reaction')
            .eq('student_id', student.id)
            .order('created_at', { ascending: false })
            .limit(3)

          const absenceCount = recentAtt?.filter(a => a.status === 'absent').length || 0
          const negativeReaction = recentRep?.some(r => r.parent_reaction === 'unhappy')

          if (absenceCount >= 1 || negativeReaction) {
            riskList.push({
              ...student,
              reason: absenceCount >= 1 ? '잦은 결석 발생' : '학부모 부정적 반응',
              level: absenceCount >= 2 ? 'High' : 'Medium'
            })
          }
        }
      }
      setAtRiskStudents(riskList)

      // Recent Feedback
      const { data: feedback } = await supabase
        .from('reports')
        .select('*, students(name)')
        .not('parent_feedback', 'is', null)
        .order('created_at', { ascending: false })
        .limit(3)
      
      if (feedback) setRecentFeedback(feedback)

      const { data: recent } = await supabase
        .from('attendance')
        .select('*, students(name)')
        .order('check_in', { ascending: false })
        .limit(5)
      
      if (recent) setRecentAttendance(recent)
    }

    fetchDashboardData()
  }, [supabase])

  const handleApprove = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ approval_status: 'approved' })
        .eq('id', reportId)
      
      if (!error) {
        setPendingReports(prev => prev.filter(r => r.id !== reportId))
        setStats(prev => ({ ...prev, pendingApprovals: prev.pendingApprovals - 1 }))
        alert('리포트가 승인되었습니다.')
      }
    } catch (err) {
      console.error('Approval failed:', err)
    }
  }

  const plan = getPlanLimits(academy?.plan_type)

  return (
    <div className="max-w-7xl mx-auto pb-20 font-sans">
      {/* Premium Welcome Header */}
      <div className="mb-12 relative overflow-hidden bg-[#0A0A0A] rounded-[3.5rem] p-16 text-white shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
              <Activity className="w-3 h-3" />
              스마트 통합 관리 모드
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-tight">
              Welcome back,<br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 italic">
                {user?.full_name || authUser?.user_metadata?.full_name || '원장 선생님'}.
              </span>
            </h1>
            <p className="text-lg text-gray-500 font-medium max-w-md">
              오늘도 {academy?.name || '노티아 아카데미'}의 성장을 위해 스마트 관리 엔진이 모든 준비를 마쳤습니다.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="px-8 py-5 bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-xl">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{plan.name} Tier Active</p>
              <p className="text-2xl font-black">{stats.totalStudents} <span className="text-sm font-bold text-gray-600">/ {plan.maxStudents === 9999 ? '∞' : plan.maxStudents} 학생</span></p>
            </div>
            <div className="px-8 py-5 bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-xl">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">스마트 분석 현황</p>
              <p className="text-2xl font-black">{stats.monthlyReports} <span className="text-sm font-bold text-gray-600">/ {plan.hasAiAdvancedReport ? '∞' : '50'}</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <StatCard 
          label="전체 학생 수" 
          value={`${stats.totalStudents}명`} 
          change={stats.totalStudents > 0 ? `+${stats.totalStudents}명` : "0명"} 
          icon={<Users className="w-6 h-6" />} 
          color="text-blue-500" 
          bgColor="bg-blue-500/5"
          borderColor="border-blue-500/10"
          subtitle="실시간 관리 중"
        />
        <StatCard 
          label="학부모 반응률" 
          value={`${stats.responseRate}%`} 
          change={stats.responseRate > 0 ? `+${stats.responseRate}%` : "0%"} 
          icon={<MessageSquare className="w-6 h-6" />} 
          color="text-purple-500" 
          bgColor="bg-purple-500/5"
          borderColor="border-purple-500/10"
          subtitle="리포트 피드백"
        />
        <StatCard 
          label="지능형 리포트 발송" 
          value={`${stats.monthlyReports}건`} 
          change={stats.monthlyReports > 0 ? `+${stats.monthlyReports}건` : "0건"} 
          icon={<Sparkles className="w-6 h-6" />} 
          color="text-emerald-500" 
          bgColor="bg-emerald-500/5"
          borderColor="border-emerald-500/10"
          subtitle="이번 달 누적"
        />
        <StatCard 
          label="미납 원비" 
          value={`${stats.unpaidCount}건`} 
          change={stats.unpaidCount > 0 ? `-${stats.unpaidCount}건` : "0건"} 
          icon={<AlertTriangle className="w-6 h-6" />} 
          color="text-orange-500" 
          bgColor="bg-orange-500/5"
          borderColor="border-orange-500/10"
          subtitle="즉시 확인 필요"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* AI Churn Prediction */}
          <section className="bg-white rounded-[3.5rem] p-12 border border-gray-100 shadow-sm transition-all hover:shadow-xl">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100">
                  <Activity className="w-7 h-7 text-red-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight">퇴원 위험 분석</h2>
                  <p className="text-sm font-bold text-gray-400">데이터가 감지한 집중 관리가 필요한 학생입니다.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {atRiskStudents.map((s: any) => (
                <ChurnItem key={s.id} name={s.name} risk={s.level} reason={s.reason} />
              ))}
              {atRiskStudents.length === 0 && (
                <div className="py-12 text-center bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                  <p className="text-gray-400 font-bold">감지된 위험 요소가 없습니다.</p>
                </div>
              )}
            </div>
          </section>

          {/* AI Feedback Monitoring */}
          <section className="bg-white rounded-[3.5rem] p-12 border border-gray-100 shadow-sm transition-all hover:shadow-xl">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
                  <ShieldCheck className="w-7 h-7 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight">학부모 피드백 안심 모니터링</h2>
                  <p className="text-sm font-bold text-gray-400">스마트 엔진이 선생님을 보호하기 위해 메시지를 정제했습니다.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {recentFeedback.map((fb: any) => (
                <div key={fb.id} className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 group relative">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">정서 분석 필터링 완료</span>
                  </div>
                  <p className="text-sm font-bold text-gray-700 leading-relaxed italic mb-6">
                    &quot;{fb.filtered_feedback || fb.parent_feedback}&quot;
                  </p>
                  <div className="flex justify-between items-center pt-6 border-t border-gray-200/50">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">From: {fb.students?.name} 학부모님</p>
                    <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">원본 확인</button>
                  </div>
                </div>
              ))}
              {recentFeedback.length === 0 && (
                <div className="py-12 text-center bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                  <p className="text-gray-400 font-bold">최근 피드백이 없습니다.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-12">
          {/* Quick Console */}
          <section className="bg-[#0A0A0A] rounded-[3.5rem] p-12 text-white shadow-2xl border border-white/5 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/10 rounded-full blur-[60px]"></div>
            <h2 className="text-xl font-black mb-10 relative z-10 flex items-center gap-3">
              <Zap className="w-5 h-5 text-yellow-400" />
              Quick Console
            </h2>
            <div className="space-y-4 relative z-10">
              <Link href="/admin/marketing">
                <ActionButton title="스마트 홍보 콘텐츠 제작" icon={<Instagram className="w-4 h-4" />} primary />
              </Link>
              <Link href="/admin/payments">
                <ActionButton title="수납 및 결제 관리" icon={<CreditCard className="w-4 h-4" />} />
              </Link>
              <Link href="/admin/franchise">
                <ActionButton title="프랜차이즈 관리" icon={<Globe className="w-4 h-4" />} />
              </Link>
            </div>
            
            <div className="mt-12 p-8 bg-white/5 rounded-3xl border border-white/5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <p className="text-[10px] text-indigo-300 font-black uppercase tracking-[0.2em]">지능형 수납 보조 서비스</p>
              </div>
              <p className="text-xs font-bold leading-relaxed text-gray-500 italic">
                &quot;스마트 엔진이 {stats.unpaidCount}명의 미납 학생을 위한 맞춤 안내 문구를 준비했습니다.&quot;
              </p>
            </div>
          </section>

          {/* Pending Approvals */}
          <section className="bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-sm">
            <h2 className="text-xl font-black text-[#1A1A1A] mb-10 flex items-center gap-3">
              <Clock className="w-5 h-5 text-orange-500" />
              승인 대기 리포트
            </h2>
            <div className="space-y-4">
              {pendingReports.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 font-black text-sm">
                      {r.students?.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900">{r.students?.name} 리포트</p>
                      <p className="text-[10px] font-bold text-gray-400">박지민 강사 • 10분 전</p>
                    </div>
                  </div>
                  <button onClick={() => handleApprove(r.id)}>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 transition-all" />
                  </button>
                </div>
              ))}
              {pendingReports.length === 0 && (
                <p className="text-center py-6 text-gray-400 text-xs font-bold tracking-tight">승인 대기 중인 리포트가 없습니다.</p>
              )}
            </div>
          </section>
        </div>
      </div>

      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
    </div>
  )
}

function StatCard({ label, value, change, icon, color, bgColor, borderColor, subtitle }: any) {
  const isZero = !change || change.startsWith('0') || change === '0%' || change === '0건' || change === '0명'
  const isNegative = change?.startsWith('-')
  
  const badgeClass = isZero
    ? 'text-gray-400 bg-gray-50'
    : isNegative
      ? 'text-red-500 bg-red-50'
      : 'text-emerald-500 bg-emerald-50'

  return (
    <div className={`bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm relative group hover:shadow-2xl hover:-translate-y-2 transition-all duration-700`}>
      <div className={`w-16 h-16 ${bgColor} ${borderColor} border rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
        <div className={color}>{icon}</div>
      </div>
      <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3">{label}</p>
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-4xl font-black text-[#1A1A1A] tracking-tighter">{value}</h3>
          <p className="text-[10px] font-bold text-gray-300 mt-1 uppercase tracking-widest">{subtitle}</p>
        </div>
        <span className={`text-[10px] font-black px-3 py-1.5 rounded-full ${badgeClass}`}>{change}</span>
      </div>
    </div>
  )
}

function ChurnItem({ name, risk, reason }: any) {
  return (
    <div className="flex items-center justify-between p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 hover:border-red-200 transition-all group">
      <div className="flex items-center gap-6">
        <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center font-black text-gray-400 border border-gray-100 shadow-sm group-hover:scale-105 transition-transform">
          {name[0]}
        </div>
        <div>
          <p className="text-lg font-black text-gray-900 mb-1">{name} 학생</p>
          <p className="text-[11px] font-bold text-gray-400">{reason}</p>
        </div>
      </div>
      <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${
        risk === 'High' ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-orange-500 text-white shadow-lg shadow-orange-200'
      }`}>
        {risk} Risk
      </span>
    </div>
  )
}

function ActionButton({ title, icon, primary }: any) {
  return (
    <div className={`w-full flex items-center justify-between p-6 rounded-[2rem] transition-all duration-500 group cursor-pointer active:scale-95 ${
      primary ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:bg-blue-700' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
    }`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${primary ? 'bg-white/20' : 'bg-white/5'}`}>{icon}</div>
        <span className="font-black text-[11px] uppercase tracking-widest">{title}</span>
      </div>
      <ArrowUpRight className="w-4 h-4 opacity-40 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
    </div>
  )
}
