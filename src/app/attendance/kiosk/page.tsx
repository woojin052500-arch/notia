'use client'

import { useEffect, useState, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Loader2,
  Camera,
  UserCheck
} from 'lucide-react'

export default function AttendanceKioskPage() {
  const [scanResult, setScanResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  async function onScanSuccess(decodedText: string) {
    if (loading || scanResult) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/attendance/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken: decodedText })
      })

      const data = await response.json()
      
      if (data.success) {
        setScanResult(data)
        // Reset after 3 seconds
        setTimeout(() => {
          setScanResult(null)
        }, 3000)
      } else {
        setError(data.error || '출결 처리 중 오류가 발생했습니다.')
        setTimeout(() => setError(null), 3000)
      }
    } catch (err) {
      setError('서버 연결에 실패했습니다.')
      setTimeout(() => setError(null), 3000)
    } finally {
      setLoading(false)
    }
  }

  function onScanFailure(error: any) {
    // Quietly ignore scan failures
  }

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      'reader',
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      /* verbose= */ false
    )

    scannerRef.current.render(onScanSuccess, onScanFailure)

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error('Failed to clear scanner', error)
        })
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-[#1A1A1A] p-10 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600 rounded-full opacity-20 -mr-20 -mt-20 blur-3xl"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/20 text-blue-400 rounded-lg text-xs font-black uppercase tracking-widest mb-4">
              Attendance Kiosk
            </div>
            <h1 className="text-4xl font-black tracking-tight flex items-center justify-center gap-3">
              <GraduationCap className="w-10 h-10 text-blue-400" />
              Notia 출결 센터
            </h1>
            <p className="text-gray-400 mt-2 font-bold">학생증 QR코드를 카메라에 보여주세요.</p>
          </div>
        </div>

        {/* Scanner Body */}
        <div className="p-10 flex flex-col items-center">
          <div className="relative w-full aspect-square max-w-[400px] bg-gray-50 rounded-[2.5rem] border-4 border-dashed border-gray-200 flex items-center justify-center overflow-hidden mb-10 shadow-inner">
            <div id="reader" className="w-full h-full scale-x-[-1]"></div>
            
            {/* Overlay when loading */}
            {loading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-blue-900 font-black">정보 확인 중...</p>
              </div>
            )}

            {/* Success Overlay */}
            {scanResult && (
              <div className="absolute inset-0 bg-green-500 flex flex-col items-center justify-center z-50 animate-in fade-in zoom-in duration-300">
                <CheckCircle2 className="w-24 h-24 text-white mb-6 animate-bounce" />
                <h2 className="text-4xl font-black text-white mb-2">{scanResult.student}</h2>
                <p className="text-white text-xl font-bold opacity-90">
                  {scanResult.type === 'check-in' ? '반가워요! 등원 완료' : '수고했어요! 하원 완료'}
                </p>
                {scanResult.predictedArrival && (
                  <div className="mt-6 bg-white/20 px-6 py-3 rounded-2xl backdrop-blur-md">
                    <p className="text-white text-sm font-black">예상 귀가: {scanResult.predictedArrival}</p>
                  </div>
                )}
              </div>
            )}

            {/* Error Overlay */}
            {error && (
              <div className="absolute inset-0 bg-red-500 flex flex-col items-center justify-center z-50 animate-in fade-in zoom-in duration-300">
                <AlertCircle className="w-20 h-20 text-white mb-4" />
                <p className="text-white text-xl font-black px-10 text-center">{error}</p>
              </div>
            )}
          </div>

          {/* Status Bar */}
          <div className="w-full flex gap-4">
            <div className="flex-1 p-6 bg-blue-50 rounded-[2rem] border border-blue-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-600">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] text-blue-400 font-black uppercase tracking-wider">현재 시간</p>
                <p className="text-xl font-black text-blue-900">{new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
            <div className="flex-1 p-6 bg-green-50 rounded-[2rem] border border-green-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-green-600">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] text-green-400 font-black uppercase tracking-wider">시스템 상태</p>
                <p className="text-xl font-black text-green-900">정상 작동</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-400 font-bold flex items-center justify-center gap-2">
            <Camera className="w-4 h-4" />
            Notia Web Kiosk System v1.0
          </p>
        </div>
      </div>

      <style jsx global>{`
        #reader__dashboard_section_csr button {
          background-color: #0066FF !important;
          color: white !important;
          border-radius: 0.75rem !important;
          padding: 0.5rem 1rem !important;
          font-weight: 800 !important;
          border: none !important;
          margin-top: 1rem !important;
        }
        #reader__scan_region {
          border: none !important;
        }
        #reader video {
          border-radius: 2rem !important;
          object-fit: cover !important;
        }
      `}</style>
    </div>
  )
}
