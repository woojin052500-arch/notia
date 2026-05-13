'use client'

import { useState } from 'react'
import { 
  X, 
  Check, 
  ExternalLink, 
  CreditCard, 
  Zap, 
  ShieldCheck, 
  MessageCircle,
  Copy,
  Sparkles
} from 'lucide-react'

export default function PricingModal({ isOpen, onClose, isForce }: { isOpen: boolean, onClose: () => void, isForce?: boolean }) {
  const [isCopied, setIsCopied] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>('pro')

  if (!isOpen) return null

  const plans = [
    {
      id: 'basic',
      name: 'AI Basic',
      price: '9,900',
      description: '초기 소규모 학원/공부방',
      features: ['학생 20명 관리', 'AI 리포트 기본 생성', 'QR 출결 시스템', '출결 알림 메시지'],
      color: 'bg-white',
      textColor: 'text-gray-900',
      icon: <Zap className="w-5 h-5 text-blue-600" />
    },
    {
      id: 'pro',
      name: 'AI Professional',
      price: '29,900',
      description: '중소형 학원 표준 솔루션',
      features: ['학생 무제한 관리', '심화 AI 입시 분석', '교사 감정 보호 필터', '개인별 워크북 생성'],
      color: 'bg-gradient-to-br from-blue-600 to-indigo-700',
      textColor: 'text-white',
      popular: true,
      icon: <Sparkles className="w-5 h-5 text-white" />
    },
    {
      id: 'enterprise',
      name: 'AI Premium',
      price: '99,000',
      description: '대형 학원 전용 패키지',
      features: ['다관점 통계 대시보드', '마케팅 카드뉴스 자동화', '전용 브랜드 커스텀', '1:1 전담 기술지원'],
      color: 'bg-[#1A1A1A]',
      textColor: 'text-white',
      icon: <ShieldCheck className="w-5 h-5 text-blue-400" />
    }
  ]

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('NH농협지역조합 3516376760453')
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-500" 
        onClick={isForce ? undefined : onClose}
      ></div>
      
      <div className="relative bg-white w-full max-w-6xl rounded-[3.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.3)] animate-in zoom-in duration-500 flex flex-col lg:flex-row h-[90vh] lg:h-auto lg:max-h-[85vh]">
        {/* Close Button */}
        {!isForce && (
          <button onClick={onClose} className="absolute top-8 right-8 p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-30 group">
            <X className="w-6 h-6 text-gray-900 group-hover:rotate-90 transition-transform" />
          </button>
        )}

        <div className="flex-1 p-10 lg:p-16 overflow-y-auto custom-scrollbar">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest mb-4">
              Premium Solutions
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">요금제 업그레이드</h2>
            <p className="text-gray-500 font-bold max-w-md">Notia의 인공지능 기술로 학원의 운영 효율을 극대화하세요. 모든 플랜은 월 단위 결제입니다.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`p-8 rounded-[2.5rem] text-left transition-all relative border-2 cursor-pointer group ${
                  selectedPlan === plan.id 
                  ? 'border-blue-600 scale-[1.02] shadow-2xl shadow-blue-100' 
                  : 'border-transparent hover:border-blue-200 hover:scale-[1.01] opacity-90 hover:opacity-100'
                } ${plan.color} ${plan.textColor}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl border-4 border-white">Most Popular</div>
                )}
                
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-8 ${plan.id === 'pro' ? 'bg-white/20' : 'bg-blue-50'}`}>
                  {plan.icon}
                </div>

                <h3 className="text-lg lg:text-base xl:text-lg font-black mb-1 leading-tight">{plan.name}</h3>
                <p className={`text-[11px] font-bold opacity-60 mb-8 uppercase tracking-widest leading-tight`}>{plan.description}</p>
                
                <div className="mb-10 flex items-end gap-1 flex-wrap">
                  <span className="text-2xl lg:text-xl xl:text-2xl font-black tracking-tighter">₩{plan.price}</span>
                  <span className="text-xs font-bold opacity-60 pb-1">/ 월</span>
                </div>

                <ul className="space-y-4 mb-10">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs font-bold leading-tight">
                      <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${plan.id === 'pro' ? 'bg-white/20' : 'bg-blue-50'}`}>
                        <Check className={`w-3 h-3 ${plan.id === 'pro' ? 'text-white' : 'text-blue-600'}`} />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                <div className={`w-full py-4 rounded-2xl text-center font-black text-xs uppercase tracking-widest transition-all ${
                  selectedPlan === plan.id 
                  ? (plan.id === 'pro' ? 'bg-white text-blue-600' : 'bg-blue-600 text-white')
                  : (plan.id === 'pro' ? 'bg-white/20 text-white' : 'bg-white/10 text-white')
                }`}>
                  {selectedPlan === plan.id ? 'Selected' : 'Choose Plan'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Guide Panel */}
        <div className="w-full lg:w-[400px] bg-gray-50 border-l border-gray-100 p-10 lg:p-16 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10 space-y-12">
            <div>
              <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                결제 가이드
              </h3>
              
              <div className="space-y-6">
                {/* Account Info Card */}
                <div className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 relative group">
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4">입금 계좌 정보</p>
                  <p className="text-sm font-black text-gray-400 mb-1">NH농협지역조합</p>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-2xl font-black tracking-tighter text-gray-900">3516376760453</p>
                    <button 
                      onClick={handleCopyAccount} 
                      className={`p-3 rounded-xl transition-all relative ${isCopied ? 'bg-emerald-500 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'}`}
                    >
                      {isCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      {isCopied && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-3 py-1 rounded-lg text-[10px] font-black whitespace-nowrap animate-in slide-in-from-bottom-2">
                          Copied!
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <PaymentStep step="1" text="원하시는 플랜의 금액을 위 계좌로 입금" />
                  <PaymentStep step="2" text="아래 버튼을 눌러 승인 요청 전송" />
                  <PaymentStep step="3" text="1일 내 관리자 확인 후 승인" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <a 
                href="https://open.kakao.com/o/g2aUF9ti" 
                target="_blank" 
                className="w-full py-6 bg-[#FEE500] text-[#3C1E1E] rounded-3xl font-black text-sm flex items-center justify-center gap-3 hover:bg-[#FADB00] transition-all shadow-xl shadow-yellow-200/50 active:scale-95"
              >
                <MessageCircle className="w-6 h-6" />
                카카오톡 승인 요청하기
              </a>
              <p className="text-center text-[10px] font-bold text-gray-400 leading-relaxed">
                문의: woojin052501@gmail.com <br/>
                평일 09:00 - 22:00 | 주말 10:00 - 18:00
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f1f1f1;
          border-radius: 10px;
        }
      `}</style>
    </div>
  )
}

function PaymentStep({ step, text }: { step: string, text: string }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">{step}</div>
      <p className="text-xs font-bold text-gray-500 group-hover:text-gray-900 transition-colors">{text}</p>
    </div>
  )
}
