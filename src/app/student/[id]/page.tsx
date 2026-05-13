'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  Trophy, 
  Star, 
  Flame, 
  Target, 
  Medal, 
  ChevronRight, 
  Sparkles,
  BookOpen,
  Calendar,
  Gift,
  ArrowUpRight
} from 'lucide-react'

export default function StudentDashboardPage({ params }: { params: { id: string } }) {
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from('students')
        .select('*, academies(name)')
        .eq('id', params.id)
        .single()
      
      if (data) setStudent(data)
      setLoading(false)
    }
    fetchData()
  }, [params.id])

  if (loading) return (
    <div className="min-h-screen bg-indigo-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-white">
        <Sparkles className="w-12 h-12 animate-spin" />
        <p className="font-black animate-pulse">나의 성장 데이터를 불러오는 중...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F0F4FF] pb-20 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-10 pb-20 text-white rounded-b-[4rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl -ml-24 -mb-24"></div>
        
        <div className="relative z-10 flex justify-between items-center mb-10">
          <div>
            <p className="text-blue-100 font-bold mb-1 opacity-80 uppercase tracking-widest text-[10px]">{student.academies?.name}</p>
            <h1 className="text-3xl font-black tracking-tight">{student.name} 학생님 👋</h1>
          </div>
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
            <Trophy className="w-7 h-7 text-yellow-300" />
          </div>
        </div>

        {/* Stats Card */}
        <div className="relative z-10 bg-white p-8 rounded-[3rem] shadow-xl text-gray-900 flex justify-around items-center">
          <div className="text-center">
            <div className="flex items-center gap-1.5 justify-center mb-1">
              <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Points</p>
            </div>
            <p className="text-2xl font-black text-indigo-600">{student.points || 0}</p>
          </div>
          <div className="w-[1px] h-10 bg-gray-100"></div>
          <div className="text-center">
            <div className="flex items-center gap-1.5 justify-center mb-1">
              <Flame className="w-4 h-4 text-red-500 fill-red-500" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Streak</p>
            </div>
            <p className="text-2xl font-black text-red-600">7일째</p>
          </div>
          <div className="w-[1px] h-10 bg-gray-100"></div>
          <div className="text-center">
            <div className="flex items-center gap-1.5 justify-center mb-1">
              <Medal className="w-4 h-4 text-blue-500 fill-blue-500" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Badges</p>
            </div>
            <p className="text-2xl font-black text-blue-600">{(student.badges || []).length}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto -mt-10 px-6 space-y-8">
        {/* Missions Section */}
        <section>
          <div className="flex justify-between items-center mb-4 px-2">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              오늘의 미션
            </h2>
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">3개 남음</span>
          </div>
          <div className="space-y-3">
            <MissionCard title="QR 등원 체크하기" points={10} completed />
            <MissionCard title="오늘 숙제 제출 완료" points={50} />
            <MissionCard title="단어 테스트 90점 이상" points={100} />
          </div>
        </section>

        {/* Badges Section */}
        <section>
          <div className="flex justify-between items-center mb-4 px-2">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Medal className="w-5 h-5 text-blue-600" />
              획득 배지 리스트
            </h2>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            <BadgeIcon icon="🔥" label="등원왕" />
            <BadgeIcon icon="📚" label="다독왕" />
            <BadgeIcon icon="✨" label="태도왕" />
            <div className="aspect-square bg-gray-200 rounded-2xl flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300">
              ?
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="grid grid-cols-2 gap-4">
          <LinkCard 
            title="나의 학습 리포트" 
            icon={<BookOpen className="w-6 h-6" />} 
            color="bg-purple-600" 
          />
          <LinkCard 
            title="포인트 상점" 
            icon={<Gift className="w-6 h-6" />} 
            color="bg-orange-500" 
          />
        </section>
      </div>

      {/* Footer Nav (Web) */}
      <div className="fixed bottom-6 left-6 right-6 h-20 bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/20 flex items-center justify-around px-8">
        <NavIcon icon={<Trophy className="w-6 h-6" />} active />
        <NavIcon icon={<Calendar className="w-6 h-6" />} />
        <NavIcon icon={<Gift className="w-6 h-6" />} />
        <NavIcon icon={<Sparkles className="w-6 h-6" />} />
      </div>
    </div>
  )
}

function MissionCard({ title, points, completed }: any) {
  return (
    <div className={`p-5 rounded-3xl flex justify-between items-center border transition-all ${
      completed ? 'bg-green-50 border-green-100 opacity-60' : 'bg-white border-gray-100 shadow-sm'
    }`}>
      <div className="flex items-center gap-4">
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
          completed ? 'bg-green-500 border-green-500' : 'border-gray-200'
        }`}>
          {completed && <ArrowUpRight className="w-3 h-3 text-white" />}
        </div>
        <p className={`font-black text-sm ${completed ? 'text-green-700' : 'text-gray-900'}`}>{title}</p>
      </div>
      <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${
        completed ? 'bg-green-500 text-white' : 'bg-indigo-50 text-indigo-600'
      }`}>
        +{points}P
      </span>
    </div>
  )
}

function BadgeIcon({ icon, label }: any) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="aspect-square w-full bg-white rounded-2xl shadow-sm flex items-center justify-center text-2xl border border-gray-50">
        {icon}
      </div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
    </div>
  )
}

function LinkCard({ title, icon, color }: any) {
  return (
    <div className={`${color} p-6 rounded-[2.5rem] text-white shadow-lg relative overflow-hidden group active:scale-95 transition-all`}>
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
      <div className="mb-4">{icon}</div>
      <p className="font-black text-sm leading-tight">{title}</p>
    </div>
  )
}

function NavIcon({ icon, active }: any) {
  return (
    <div className={`p-3 rounded-2xl transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110' : 'text-gray-300 hover:text-indigo-600'}`}>
      {icon}
    </div>
  )
}
