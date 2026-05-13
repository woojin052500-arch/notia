'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  BookOpen, 
  CheckCircle2, 
  Target, 
  MessageCircle, 
  Printer,
  ChevronLeft,
  Loader2,
  Sparkles,
  GraduationCap
} from 'lucide-react'
import Link from 'next/link'

export default function StudentWorkbookPage({ params }: { params: { id: string } }) {
  const [student, setStudent] = useState<any>(null)
  const [workbook, setWorkbook] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch Student
      const { data: sData } = await supabase
        .from('students')
        .select('*')
        .eq('id', params.id)
        .single()
      
      setStudent(sData)

      // 2. Generate Workbook via AI
      try {
        const res = await fetch('/api/ai/workbook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: params.id })
        })
        const data = await res.json()
        setWorkbook(data)
      } catch (err) {
        console.error('Failed to generate workbook', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [params.id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <BookOpen className="w-12 h-12 text-blue-600 animate-bounce" />
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-blue-400 animate-pulse" />
        </div>
        <p className="text-sm font-black text-blue-900">학생 맞춤형 워크북을 디자인하고 있습니다...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white font-sans">
      {/* Action Bar (Hidden when printing) */}
      <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center print:hidden">
        <Link href="/admin/students" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          학생 목록으로 돌아가기
        </Link>
        <button 
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
        >
          <Printer className="w-5 h-5" />
          워크북 인쇄하기
        </button>
      </div>

      {/* Workbook Body */}
      <div className="max-w-[210mm] mx-auto bg-white min-h-[297mm] shadow-2xl p-[20mm] print:shadow-none print:m-0 border border-gray-100 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50 rounded-full -ml-32 -mb-32 opacity-50"></div>

        {/* Workbook Header */}
        <div className="relative z-10 border-b-4 border-gray-900 pb-10 mb-12 flex justify-between items-end">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest mb-6">
              Personalized Workbook
            </div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-tight">
              {workbook?.title || '나만의 학습 성장 워크북'}
            </h1>
          </div>
          <div className="text-right">
            <GraduationCap className="w-16 h-16 text-blue-600 ml-auto mb-4" />
            <p className="text-xl font-black text-gray-900">{student?.name} 학생</p>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">WJedulab Premium Analysis</p>
          </div>
        </div>

        {/* Workbook Sections */}
        <div className="relative z-10 space-y-12">
          {/* Section 1: Vulnerability */}
          <section className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
              <Target className="w-6 h-6 text-red-500" />
              01. 나의 취약점 분석 리포트
            </h2>
            <div className="p-8 bg-red-50 rounded-[2.5rem] border border-red-100 italic">
              <p className="text-lg font-bold text-red-900 leading-relaxed">
                "{workbook?.vulnerability}"
              </p>
            </div>
          </section>

          {/* Section 2: Concepts */}
          <section className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-blue-600" />
              02. 필수 보완 핵심 개념
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {workbook?.concepts.map((concept: string, idx: number) => (
                <div key={idx} className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center text-sm font-black shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-lg font-bold text-blue-900">{concept}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Missions */}
          <section className="space-y-4">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              03. 이번 주 극복 미션 (Challenge)
            </h2>
            <div className="space-y-4">
              {workbook?.missions.map((mission: string, idx: number) => (
                <div key={idx} className="p-6 border-2 border-dashed border-gray-200 rounded-3xl flex items-center gap-6">
                  <div className="w-10 h-10 border-2 border-gray-200 rounded-full shrink-0"></div>
                  <p className="text-lg font-bold text-gray-700">{mission}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4: Message */}
          <section className="pt-8 border-t border-gray-100">
            <div className="flex items-start gap-6 bg-gray-50 p-8 rounded-[2.5rem]">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-gray-100 shrink-0">
                <MessageCircle className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Teacher's Note</p>
                <p className="text-xl font-bold text-gray-800 leading-relaxed italic">
                  "{workbook?.message}"
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Workbook Footer */}
        <div className="absolute bottom-[20mm] left-[20mm] right-[20mm] border-t border-gray-100 pt-6 flex justify-between items-center opacity-50">
          <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Notia AI Personalized Workbook</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Designed for Academic Excellence</p>
          </div>
        </div>
      </div>
    </div>
  )
}
