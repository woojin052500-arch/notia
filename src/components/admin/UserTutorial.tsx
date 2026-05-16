'use client'

import { useState, useEffect } from 'react'
import { X, ChevronRight, ChevronLeft, Sparkles, QrCode, BookOpen, MessageSquare, CreditCard, LayoutDashboard } from 'lucide-react'

const steps = [
  {
    title: 'Notia에 오신 것을 환영합니다!',
    description: 'AI 기반 학원 운영 자동화 시스템 Notia의 주요 기능을 1분 만에 안내해 드립니다.',
    icon: Sparkles,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    title: '스마트 대시보드',
    description: '학원의 전체 현황, 출결 통계, 수납 현황을 한눈에 파악할 수 있습니다.',
    icon: LayoutDashboard,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50'
  },
  {
    title: '학생 및 교재 관리',
    description: '학생 정보 등록은 물론, 새롭게 추가된 [교재 관리] 메뉴에서 교재를 등록하고 학생에게 바로 지급할 수 있습니다.',
    icon: BookOpen,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50'
  },
  {
    title: 'AI 스마트 리포트',
    description: '메모만 입력하면 AI가 전문적인 문장으로 변환해 줍니다. 전송 전 직접 수정도 가능하여 정성을 더할 수 있습니다.',
    icon: MessageSquare,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    title: '지능형 수납 관리',
    description: '원비 결제 안내는 물론, 지급된 교재비까지 자동으로 합산하여 AI가 정중한 안내 문구를 만들어 드립니다.',
    icon: CreditCard,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  {
    title: '안심 출결 시스템',
    description: 'QR 스캔 시 학부모님께 즉시 알림이 전송됩니다. 설정된 최소 학습 시간(기본 50분) 이전에는 하원 처리가 제한되어 학습 시간을 보장합니다.',
    icon: QrCode,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50'
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
      className="fixed bottom-8 right-8 w-14 h-14 bg-white border border-gray-100 rounded-2xl shadow-2xl flex items-center justify-center text-blue-600 hover:scale-110 active:scale-95 transition-all z-[150] group"
    >
      <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
    </button>
  )

  const step = steps[currentStep]

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose}></div>
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
        <button 
          onClick={handleClose}
          className="absolute top-8 right-8 p-2 text-gray-300 hover:text-gray-900 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-10 pt-16 flex flex-col items-center text-center">
          <div className={`w-24 h-24 ${step.bgColor} rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl shadow-gray-100 border border-white`}>
            <step.icon className={`w-10 h-10 ${step.color}`} />
          </div>

          <div className="space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 text-gray-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
              Step {currentStep + 1} of {steps.length}
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">{step.title}</h2>
            <p className="text-gray-500 font-bold leading-relaxed">{step.description}</p>
          </div>

          <div className="w-full flex items-center justify-between gap-4">
            <button 
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex-1 py-5 bg-gray-50 text-gray-400 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-gray-100 transition-all disabled:opacity-0"
            >
              <ChevronLeft className="w-4 h-4" />
              이전
            </button>
            <button 
              onClick={nextStep}
              className="flex-[2] py-5 bg-[#1A1A1A] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-xl shadow-blue-100"
            >
              {currentStep === steps.length - 1 ? '시작하기' : '다음 단계'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Indicators */}
          <div className="flex gap-1.5 mt-10">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === currentStep ? 'w-8 bg-blue-600' : 'w-1.5 bg-gray-100'
                }`}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
