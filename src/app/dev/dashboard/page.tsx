'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  Terminal, 
  Users, 
  Building2, 
  CreditCard, 
  Zap, 
  CheckCircle, 
  XCircle, 
  Search,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Cpu,
  BarChart3
} from 'lucide-react'

export default function DevDashboardPage() {
  const [academies, setAcademies] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalAcademies: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    aiUsage: 0
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchDevData = async () => {
      // 1. Fetch Academies
      const { data } = await supabase
        .from('academies')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) {
        setAcademies(data)
        setStats({
          totalAcademies: data.length,
          activeSubscriptions: data.filter(a => a.status === 'active').length,
          monthlyRevenue: data.filter(a => a.status === 'active').length * 29900, // Pro plan as average
          aiUsage: data.reduce((acc, a) => acc + (a.ai_credits_used || 0), 0)
        })
      }
      setLoading(false)
    }
    fetchDevData()
  }, [])

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('academies')
      .update({ status: newStatus })
      .eq('id', id)
    
    if (!error) {
      setAcademies(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a))
      alert(`상태가 ${newStatus}로 변경되었습니다.`)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-300 p-8 font-mono">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50">
              <Terminal className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tighter">NOTIA_DEV_DASHBOARD_V1.0</h1>
              <p className="text-xs text-blue-500 font-bold uppercase tracking-widest">System Health: Operational</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-xs">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Real-time Monitoring Active
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <DevStatCard label="TOTAL_ACADEMIES" value={stats.totalAcademies} icon={<Building2 />} color="text-blue-400" />
          <DevStatCard label="ACTIVE_SUBS" value={stats.activeSubscriptions} icon={<CheckCircle />} color="text-green-400" />
          <DevStatCard label="EST_REVENUE" value={`₩${stats.monthlyRevenue.toLocaleString()}`} icon={<CreditCard />} color="text-purple-400" />
          <DevStatCard label="AI_MODEL_USAGE" value={stats.aiUsage} icon={<Cpu />} color="text-orange-400" />
        </div>

        {/* Academy Management List */}
        <div className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden backdrop-blur-md">
          <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              ACADEMY_MANAGEMENT
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search slug or ID..." 
                className="bg-black/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase font-black text-gray-500 bg-white/[0.01]">
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Academy Name</th>
                  <th className="px-8 py-4">Plan</th>
                  <th className="px-8 py-4">AI Usage</th>
                  <th className="px-8 py-4">Registered At</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {academies.map((academy) => (
                  <tr key={academy.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        academy.status === 'active' ? 'bg-green-500/10 text-green-500' : 
                        academy.status === 'pending' ? 'bg-orange-500/10 text-orange-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {academy.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-bold text-white">{academy.name}</p>
                      <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">{academy.slug}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-gray-400 uppercase">{academy.plan_type}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="w-full max-w-[100px] h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500" 
                          style={{ width: `${(academy.ai_credits_used / academy.ai_credits_limit) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-2">{academy.ai_credits_used} / {academy.ai_credits_limit}</p>
                    </td>
                    <td className="px-8 py-6 text-xs text-gray-500">
                      {new Date(academy.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        {academy.status !== 'active' && (
                          <button 
                            onClick={() => handleStatusChange(academy.id, 'active')}
                            className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500 hover:text-white transition-all"
                            title="Approve Subscription"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {academy.status !== 'suspended' && (
                          <button 
                            onClick={() => handleStatusChange(academy.id, 'suspended')}
                            className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                            title="Suspend Academy"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 transition-all">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function DevStatCard({ label, value, icon, color }: any) {
  return (
    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 bg-white/5 rounded-lg ${color}`}>{icon}</div>
        <p className="text-[10px] font-black text-gray-500 tracking-[0.2em]">{label}</p>
      </div>
      <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
    </div>
  )
}
