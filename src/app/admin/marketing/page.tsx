'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { getPlanLimits } from '@/utils/plan-limits'
import { 
  Sparkles, 
  Share2, 
  Download, 
  Instagram, 
  TrendingUp, 
  Award, 
  Users, 
  MessageCircle,
  Loader2,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Instagram
} from 'lucide-react'
import Link from 'next/link'

export default function MarketingPage() {
  const [highlights, setHighlights] = useState<any[]>([])
  const [selectedHighlight, setSelectedHighlight] = useState<any>(null)
  const [cardContent, setCardContent] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [academy, setAcademy] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: academyData } = await supabase.from('academies').select('*').eq('owner_id', user.id).single()
        setAcademy(academyData)
      }

      const { data } = await supabase
        .from('reports')
        .select('*, students(name, id)')
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (data) {
        const cases = data.map((r: any) => ({
          id: r.id,
          studentId: r.students.id,
          name: r.students.name,
          type: r.scores?.achievement >= 4 ? '성적 우수' : '학습 태도 우수',
          date: new Date(r.created_at).toLocaleDateString()
        }))
        setHighlights(cases)
      }
    }
    fetchInitialData()
  }, [])

  const generateCardNews = async (highlight: any) => {
    setLoading(true)
    setSelectedHighlight(highlight)
    try {
      const res = await fetch('/api/ai/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          studentId: highlight.studentId,
          achievementType: highlight.type
        })
      })
      const data = await res.json()
      setCardContent(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const plan = getPlanLimits(academy?.plan_type)

  if (academy && !plan.hasAiMarketing) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-20">
      <div className="w-24 h-24 bg-orange-50 rounded-[3rem] flex items-center justify-center mb-10 shadow-sm">
        <Instagram className="w-12 h-12 text-orange-600" />
      </div>
      <h2 className="text-4xl font-black text-gray-900 mb-6 tracking-tight">마케팅 엔진은 Professional 이상의<br />회원님만 사용 가능합니다.</h2>
      <p className="text-gray-400 font-bold max-w-lg mb-12 leading-relaxed">
        학원의 성과를 카드뉴스로 자동 변환하고 싶으신가요? <br />
        지금 바로 요금제를 업그레이드하고 강력한 홍보 도구를 확보하세요.
      </p>
      <Link href="/admin/dashboard" className="px-16 py-6 bg-[#1A1A1A] text-white rounded-[2.5rem] font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-2xl">
        Upgrade to Professional
      </Link>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Plan Badge */}
      <div className="absolute top-8 right-8 flex items-center gap-2 px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100">
        <ShieldCheck className="w-3 h-3" />
        {plan.name} Tier Active
      </div>
      {/* Hero Header */}
      <div className="relative p-12 rounded-[4rem] bg-[#0A0A0A] overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/10 blur-[100px] rounded-full"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-600/20 border border-orange-500/30 rounded-full text-[10px] font-black uppercase tracking-widest text-orange-400 mb-6">
            <Sparkles className="w-3 h-3" />
            Marketing Intelligence Studio
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">마케팅 카드뉴스 센터</h1>
          <p className="text-gray-400 font-bold">학원의 실제 성과 데이터를 활용해 SNS용 프리미엄 홍보 이미지를 자동 생성하세요.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Interactive Highlights List */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex justify-between items-center px-4">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              공유 가능한 하이라이트
            </h2>
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{highlights.length} Moments</span>
          </div>

          <div className="space-y-4">
            {highlights.map((h, idx) => {
              const isSelected = selectedHighlight?.id === h.id
              return (
                <button 
                  key={idx}
                  onClick={() => generateCardNews(h)}
                  className={`w-full p-8 rounded-[3rem] border-2 text-left transition-all duration-500 relative group overflow-hidden ${
                    isSelected 
                    ? 'bg-[#1A1A1A] border-black text-white shadow-2xl shadow-gray-300 -translate-y-1' 
                    : 'bg-white border-gray-100 hover:border-orange-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-colors ${
                        isSelected ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600'
                      }`}>
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isSelected ? 'text-orange-400' : 'text-orange-600'}`}>
                          {h.type}
                        </p>
                        <p className="font-black text-lg">{h.name} 학생의 성과</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-[10px] font-bold ${isSelected ? 'text-gray-500' : 'text-gray-400'}`}>
                      {h.date} 분석됨
                    </p>
                    <ArrowRight className={`w-4 h-4 transition-all duration-500 ${isSelected ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} />
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right: Premium Preview & Canvas */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="aspect-square bg-gray-50 rounded-[4rem] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center gap-8 text-center p-20 animate-pulse">
              <Loader2 className="w-16 h-16 text-orange-500 animate-spin" />
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">AI가 마케팅 카피를 디자인 중입니다</h3>
                <p className="text-gray-400 font-bold">인스타그램 트렌드에 최적화된 문구와 템플릿을 생성하고 있습니다.</p>
              </div>
            </div>
          ) : cardContent ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
              {/* Premium Card Display */}
              <div 
                id="card-news"
                className="aspect-square w-full rounded-[4.5rem] p-20 flex flex-col justify-between text-white relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] group"
                style={{ background: `linear-gradient(135deg, ${cardContent.themeColor || '#0066FF'}, #000)` }}
              >
                <div className="absolute top-0 right-0 w-[120%] h-[120%] bg-white/5 rounded-full blur-[120px] -mr-40 -mt-40 group-hover:scale-110 transition-transform duration-1000"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-12">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-2xl rounded-[1.5rem] flex items-center justify-center border border-white/20">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <div className="h-px flex-1 bg-white/20"></div>
                    <span className="text-xs font-black uppercase tracking-[0.4em] text-white/60">Intelligence Result</span>
                  </div>
                  
                  <h3 className="text-6xl font-black leading-[1.05] tracking-tighter mb-10 break-keep">
                    {cardContent.headline}
                  </h3>
                  <p className="text-3xl font-bold opacity-80 leading-tight max-w-[85%] break-keep">
                    {cardContent.subHeadline}
                  </p>
                </div>

                <div className="relative z-10 flex justify-between items-end border-t border-white/10 pt-10">
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      {cardContent.hashtags?.map((tag: string, idx: number) => (
                        <span key={idx} className="text-xs font-black bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black tracking-tighter uppercase mb-1">NOTIA</p>
                    <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em]">AI OS For Academy</p>
                  </div>
                </div>
              </div>

              {/* Action Console */}
              <div className="grid grid-cols-2 gap-6">
                <button 
                  className="py-6 bg-[#1A1A1A] text-white rounded-[2.5rem] font-black text-sm flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-95"
                >
                  <Download className="w-5 h-5" />
                  고해상도 이미지 저장
                </button>
                <button className="py-6 bg-gradient-to-tr from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white rounded-[2.5rem] font-black text-sm flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl shadow-orange-100 active:scale-95">
                  <Instagram className="w-5 h-5" />
                  인스타그램 직접 공유
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[700px] bg-white rounded-[4rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center p-20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-orange-50/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-24 h-24 bg-orange-50 rounded-[2.5rem] flex items-center justify-center mb-8 mx-auto shadow-sm group-hover:scale-110 transition-transform">
                  <Share2 className="w-10 h-10 text-orange-600" />
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-4">학원의 성과를 카드로 만드세요</h3>
                <p className="text-gray-400 font-bold max-w-sm leading-relaxed mx-auto">
                  좌측 리스트에서 학생의 드라마틱한 성장 스토리를 선택하면 AI가 즉시 SNS 업로드용 카드뉴스를 디자인합니다.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
