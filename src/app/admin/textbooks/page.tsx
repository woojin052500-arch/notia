'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Plus, BookOpen, Trash2, Loader2, Info } from 'lucide-react'

export default function TextbooksPage() {
  const [textbooks, setTextbooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [academyId, setAcademyId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchTextbooks()
  }, [])

  const fetchTextbooks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: academy } = await supabase
        .from('academies')
        .select('id')
        .eq('owner_id', user.id)
        .single()
      
      if (academy) {
        setAcademyId(academy.id)
        const { data } = await supabase
          .from('textbooks')
          .select('*')
          .eq('academy_id', academy.id)
          .order('created_at', { ascending: false })
        
        setTextbooks(data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTextbook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !price || !academyId) return
    setSaving(true)
    setError('')

    try {
      const { error } = await supabase
        .from('textbooks')
        .insert([{
          academy_id: academyId,
          name,
          price: parseInt(price)
        }])

      if (error) throw error

      setName('')
      setPrice('')
      fetchTextbooks()
    } catch (err: any) {
      setError(err.message || '교재 추가 중 오류가 발생했습니다. (DB 테이블 생성을 확인해주세요)')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('이 교재를 삭제하시겠습니까? (이미 학생에게 지급된 내역은 유지됩니다)')) return
    
    try {
      const { error } = await supabase
        .from('textbooks')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      fetchTextbooks()
    } catch (err: any) {
      alert('삭제 실패: ' + err.message)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            교재 관리
          </h1>
          <p className="mt-2 text-gray-400 font-bold">학원에서 사용하는 교재 리스트와 가격을 관리하세요.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm sticky top-28">
            <h2 className="text-xl font-black text-gray-900 mb-6">새 교재 등록</h2>
            <form onSubmit={handleAddTextbook} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">교재 이름</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 개념원리 수학(상)"
                  className="w-full px-5 py-4 bg-gray-50 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl focus:ring-4 focus:ring-blue-50 transition-all font-bold text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">교재 가격 (원)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="예: 15000"
                  className="w-full px-5 py-4 bg-gray-50 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl focus:ring-4 focus:ring-blue-50 transition-all font-bold text-gray-900"
                />
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full py-4 bg-[#1A1A1A] text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-xl shadow-gray-200 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                교재 등록
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-black text-gray-900">등록된 교재 리스트</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-black">총 {textbooks.length}권</span>
            </div>
            
            {loading ? (
              <div className="p-12 flex justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : textbooks.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="font-bold">등록된 교재가 없습니다.</p>
                <p className="text-sm mt-1">좌측 폼에서 첫 교재를 등록해보세요.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {textbooks.map((tb) => (
                  <li key={tb.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                    <div>
                      <h3 className="font-black text-gray-900 text-lg">{tb.name}</h3>
                      <p className="text-blue-600 font-bold mt-1">{tb.price.toLocaleString()}원</p>
                    </div>
                    <button
                      onClick={() => handleDelete(tb.id)}
                      className="p-3 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
