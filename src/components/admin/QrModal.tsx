'use client'

import { QRCodeSVG } from 'qrcode.react'
import { X, Download, Share2, Printer, CheckCircle2 } from 'lucide-react'

interface QrModalProps {
  isOpen: boolean
  onClose: () => void
  student: {
    id: string
    name: string
    qr_token: string
  } | null
}

export default function QrModal({ isOpen, onClose, student }: QrModalProps) {
  if (!isOpen || !student) return null

  const handleDownload = () => {
    const svg = document.getElementById('student-qr') as any
    if (!svg) return
    
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = `QR_${student.name}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-sm bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-8 pb-0 flex justify-end">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-900"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 pt-0 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-wider mb-6">
            Attendance QR Code
          </div>
          
          <h2 className="text-3xl font-black text-gray-900 mb-2">{student.name} 학생</h2>
          <p className="text-sm font-medium text-gray-400 mb-10">등/하원 시 아래 QR을 스캔해 주세요.</p>

          {/* QR Card */}
          <div className="bg-[#F8F9FA] p-10 rounded-[2.5rem] border-2 border-dashed border-gray-100 mb-10 relative group">
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <div className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-white">
              <QRCodeSVG 
                id="student-qr"
                value={student.qr_token} 
                size={180}
                level="H"
                includeMargin={false}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-4 w-full">
            <button 
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 py-4 bg-gray-50 text-gray-700 rounded-2xl font-bold hover:bg-gray-100 transition-all text-sm"
            >
              <Download className="w-4 h-4" />
              이미지 저장
            </button>
            <button className="flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all text-sm shadow-lg shadow-blue-100">
              <Share2 className="w-4 h-4" />
              학부모 전송
            </button>
          </div>
          
          <button className="mt-4 flex items-center justify-center gap-2 py-4 w-full bg-white text-gray-400 rounded-2xl font-bold hover:text-gray-900 transition-all text-sm border border-gray-50">
            <Printer className="w-4 h-4" />
            인쇄하기
          </button>
        </div>

        {/* Footer info */}
        <div className="bg-gray-50 px-8 py-6 text-center border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-widest">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            Verified Student QR Token
          </div>
        </div>
      </div>
    </div>
  )
}
