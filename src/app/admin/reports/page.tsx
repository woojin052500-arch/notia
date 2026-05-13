'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  FileText, 
  Search, 
  Filter, 
  Sparkles, 
  CheckCircle, 
  Eye, 
  MessageSquare, 
  Heart,
  ChevronRight,
  User,
  Clock
} from 'lucide-react'
import Link from 'next/link'

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchReports = async () => {
      const { data } = await supabase
        .from('reports')
        .select('*, students(name)')
        .order('created_at', { ascending: false })
      
      if (data) setReports(data)
      setLoading(false)
    }
    fetchReports()
  }, [])

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Hero Header */}
      <div className="relative p-12 rounded-[4rem] bg-[#0A0A0A] overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 blur-[100px] rounded-full"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-600/20 border border-purple-500/30 rounded-full text-[10px] font-black uppercase tracking-widest text-purple-400 mb-6">
            <Sparkles className="w-3 h-3" />
            AI Communication Center
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight mb-4">리포트 전송 히스토리</h1>
          <p className="text-gray-400 font-bold">인공지능이 작성하고 학부모님께 전달된 모든 소통의 기록을 확인하세요.</p>
        </div>
      </div>

      {/* Stats Summary Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <ReportStat label="Total Sent" value={reports.length.toString()} icon={<FileText className="w-5 h-5 text-gray-400" />} bgColor="bg-white" />
        <ReportStat label="Read Rate" value={`${Math.round((reports.filter(r => r.read_at).length / (reports.length || 1)) * 100)}%`} icon={<Eye className="w-5 h-5 text-blue-600" />} bgColor="bg-blue-50/30" />
        <ReportStat label="Grateful Responses" value={reports.filter(r => r.parent_reaction).length.toString()} icon={<Heart className="w-5 h-5 text-red-500" />} bgColor="bg-red-50/30" />
      </div>

      {/* Reports List */}
      <div className="space-y-6">
        {loading ? (
          [1,2,3].map(i => (
            <div key={i} className="h-40 bg-gray-50 rounded-[3rem] animate-pulse"></div>
          ))
        ) : reports.map((report) => (
          <div key={report.id} className="group bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row items-center gap-10">
              {/* Student Info Area */}
              <div className="flex items-center gap-6 w-full lg:w-72 shrink-0">
                <div className="w-16 h-16 bg-[#F8F9FA] rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl border border-gray-100 group-hover:scale-110 transition-transform duration-500">
                  {report.students?.name[0]}
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-xl tracking-tight">{report.students?.name}</h3>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">
                    <Clock className="w-3 h-3" />
                    {new Date(report.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Content Preview */}
              <div className="flex-1 w-full bg-[#F8F9FA] p-8 rounded-[2rem] border border-gray-100 group-hover:bg-white group-hover:border-blue-100 transition-all duration-500">
                <p className="text-sm text-gray-600 font-medium leading-relaxed line-clamp-2 italic">
                  "{report.ai_content}"
                </p>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end">
                <div className="flex flex-col items-end gap-2">
                  {report.read_at ? (
                    <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-full border border-emerald-100 uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" /> Read
                    </span>
                  ) : (
                    <span className="px-4 py-1.5 bg-gray-50 text-gray-400 text-[9px] font-black rounded-full border border-gray-100 uppercase tracking-widest">Unread</span>
                  )}
                  {report.parent_reaction && (
                    <div className="flex items-center gap-1 text-red-500 font-black text-[10px] uppercase tracking-widest">
                      <Heart className="w-3.5 h-3.5 fill-current" /> Reaction Received
                    </div>
                  )}
                </div>
                <Link 
                  href={`/report/${report.id}`} 
                  className="w-16 h-16 bg-[#1A1A1A] text-white rounded-[1.5rem] flex items-center justify-center hover:bg-blue-600 transition-all shadow-xl active:scale-95 group-hover:rotate-6"
                >
                  <Eye className="w-6 h-6" />
                </Link>
              </div>
            </div>
          </div>
        ))}

        {!loading && reports.length === 0 && (
          <div className="bg-gray-50 rounded-[4rem] p-32 text-center border-4 border-dashed border-gray-100">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
              <MessageSquare className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">기록된 리포트가 없습니다</h3>
            <p className="text-gray-400 font-bold mb-10">학생의 소중한 성장을 AI 리포트로 기록해 보세요.</p>
            <Link href="/admin/students" className="px-12 py-5 bg-blue-600 text-white font-black text-sm rounded-full shadow-xl shadow-blue-500/20 hover:scale-105 transition-all">
              리포트 작성하러 가기
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function ReportStat({ label, value, icon, bgColor }: any) {
  return (
    <div className={`p-10 rounded-[3.5rem] border border-gray-100 flex items-center justify-between shadow-sm hover:shadow-xl transition-all duration-500 ${bgColor}`}>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{label}</p>
        <h4 className="text-4xl font-black text-gray-900 tracking-tighter">{value}</h4>
      </div>
      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-inner border border-gray-100">
        {icon}
      </div>
    </div>
  )
}
