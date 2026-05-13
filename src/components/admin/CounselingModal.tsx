'use client'

import { useState, useEffect } from 'react'
import { 
  X, 
  Sparkles, 
  Loader2, 
  Copy, 
  CheckCircle2, 
  MessageSquare,
  Phone,
  ShieldCheck,
  Zap
} from 'lucide-react'
import { getPlanLimits } from '@/utils/plan-limits'
import Link from 'next/link'

interface CounselingModalProps {
  isOpen: boolean
  onClose: () => void
  student: any
  planType: string | null | undefined
}

export default function CounselingModal({ isOpen, onClose, student, planType }: CounselingModalProps) {
  const [script, setScript] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const plan = getPlanLimits(planType)

  const generateScript = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/counseling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: student.id })
      })
      const data = await response.json()
      if (data.script) {
        setScript(data.script)
      }
    } catch (err) {
      console.error('Failed to generate script:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && student && plan.hasAiCounseling) {
      generateScript()
    }
  }, [isOpen, student])

  const handleCopy = () => {
    navigator.clipboard.writeText(script)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-[#1A1A1A] p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600 rounded-full opacity-20 -mr-20 -mt-20 blur-3xl"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-blue-600/20 text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-wider mb-2">
                Counseling Assistant
              </div>
              <h2 className="text-2xl font-black flex items-center gap-2">
                <Phone className="w-6 h-6 text-blue-400" />
                {student?.name} 학생 상담 가이드
              </h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {!plan.hasAiCounseling ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center mb-8">
                <Zap className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">상담 가이드 엔진 활성화 필요</h3>
              <p className="text-gray-400 font-bold max-w-sm mb-10">AI 상담 가이드 엔진은 Basic 요금제부터 사용 가능합니다. 지금 업그레이드하고 원장님의 상담 품격을 높이세요.</p>
              <Link href="/admin/dashboard" className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                Upgrade to Basic
              </Link>
            </div>
          ) : loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-blue-600 animate-spin-slow" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">데이터 분석 중...</h3>
              <p className="text-gray-400 font-medium">최근 리포트와 출결 데이터를 바탕으로<br />최적의 상담 시나리오를 구성하고 있습니다.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-[2rem] p-6 border border-gray-100 max-h-[400px] overflow-y-auto custom-scrollbar">
                <div className="prose prose-blue max-w-none">
                  {script.split('\n').map((line, i) => (
                    <p key={i} className="text-gray-700 font-medium leading-relaxed mb-4">
                      {line}
                    </p>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleCopy}
                  className="flex-1 py-5 bg-[#1A1A1A] text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl active:scale-95"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                      복사 완료!
                    </>
                  ) : (
                    <>
                      <Copy className="w-6 h-6" />
                      대본 복사하기
                    </>
                  )}
                </button>
                <button
                  onClick={generateScript}
                  className="px-8 py-5 bg-blue-50 text-blue-600 rounded-2xl font-black text-lg hover:bg-blue-100 transition-all border border-blue-100"
                >
                  <Sparkles className="w-6 h-6" />
                </button>
              </div>

              <div className="p-5 bg-green-50 rounded-2xl border border-green-100 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <p className="text-xs text-green-800 font-medium leading-relaxed">
                  <strong>교사 보호 안내:</strong> 이 대본은 칭찬 중심으로 설계되었습니다. 학부모님의 무리한 요구에는 정중히 대응하시고, 모든 내용은 DB에 기록되어 보호받습니다.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
