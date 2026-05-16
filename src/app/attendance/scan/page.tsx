'use client'

import { useEffect, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { createClient } from '@/utils/supabase/client'
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Loader2,
  Camera,
  History,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'

export default function AttendanceScanPage() {
  const [scanResult, setScanResult] = useState<any>(null)
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [recentScans, setRecentScans] = useState<any[]>([])
  const [lastScannedToken, setLastScannedToken] = useState('')
  const [lastScanTime, setLastScanTime] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'reader',
      { 
        fps: 10, 
        qrbox: { width: 280, height: 280 },
        aspectRatio: 1.0
      },
      /* verbose= */ false
    )

    scanner.render(onScanSuccess, onScanFailure)

    function onScanFailure(error: any) {
      // Quietly ignore scan failures (common when no QR is in frame)
    }

    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear scanner", error);
      });
    }
  }, [])

  async function onScanSuccess(decodedText: string) {
    if (status === 'success' || status === 'scanning') return 

    // Per-student cooldown (30 seconds)
    const now_ts = Date.now()
    if (decodedText === lastScannedToken && now_ts - lastScanTime < 30000) {
      console.log('Cooldown active for this QR token')
      return
    }

    setStatus('scanning')
    setLastScannedToken(decodedText)
    setLastScanTime(now_ts)
    
    try {
      // 1. Student identification by QR Token
      const { data: student, error: sError } = await supabase
        .from('students')
        .select('*, academies(name, min_attendance_minutes)')
        .eq('qr_token', decodedText)
        .single()

      if (sError || !student) {
        throw new Error('등록되지 않은 QR 코드입니다.')
      }

      // 2. Attendance Check-in/out logic
      const now = new Date()
      // KST Date calculation (UTC+9)
      const kstOffset = 9 * 60 * 60 * 1000
      const kstDate = new Date(now.getTime() + kstOffset).toISOString().split('T')[0]
      
      const { data: latestAttendance, error: aError } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', student.id)
        .eq('created_at', kstDate)
        .order('check_in', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (aError) {
        console.error('Attendance lookup error:', aError)
        throw new Error('출결 정보를 불러오는 중 오류가 발생했습니다.')
      }

      let resultMsg = ''
      if (!latestAttendance) {
        // No record today -> Check-in
        await supabase.from('attendance').insert({
          student_id: student.id,
          academy_id: student.academy_id,
          status: 'present',
          check_in: new Date().toISOString(),
          created_at: kstDate // Force KST date
        })
        resultMsg = `${student.name} 학생, 등원 처리가 완료되었습니다.`
      } else if (!latestAttendance.check_out) {
        // Minimum Attendance Time Check
        const academiesData = student.academies as any;
        const minMinutes = (Array.isArray(academiesData) ? academiesData[0]?.min_attendance_minutes : academiesData?.min_attendance_minutes) || 50;
        const checkInTime = new Date(latestAttendance.check_in);
        const elapsedMinutes = (now.getTime() - checkInTime.getTime()) / 60000;
        
        if (elapsedMinutes < minMinutes) {
          throw new Error(`최소 학습 시간(${minMinutes}분)이 지나지 않아 하원할 수 없습니다. (현재 ${Math.floor(elapsedMinutes)}분 경과)`);
        }

        await supabase
          .from('attendance')
          .update({ 
            check_out: new Date().toISOString(), 
            status: 'left' 
          })
          .eq('id', latestAttendance.id)
        resultMsg = `${student.name} 학생, 하원 처리가 완료되었습니다.`
      } else {
        // Already checked out -> Start a NEW check-in (supports multiple visits per day)
        await supabase.from('attendance').insert({
          student_id: student.id,
          academy_id: student.academy_id,
          status: 'present',
          check_in: new Date().toISOString(),
          created_at: kstDate // Force KST date
        })
        resultMsg = `${student.name} 학생, 다시 등원 처리가 되었습니다.`
      }

      setScanResult({ name: student.name, message: resultMsg })
      setStatus('success')
      setRecentScans(prev => [{ name: student.name, time: new Date().toLocaleTimeString(), status: resultMsg.includes('등원') ? '등원' : '하원' }, ...prev].slice(0, 5))

      // Auto reset after 3 seconds
      setTimeout(() => {
        setStatus('idle')
        setScanResult(null)
      }, 3000)

    } catch (err: any) {
      setStatus('error')
      setErrorMsg(err.message)
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans overflow-hidden flex flex-col">
      {/* Premium Header */}
      <header className="p-8 flex justify-between items-center bg-black/40 backdrop-blur-2xl border-b border-white/5 relative z-20">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black tracking-tight">Notia Smart Scanner</h1>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Kiosk Attendance Mode</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white/5 px-6 py-2.5 rounded-full border border-white/10">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-black tracking-widest uppercase">System Online</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row p-8 gap-8 relative z-10">
        {/* Left: Scanner Area */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-blue-600/5 blur-[120px] rounded-full"></div>
          <div className="relative h-full bg-white/[0.02] border border-white/10 rounded-[3.5rem] overflow-hidden flex flex-col items-center justify-center p-12">
            
            {/* Success Overlay */}
            {status === 'success' && (
              <div className="absolute inset-0 z-30 bg-green-600/90 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                <CheckCircle2 className="w-32 h-32 text-white mb-8 animate-bounce" />
                <h2 className="text-4xl font-black text-white mb-2">{scanResult.name}</h2>
                <p className="text-xl font-bold text-green-100">{scanResult.message}</p>
                <div className="mt-12 px-8 py-3 bg-white/20 rounded-full text-xs font-black uppercase tracking-widest animate-pulse">
                  Processing next student...
                </div>
              </div>
            )}

            {/* Error Overlay */}
            {status === 'error' && (
              <div className="absolute inset-0 z-30 bg-red-600/90 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                <AlertCircle className="w-32 h-32 text-white mb-8" />
                <h2 className="text-3xl font-black text-white mb-4">인식 실패</h2>
                <p className="text-xl font-bold text-red-100 text-center max-w-md">{errorMsg}</p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="mt-12 px-10 py-4 bg-white text-red-600 rounded-2xl font-black text-sm hover:scale-105 transition-all"
                >
                  다시 시도
                </button>
              </div>
            )}

            <div className="w-full max-w-md mx-auto space-y-12">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-400">
                  <Camera className="w-3 h-3" />
                  Live Camera Feed
                </div>
                <h2 className="text-3xl font-black tracking-tight">QR 코드를 스캔하세요</h2>
                <p className="text-gray-500 font-medium">가이드 영역 안에 QR 코드를 맞춰주세요.</p>
              </div>

              <div className="relative group">
                {/* Corner Accents */}
                <div className="absolute -top-2 -left-2 w-12 h-12 border-t-4 border-l-4 border-blue-600 rounded-tl-3xl z-20 transition-all group-hover:scale-110"></div>
                <div className="absolute -top-2 -right-2 w-12 h-12 border-t-4 border-r-4 border-blue-600 rounded-tr-3xl z-20 transition-all group-hover:scale-110"></div>
                <div className="absolute -bottom-2 -left-2 w-12 h-12 border-b-4 border-l-4 border-blue-600 rounded-bl-3xl z-20 transition-all group-hover:scale-110"></div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 border-b-4 border-r-4 border-blue-600 rounded-br-3xl z-20 transition-all group-hover:scale-110"></div>
                
                <div id="reader" className="relative z-10 w-full aspect-square rounded-[3rem] overflow-hidden bg-black border border-white/10"></div>
                
                {/* Scanning line animation */}
                {status === 'idle' && (
                  <div className="absolute inset-0 z-15 pointer-events-none overflow-hidden rounded-[3rem]">
                    <div className="w-full h-1 bg-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.8)] absolute top-0 animate-scan"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: History & Info Area */}
        <div className="w-full lg:w-[400px] space-y-8 flex flex-col">
          <section className="bg-white/5 border border-white/10 rounded-[3rem] p-10 flex-1 flex flex-col">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3">
              <History className="w-5 h-5 text-blue-400" />
              최근 출결 내역
            </h3>
            <div className="space-y-4 flex-1">
              {recentScans.map((scan, i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-white/[0.03] border border-white/5 rounded-3xl animate-in slide-in-from-top-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                      scan.status === '등원' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {scan.name[0]}
                    </div>
                    <div>
                      <p className="font-black text-sm">{scan.name}</p>
                      <p className="text-[10px] font-bold text-gray-500">{scan.time}</p>
                    </div>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    scan.status === '등원' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
                  }`}>
                    {scan.status}
                  </span>
                </div>
              ))}
              {recentScans.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                  <Loader2 className="w-8 h-8 mb-4 animate-spin" />
                  <p className="text-sm font-bold">기다리는 중...</p>
                </div>
              )}
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/5">
              <div className="bg-blue-600/10 border border-blue-500/20 rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">AI Safety Active</p>
                </div>
                <p className="text-xs font-bold text-gray-400 leading-relaxed">
                  스캔과 동시에 학부모님께 출결 알림톡이 즉시 전송됩니다.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <style jsx global>{`
        #reader__dashboard_section_csr button {
          background-color: #2563eb !important;
          color: white !important;
          border: none !important;
          padding: 12px 24px !important;
          border-radius: 12px !important;
          font-weight: 900 !important;
          font-size: 12px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
        }
        #reader__dashboard_section_csr button:hover {
          background-color: #1d4ed8 !important;
          transform: scale(1.05) !important;
        }
        #reader__status_span {
          color: #94a3b8 !important;
          font-size: 10px !important;
          font-weight: 700 !important;
        }
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  )
}
