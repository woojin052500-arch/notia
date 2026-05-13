'use client'

import { useState } from 'react'
import { 
  QrCode, 
  Search, 
  Loader2, 
  CheckCircle2, 
  LogOut, 
  LogIn, 
  AlertCircle,
  ArrowRight
} from 'lucide-react'

export default function AttendanceTestPage() {
  const [qrToken, setQrToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!qrToken) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/attendance/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken })
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        setQrToken('') // Reset after success
      } else {
        setError(data.error || '스캔 처리 중 오류가 발생했습니다.')
      }
    } catch (err) {
      setError('서버와 통신하는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto py-20 px-6">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200">
          <QrCode className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">QR 스캔 시뮬레이터</h1>
        <p className="text-sm font-medium text-gray-400 mt-2">개발 테스트 전용 페이지입니다.</p>
      </div>

      <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm mb-8">
        <form onSubmit={handleScan} className="space-y-6">
          <div>
            <label className="block text-sm font-black text-gray-700 mb-2 ml-1">QR 토큰 입력</label>
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
              <input
                required
                type="text"
                placeholder="qr_... 토큰을 입력하세요"
                value={qrToken}
                onChange={(e) => setQrToken(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 transition-all font-bold text-gray-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !qrToken}
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 active:scale-95"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                스캔 시뮬레이션
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Result Display */}
      {result && (
        <div className={`p-8 rounded-[3rem] border animate-in slide-in-from-bottom-4 duration-500 ${
          result.type === 'check-in' ? 'bg-green-50 border-green-100 text-green-700' : 
          result.type === 'check-out' ? 'bg-blue-50 border-blue-100 text-blue-700' : 
          'bg-gray-50 border-gray-100 text-gray-600'
        }`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${
              result.type === 'check-in' ? 'bg-white text-green-600' : 
              result.type === 'check-out' ? 'bg-white text-blue-600' : 
              'bg-white text-gray-400'
            }`}>
              {result.type === 'check-in' ? <LogIn className="w-6 h-6" /> : 
               result.type === 'check-out' ? <LogOut className="w-6 h-6" /> : 
               <CheckCircle2 className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-black text-lg">{result.student}</h3>
              <p className="text-xs font-bold uppercase tracking-widest opacity-70">
                {result.type === 'check-in' ? '정상 등원 처리됨' : 
                 result.type === 'check-out' ? '정상 하원 처리됨' : 
                 '이미 완료된 상태'}
              </p>
            </div>
          </div>
          <div className="text-sm font-bold opacity-80 flex justify-between items-center bg-white/50 p-4 rounded-2xl">
            <span>처리 시각</span>
            <span>{result.time || new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-6 bg-red-50 text-red-600 rounded-[2.5rem] border border-red-100 flex items-center gap-4 animate-in shake duration-300">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <p className="font-bold">{error}</p>
        </div>
      )}

      <div className="mt-12 p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">How to test</h4>
        <p className="text-xs text-gray-500 leading-relaxed font-medium">
          학생 관리 페이지에서 학생의 QR 토큰을 복사한 뒤 여기에 붙여넣어 보세요. <br />
          첫 번째 스캔은 <strong>등원</strong>, 두 번째 스캔은 <strong>하원</strong>으로 처리됩니다.
        </p>
      </div>
    </div>
  )
}
