import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import InteractiveRoadmap from '../components/dashboard/InteractiveRoadmap'
import JourneyCard from '../components/dashboard/JourneyCard'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { dashboardAPI, workflowAPI } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { FileText, Clock, CheckCircle, Award, Plus, MessageCircle, Map as MapIcon, Sparkles } from 'lucide-react'

export default function DashboardPage() {
  const { token } = useAuth()
  const [stats, setStats] = useState(null)
  const [journeys, setJourneys] = useState([])
  const [activeWorkflow, setActiveWorkflow] = useState(null)
  const [schemes, setSchemes] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsData, journeysData] = await Promise.all([
        dashboardAPI.stats(),
        dashboardAPI.journeys().catch(() => []),
      ])
      setStats(statsData)
      setJourneys(journeysData)

      if (journeysData.length > 0) {
        const active = journeysData.find(j => j.status === 'active') || journeysData[0]
        try {
          // Assume the active journey has roadmap data
          const workflowData = await workflowAPI.get(active.intent_id)
          // In real implementation, this might come from a different endpoint or the journey itself
          setActiveWorkflow({ 
            title: active.intent_name, 
            steps: active.steps || workflowData.steps || workflowData 
          })
          
          if (active.schemes) {
            setSchemes(active.schemes)
          }
        } catch (e) {
          console.error("Failed to load workflow", e)
        }
      }
    } catch (err) {
      console.error('Dashboard load error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) return
    loadData()
  }, [token])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-navy-100 rounded w-48" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-20 bg-navy-50 rounded-xl" />)}
          </div>
          <div className="h-40 bg-navy-50 rounded-xl" />
        </div>
      </div>
    )
  }

  const statCards = [
    { label: 'Active Journeys', value: stats?.active_journeys || 0, icon: FileText, color: 'text-navy-600' },
    { label: 'Completed Steps', value: stats?.completed_steps || 0, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Uploaded Docs', value: stats?.uploaded_documents || 0, icon: Clock, color: 'text-saffron-600' },
    { label: 'Eligible Schemes', value: stats?.eligible_schemes || 0, icon: Award, color: 'text-purple-600' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Dashboard</h1>
          <p className="text-sm text-navy-500 mt-1">Track and manage all your government service journeys</p>
        </div>
        <Link to="/chat">
          <Button className="bg-saffron-500 hover:bg-saffron-600 text-white shadow-lg">
            <Plus size={16} />
            New Journey
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="p-4 border-none shadow-sm bg-white/80 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center">
                  <Icon size={18} className={stat.color} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-navy-900">{stat.value}</p>
                  <p className="text-xs text-navy-500">{stat.label}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          {activeWorkflow ? (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-navy-900 flex items-center gap-2">
                  <MapIcon size={20} className="text-navy-400" />
                  Active Roadmap: {activeWorkflow.title}
                </h2>
                <Badge variant="success">In Progress</Badge>
              </div>
              <InteractiveRoadmap steps={activeWorkflow.steps} />
            </div>
          ) : (
             <div className="mb-8 h-[300px] flex flex-col items-center justify-center bg-navy-50/50 rounded-2xl border-2 border-dashed border-navy-100">
                <p className="text-navy-400 font-medium">No active journey selected</p>
                <Link to="/chat" className="mt-2 text-saffron-600 font-bold hover:underline">Start a journey</Link>
             </div>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-navy-900 flex items-center gap-2">
            <Sparkles size={20} className="text-saffron-500" />
            AI Recommended Schemes
          </h2>
          <div className="space-y-4">
            {(schemes.length > 0 ? schemes : [
              { name: "PM SVANidhi", match_score: 95, benefit: "Rs. 10,000 Interest-free loan" },
              { name: "Mudra Loan", match_score: 88, benefit: "Business capital support" },
              { name: "PMEGP", match_score: 82, benefit: "Subsidy for new enterprise" }
            ]).map((scheme, i) => (
              <Card key={i} className="p-4 border-l-4 border-l-saffron-400">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-navy-900 text-sm">{scheme.name}</h3>
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                    {scheme.match_score}% Match
                  </span>
                </div>
                <p className="text-xs text-navy-500 mb-2">{scheme.benefit}</p>
                <Button variant="ghost" className="h-7 text-[10px] px-2 py-0">View Details</Button>
              </Card>
            ))}
          </div>

          <Card className="bg-navy-900 text-white p-4">
            <h3 className="font-bold mb-1 flex items-center gap-2">
              <Award size={16} className="text-saffron-400" />
              Saarthi Pro
            </h3>
            <p className="text-[10px] text-navy-200 mb-3">Unlock automatic form-filling and priority verification.</p>
            <Button className="w-full bg-saffron-500 hover:bg-saffron-600 border-none h-8 text-xs">Upgrade Now</Button>
          </Card>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-navy-900 mb-4">Your Journeys</h2>
        {journeys.length === 0 ? (
          <Card className="p-8 text-center bg-white/50 border-dashed border-2">
            <MessageCircle size={40} className="mx-auto text-navy-300 mb-3" />
            <h3 className="text-lg font-semibold text-navy-700 mb-1">No journeys yet</h3>
            <p className="text-sm text-navy-500 mb-4">Tell Saarthi AI what you want to do and we'll create a roadmap for you.</p>
            <Link to="/chat">
              <Button>Start Your First Journey</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {journeys.map((journey) => (
              <JourneyCard key={journey.id} journey={journey} />
            ))}
          </div>
        )}
      </div>

      {stats?.recent_activities?.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-navy-900 mb-4">Recent Activity</h2>
          <Card className="divide-y divide-navy-50">
            {stats.recent_activities.map((activity, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  activity.type === 'journey' ? 'bg-saffron-500' :
                  activity.status === 'verified' ? 'bg-green-500' : 'bg-navy-300'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-navy-700 truncate">{activity.title}</p>
                  <p className="text-xs text-navy-400">
                    {new Date(activity.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  )
}
