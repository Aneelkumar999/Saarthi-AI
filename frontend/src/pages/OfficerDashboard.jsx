import { useState, useEffect } from 'react'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { dashboardAPI } from '../api/client'
import { 
  BarChart3, Users, FileCheck, AlertCircle, 
  TrendingUp, Activity, Search, Map, ShieldCheck,
  Zap, Clock, BrainCircuit, MousePointer, Info
} from 'lucide-react'

export default function OfficerDashboard() {
  const [stats, setStats] = useState(null)
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      // In a real app, these would be specific admin/officer endpoints
      // We already have some admin endpoints in dynamic.py
      const statsData = await dashboardAPI.stats() 
      const auditData = [
        { action: 'system_alert', detail: { message: 'High volume of FSSAI requests in Hyderabad' }, timestamp: new Date().toISOString() },
        { action: 'approval', detail: { message: 'District Officer approved 45 trade licenses' }, timestamp: new Date(Date.now() - 3600000).toISOString() },
        { action: 'rule_update', detail: { message: 'New eligibility criteria for MSME schemes applied' }, timestamp: new Date(Date.now() - 7200000).toISOString() },
      ]
      setStats(statsData)
      setAuditLogs(auditData)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) return <div className="p-8 text-center text-navy-500">Loading command center...</div>

  const metrics = [
    { label: 'Total Citizens', value: '12,842', icon: Users, color: 'text-blue-600', trend: '+12%' },
    { label: 'Applications Pending', value: stats?.active_journeys || '432', icon: FileCheck, color: 'text-saffron-600', trend: '-5%' },
    { label: 'Verified Documents', value: stats?.uploaded_documents || '28,901', icon: Activity, color: 'text-green-600', trend: '+18%' },
    { label: 'System Alerts', value: '3', icon: AlertCircle, color: 'text-red-600', trend: 'Stable' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 flex items-center gap-2">
            <ShieldCheck size={24} className="text-navy-900" />
            Government Officer Command Center
          </h1>
          <p className="text-sm text-navy-500 mt-1">Real-time monitoring and administrative oversight</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="success" className="px-3 py-1">System Live</Badge>
          <button className="p-2 bg-white border border-navy-200 rounded-lg text-navy-600 hover:bg-navy-50">
             <Search size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((m, i) => {
          const Icon = m.icon
          return (
            <Card key={i} className="p-4 border-none shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg bg-navy-50 ${m.color}`}>
                  <Icon size={20} />
                </div>
                <span className={`text-[10px] font-bold ${m.trend.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>
                  {m.trend}
                </span>
              </div>
              <p className="text-2xl font-bold text-navy-900">{m.value}</p>
              <p className="text-[10px] text-navy-400 font-bold uppercase tracking-wider">{m.label}</p>
            </Card>
          )
        })}
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-bold text-navy-900 mb-6 flex items-center gap-2">
          <Zap size={20} className="text-saffron-500" />
          User Performance & Usage Analytics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <Card className="p-5 border-l-4 border-l-blue-500">
              <div className="flex items-center gap-3 mb-4">
                 <Clock size={20} className="text-blue-500" />
                 <h3 className="text-sm font-bold text-navy-900 uppercase">Avg. Completion Time</h3>
              </div>
              <div className="flex items-end gap-2">
                 <span className="text-3xl font-black text-navy-900">4.2</span>
                 <span className="text-navy-400 text-sm font-medium mb-1">Days / Journey</span>
              </div>
              <p className="text-[10px] text-navy-500 mt-2">15% faster than manual processing</p>
           </Card>

           <Card className="p-5 border-l-4 border-l-green-500">
              <div className="flex items-center gap-3 mb-4">
                 <BrainCircuit size={20} className="text-green-500" />
                 <h3 className="text-sm font-bold text-navy-900 uppercase">AI Extraction Accuracy</h3>
              </div>
              <div className="flex items-end gap-2">
                 <span className="text-3xl font-black text-navy-900">97.8%</span>
                 <span className="text-navy-400 text-sm font-medium mb-1">Success</span>
              </div>
              <p className="text-[10px] text-navy-500 mt-2">0.2% manual correction required</p>
           </Card>

           <Card className="p-5 border-l-4 border-l-saffron-500">
              <div className="flex items-center gap-3 mb-4">
                 <MousePointer size={20} className="text-saffron-500" />
                 <h3 className="text-sm font-bold text-navy-900 uppercase">Usage Drop-off Rate</h3>
              </div>
              <div className="flex items-end gap-2">
                 <span className="text-3xl font-black text-navy-900">12%</span>
                 <span className="text-navy-400 text-sm font-medium mb-1">Abandonment</span>
              </div>
              <p className="text-[10px] text-navy-500 mt-2">Primary point: Document Payment Step</p>
           </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-navy-900 mb-6 flex items-center gap-2">
              <BarChart3 size={20} className="text-navy-400" />
              Service Request Trends (7 Days)
            </h2>
            <div className="h-64 flex items-end justify-between gap-2">
              {[60, 45, 80, 55, 90, 70, 85].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-navy-900/10 rounded-t-lg hover:bg-saffron-400 transition-all cursor-pointer" 
                    style={{ height: `${h}%` }}
                  ></div>
                  <span className="text-[10px] text-navy-400 font-medium">Day {i+1}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-red-500" />
              Usage Bottlenecks & Drop-offs
            </h2>
            <div className="space-y-4">
               {[
                 { step: 'Trade License - Fee Payment', avg_time: '2.4 Days', status: 'Critical', color: 'bg-red-50 text-red-700' },
                 { step: 'FSSAI - Site Inspection', avg_time: '1.8 Days', status: 'Warning', color: 'bg-saffron-50 text-saffron-700' },
                 { step: 'Aadhaar Verification', avg_time: '0.2 Days', status: 'Optimal', color: 'bg-green-50 text-green-700' },
               ].map((b, i) => (
                 <div key={i} className="flex items-center justify-between p-3 border border-navy-100 rounded-xl bg-white shadow-sm">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-navy-50 flex items-center justify-center">
                        <Info size={14} className="text-navy-400" />
                     </div>
                     <div>
                       <p className="text-sm font-bold text-navy-900">{b.step}</p>
                       <p className="text-[10px] text-navy-400">Avg. wait time: {b.avg_time}</p>
                     </div>
                   </div>
                   <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${b.color}`}>
                     {b.status}
                   </span>
                 </div>
               ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-navy-400" />
              Top Requested Services
            </h2>
            <div className="space-y-4">
              {[
                { name: 'Trade License (GHMC)', count: 1240, status: 'High Volume' },
                { name: 'Birth Certificate', count: 890, status: 'Normal' },
                { name: 'FSSAI Registration', count: 750, status: 'High Volume' },
                { name: 'Income Certificate', count: 620, status: 'Normal' },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-navy-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-xs font-bold text-navy-900 shadow-sm">
                      {i+1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-navy-900">{s.name}</p>
                      <p className="text-[10px] text-navy-400">{s.count} requests this month</p>
                    </div>
                  </div>
                  <Badge color={s.status === 'High Volume' ? 'saffron' : 'green'}>{s.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-8">
           <Card className="p-6">
              <h2 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
                <Map size={20} className="text-navy-400" />
                Regional Distribution
              </h2>
              <div className="space-y-4">
                {[
                  { region: 'Hyderabad', percent: 45 },
                  { region: 'Rangareddy', percent: 25 },
                  { region: 'Medchal', percent: 15 },
                  { region: 'Warangal', percent: 10 },
                  { region: 'Others', percent: 5 },
                ].map((r, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-navy-700">{r.region}</span>
                      <span className="font-bold text-navy-900">{r.percent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-navy-100 rounded-full">
                      <div className="h-full bg-navy-900 rounded-full" style={{ width: `${r.percent}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
           </Card>

           <Card className="p-6">
              <h2 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
                <Activity size={20} className="text-navy-400" />
                Live Audit Log
              </h2>
              <div className="space-y-4">
                {auditLogs.map((log, i) => (
                  <div key={i} className="flex gap-3 relative pb-4 last:pb-0">
                    {i !== auditLogs.length - 1 && (
                      <div className="absolute left-1.5 top-4 bottom-0 w-0.5 bg-navy-100"></div>
                    )}
                    <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${
                      log.action === 'system_alert' ? 'bg-red-500' : 
                      log.action === 'approval' ? 'bg-green-500' : 'bg-navy-300'
                    }`} />
                    <div>
                      <p className="text-[11px] font-bold text-navy-900 leading-tight">{log.detail.message}</p>
                      <p className="text-[9px] text-navy-400 mt-0.5">{new Date(log.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  )
}

