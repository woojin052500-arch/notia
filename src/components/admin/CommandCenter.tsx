'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Search, 
  X, 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Instagram, 
  CreditCard, 
  Globe, 
  Settings,
  ArrowRight,
  Sparkles,
  Zap,
  BookOpen
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CommandCenterProps {
  isOpen: boolean
  onClose: () => void
}

export default function CommandCenter({ isOpen, onClose }: CommandCenterProps) {
  const [query, setQuery] = useState('')
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const actions = [
    { name: '대시보드', description: '학원 운영 현황 한눈에 보기', href: '/admin/dashboard', icon: LayoutDashboard, category: 'Navigation' },
    { name: '학생 관리', description: '학생 정보 등록, 수정 및 QR 발급', href: '/admin/students', icon: Users, category: 'Management' },
    { name: '리포트 관리', description: 'AI 학습 리포트 생성 및 전송', href: '/admin/reports', icon: MessageSquare, category: 'Management' },
    { name: '마케팅 센터', description: '인스타그램 카드뉴스 자동 생성', href: '/admin/marketing', icon: Instagram, category: 'Growth' },
    { name: '수납 및 결제', description: '원비 미납 확인 및 수납 관리', href: '/admin/payments', icon: CreditCard, category: 'Management' },
    { name: '교재 관리', description: '학원 교재 및 학생 교재 지급 관리', href: '/admin/textbooks', icon: BookOpen, category: 'Management' },
    { name: '프랜차이즈', description: '전국 지점 통합 관리 모드', href: '/admin/franchise', icon: Globe, category: 'Expansion' },
    { name: '설정', description: '학원 정보 및 알림 설정', href: '/admin/settings', icon: Settings, category: 'System' },
    { name: '출결 스캐너', description: '실시간 QR 출결 키오스크 실행', href: '/attendance/kiosk', icon: Zap, category: 'Quick Action' },
  ]

  const filteredActions = actions.filter(action => 
    action.name.toLowerCase().includes(query.toLowerCase()) ||
    action.description.toLowerCase().includes(query.toLowerCase()) ||
    action.category.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      setQuery('')
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.15)] border border-white/20 overflow-hidden animate-in slide-in-from-top-4 duration-300">
        {/* Search Input */}
        <div className="p-8 border-b border-gray-100 flex items-center gap-4">
          <Search className="w-6 h-6 text-blue-600" />
          <input
            ref={inputRef}
            type="text"
            placeholder="어떤 기능을 찾으시나요? (예: 학생, 리포트, 마케팅...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none focus:ring-0 text-xl font-bold text-gray-900 placeholder:text-gray-300"
          />
          <div className="px-2 py-1 bg-gray-100 rounded-md text-[10px] font-black text-gray-400">ESC</div>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto p-4 custom-scrollbar">
          {filteredActions.length > 0 ? (
            <div className="space-y-2">
              {filteredActions.map((action, index) => (
                <button
                  key={action.name}
                  onClick={() => {
                    router.push(action.href)
                    onClose()
                  }}
                  className="w-full flex items-center justify-between p-6 rounded-[1.5rem] hover:bg-blue-600 group transition-all duration-300 text-left"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <action.icon className="w-6 h-6 text-gray-400 group-hover:text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest group-hover:text-blue-100">
                          {action.category}
                        </span>
                        {index === 0 && query && (
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[8px] font-black rounded uppercase group-hover:bg-white/20 group-hover:text-white">Best Match</span>
                        )}
                      </div>
                      <h3 className="text-lg font-black text-gray-900 group-hover:text-white transition-colors">{action.name}</h3>
                      <p className="text-xs font-medium text-gray-400 group-hover:text-blue-100 transition-colors">{action.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-200 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <Sparkles className="w-12 h-12 text-gray-100 mx-auto mb-4" />
              <p className="text-gray-400 font-bold">검색 결과가 없습니다.</p>
              <p className="text-xs text-gray-300 mt-1">다른 검색어를 입력해 보세요.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white border border-gray-200 rounded flex items-center justify-center text-[10px] text-gray-400">↑</div>
              <div className="w-5 h-5 bg-white border border-gray-200 rounded flex items-center justify-center text-[10px] text-gray-400">↓</div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">이동</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] text-gray-400">Enter</div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">선택</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Notia Command Engine</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E5E7EB;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #D1D5DB;
        }
      `}</style>
    </div>
  )
}
