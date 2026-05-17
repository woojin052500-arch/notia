'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { getPlanLimits } from '@/utils/plan-limits'
import { 
  Search, 
  UserPlus, 
  GraduationCap, 
  Phone, 
  Calendar, 
  Trash2, 
  QrCode, 
  FileText,
  Filter,
  CheckCircle2,
  Sparkles,
  Edit3
} from 'lucide-react'
import StudentAddModal from '@/components/admin/StudentAddModal'
import StudentEditModal from '@/components/admin/StudentEditModal'
import QrModal from '@/components/admin/QrModal'
import CounselingModal from '@/components/admin/CounselingModal'
import Link from 'next/link'

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [academy, setAcademy] = useState<any>(null)
  const [academyId, setAcademyId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStudentForQr, setSelectedStudentForQr] = useState<any>(null)
  const [selectedStudentForCounseling, setSelectedStudentForCounseling] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState<any>(null)
  const supabase = createClient()

  const fetchStudents = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('students')
      .select('*')
      .order('name', { ascending: true })

    if (data) setStudents(data)
    setLoading(false)
  }

  useEffect(() => {
    const initializeData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        if (!user) {
          setLoading(false)
          return
        }

        const { data: academyData, error: acadError } = await supabase
          .from('academies')
          .select('*')
          .eq('owner_id', user.id)
          .single()
        
        if (acadError) throw acadError
        
        if (academyData) {
          setAcademy(academyData)
          setAcademyId(academyData.id)
          await fetchStudents()
        } else {
          setLoading(false)
        }
      } catch (err: any) {
        console.error('Error initializing student page data:', err)
        alert('데이터를 불러오는 중 오류가 발생했습니다: ' + (err.message || String(err)))
        setLoading(false)
      }
    }
    initializeData()
  }, [])

  const deleteStudent = async (id: string) => {
    if (!confirm('정말 학생 정보를 삭제하시겠습니까? 관련 데이터가 모두 소멸됩니다.')) return
    const { error } = await supabase.from('students').delete().eq('id', id)
    if (!error) fetchStudents()
  }

  const filteredStudents = students.filter(s => s.name.includes(searchTerm))
  const plan = getPlanLimits(academy?.plan_type)

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Hero Header */}
      <div className="relative p-12 rounded-[4rem] bg-[#0A0A0A] overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600/20 border border-blue-500/30 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-400 mb-6">
              <Sparkles className="w-3 h-3" />
              스마트 인명부
            </div>
            <h1 className="text-5xl font-black text-white tracking-tight mb-4">학원 학생 인명부</h1>
            <p className="text-gray-400 font-bold">지능형 관리 엔진이 분석한 학생들의 학습 상태와 출결을 한눈에 관리하세요.</p>
          </div>
          {students.length >= plan.maxStudents ? (
            <Link 
              href="/admin/dashboard"
              className="px-10 py-5 bg-orange-500 text-white rounded-3xl font-black text-sm flex items-center gap-3 hover:bg-orange-600 transition-all shadow-xl shadow-orange-600/20 active:scale-95"
            >
              <Sparkles className="w-5 h-5" />
              요금제 업그레이드 (한도 도달)
            </Link>
          ) : (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-10 py-5 bg-blue-600 text-white rounded-3xl font-black text-sm flex items-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
            >
              <UserPlus className="w-5 h-5" />
              신규 학생 등록하기
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input 
            type="text" 
            placeholder="학생 이름이나 학부모 연락처로 검색..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-8 py-6 bg-white border border-gray-100 rounded-[2.5rem] text-sm font-bold shadow-sm focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all"
          />
        </div>
        <button className="px-8 py-6 bg-white border border-gray-100 rounded-[2.5rem] flex items-center gap-3 font-black text-xs text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
          <Filter className="w-4 h-4" />
          상세 필터링
        </button>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [1,2,3,4,5,6].map(i => (
            <div key={i} className="h-[400px] bg-gray-50 rounded-[3.5rem] animate-pulse"></div>
          ))
        ) : filteredStudents.map((student) => (
          <div key={student.id} className="group bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-150 transition-all duration-700"></div>
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="w-20 h-20 bg-[#F8F9FA] border border-gray-100 rounded-[2rem] flex items-center justify-center font-black text-2xl text-blue-600 shadow-inner group-hover:scale-110 transition-transform duration-500">
                {student.name[0]}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedStudentForEdit(student)}
                  className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                  title="정보 수정"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setSelectedStudentForCounseling(student)}
                  className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  title="상담 안내 가이드"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => deleteStudent(student.id)}
                  className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mb-10 relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{student.name}</h3>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg uppercase tracking-widest">Active</span>
                <span className="px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-black rounded-lg uppercase tracking-widest">Standard Plan</span>
              </div>
            </div>

            <div className="space-y-4 mb-10 relative z-10">
              <div className="flex items-center gap-4 text-sm font-bold text-gray-500">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                {student.parent_phone}
              </div>
              <div className="flex items-center gap-4 text-sm font-bold text-gray-500">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                {new Date(student.created_at).toLocaleDateString()} 등록
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 relative z-10">
              <button 
                onClick={() => setSelectedStudentForQr(student)}
                className="py-4 bg-[#1A1A1A] text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                QR ID Card
              </button>
              <Link 
                href={`/admin/reports/new/${student.id}`}
                className="py-4 bg-white border border-gray-100 text-gray-900 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                학습 리포트
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!loading && filteredStudents.length === 0 && (
        <div className="py-40 text-center bg-gray-50 rounded-[4rem] border-4 border-dashed border-gray-100">
          <GraduationCap className="w-20 h-20 text-gray-200 mx-auto mb-6" />
          <h3 className="text-2xl font-black text-gray-400 mb-2">학생 정보가 없습니다</h3>
          <p className="text-gray-400 font-bold">검색어를 확인하거나 신규 학생을 등록해 주세요.</p>
        </div>
      )}

      {/* Modals */}
      {academyId && (
        <StudentAddModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchStudents}
          academyId={academyId}
        />
      )}

      <QrModal 
        isOpen={!!selectedStudentForQr}
        onClose={() => setSelectedStudentForQr(null)}
        student={selectedStudentForQr}
      />

      <CounselingModal 
        isOpen={!!selectedStudentForCounseling}
        onClose={() => setSelectedStudentForCounseling(null)}
        student={selectedStudentForCounseling}
        planType={academy?.plan_type}
      />

      <StudentEditModal 
        isOpen={!!selectedStudentForEdit}
        onClose={() => setSelectedStudentForEdit(null)}
        onSuccess={fetchStudents}
        student={selectedStudentForEdit}
      />
    </div>
  )
}
