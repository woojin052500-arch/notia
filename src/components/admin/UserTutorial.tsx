'use client'

import { useState, useEffect } from 'react'
import { X, ChevronRight, ChevronLeft, Sparkles, QrCode, BookOpen, MessageSquare, CreditCard, LayoutDashboard, Instagram, Globe, Settings, ShieldCheck, UserCheck } from 'lucide-react'

const steps = [
  {
    title: 'Notia OS에 오신 것을 환영합니다',
    description: '원장님의 소중한 시간을 아이들의 성장에만 집중할 수 있도록, Notia의 모든 기능을 안내해 드립니다.',
    icon: Sparkles,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50'
  },
  {
    title: '지능형 통합 대시보드',
    description: '학원 전체의 출결 현황, 미납 내역, 주요 피드백을 실시간으로 확인하세요. 데이터 기반의 직관적인 운영이 가능해집니다.',
    icon: LayoutDashboard,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    title: '학생 정보 및 교재 관리',
    description: '학생 정보 등록뿐만 아니라, [교재 관리] 메뉴에서 미리 등록한 교재를 학생별로 즉시 지급하고 지급 내역을 영구적으로 보관할 수 있습니다.',
    icon: BookOpen,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50'
  },
  {
    title: '지능형 맞춤 학습 리포트',
    description: '선생님의 짧은 메모를 학부모님이 감동할 만한 전문적인 분석 리포트로 다듬어 드립니다. 전송 전 직접 수정하여 원장님의 정성을 더해 보세요.',
    icon: MessageSquare,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    title: '스마트 수납 비서',
    description: '원비 결제 예정일 알림은 물론, 지급된 교재비까지 자동으로 합산하여 청구합니다. 학부모님 성향에 맞춘 정중한 안내 문구를 클릭 한 번으로 생성하세요.',
    icon: CreditCard,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  {
    title: '성장 마케팅 센터',
    description: '학생의 학습 성과를 바탕으로 인스타그램 카드뉴스나 맞춤형 홍보글을 제작합니다. 학원의 브랜드 가치를 높이는 가장 쉬운 방법입니다.',
    icon: Instagram,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50'
  },
  {
    title: '안심 출결 & 귀가 시스템',
    description: 'QR 스캔 시 학부모님께 실시간 알림이 전송됩니다. 설정된 최소 학습 시간(50분)이 지나야 하원이 가능하도록 설계되어 학습의 질을 보장합니다.',
    icon: QrCode,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50'
  },
  {
    title: '프랜차이즈 통합 모드',
    description: '여러 지점을 운영하신다면 프랜차이즈 모드를 통해 모든 캠퍼스의 데이터를 한곳에서 관리하고 지표를 비교할 수 있습니다.',
    icon: Globe,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50'
  },
  {
    title: '맞춤형 설정 & 보안',
    description: '학원 정보 수정, 알림 설정, 그리고 서비스 등급 관리를 통해 우리 학원만의 최적화된 OS 환경을 구축하세요.',
    icon: Settings,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50'
  },
  {
    title: '준비가 완료되었습니다',
    description: '이제 Notia와 함께 더 품격 있는 학원 운영을 시작해 보세요. 궁금한 점은 언제든 안내 아이콘을 눌러주세요.',
    icon: UserCheck,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50'
  }
]

export default function UserTutorial() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('notia_tutorial_seen')
    if (!hasSeenTutorial) {
      setIsOpen(true)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem('notia_tutorial_seen', 'true')
    setIsOpen(false)
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleClose()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (!isOpen) return (
    <button 
      onClick={() => {
        setCurrentStep(0)
        setIsOpen(true)
      }}
      className="fixed bottom-8 right-8 w-14 h-14 bg-white border border-gray-100 rounded-2xl shadow-2xl flex items-center justify-center text-indigo-600 hover:scale-110 active:scale-95 transition-all z-[150] group"
    >
      <div className="relative">
        <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      </div>
    </button>
  )

  const step = steps[currentStep]

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={handleClose}></div>
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
        <button 
          onClick={handleClose}
          className="absolute top-8 right-8 p-2 text-gray-300 hover:text-gray-900 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 md:p-12 pt-16 flex flex-col items-center text-center">
          <div className={`w-20 h-20 md:w-24 md:h-24 ${step.bgColor} rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl shadow-gray-50 border border-white`}>
            <step.icon className={`w-10 h-10 ${step.color}`} />
          </div>

          <div className="space-y-4 mb-10 md:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 text-gray-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
              Step {currentStep + 1} / {steps.length}
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight">{step.title}</h2>
            <p className="text-sm md:text-base text-gray-500 font-bold leading-relaxed px-4">{step.description}</p>
          </div>

          <div className="w-full flex items-center justify-between gap-3 md:gap-4">
            <button 
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex-1 py-4 md:py-5 bg-gray-50 text-gray-400 rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-2 hover:bg-gray-100 transition-all disabled:opacity-0"
            >
              <ChevronLeft className="w-4 h-4" />
              이전
            </button>
            <button 
              onClick={nextStep}
              className="flex-[2] py-4 md:py-5 bg-[#1A1A1A] text-white rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100"
            >
              {currentStep === steps.length - 1 ? '모험 시작하기' : '다음 안내'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Indicators */}
          <div className="flex gap-1.5 mt-8 md:mt-10">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === currentStep ? 'w-6 bg-indigo-600' : 'w-1 bg-gray-100'
                }`}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
