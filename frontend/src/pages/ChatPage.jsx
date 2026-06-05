import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { chatAPI, dashboardAPI } from '../api/client'
import { useAuth } from '../context/AuthContext'
import ChatMessage from '../components/chat/ChatMessage'
import ChatInput from '../components/chat/ChatInput'
import { Bot, FileText, ChevronRight, CheckCircle, Clock, Lock } from 'lucide-react'

const statusIcon = {
  Ready: <FileText size={14} className="text-green-500" />,
  'Blocked by Step 1': <Lock size={14} className="text-red-400" />,
  Pending: <Clock size={14} className="text-navy-300" />,
  Optional: <CheckCircle size={14} className="text-saffron-400" />,
}

export default function ChatPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { token } = useAuth()
  const initialQuery = location.state?.initialQuery || ''
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [roadmap, setRoadmap] = useState(null)
  const [showRoadmap, setShowRoadmap] = useState(false)
  const [createdJourneyId, setCreatedJourneyId] = useState(null)
  const scrollRef = useRef(null)

  const handleSend = async (text) => {
    setMessages(prev => [...prev, { text, isUser: true }])
    setLoading(true)

    try {
      const data = await chatAPI.send(text)
      setMessages(prev => [...prev, { text: data.response, isUser: false }])

      if (data.roadmap) {
        setRoadmap(data.roadmap)
        setShowRoadmap(true)

        if (token && data.intent_id) {
          try {
            const journeyRes = await dashboardAPI.createJourney(data.intent_id)
            setCreatedJourneyId(journeyRes.journey_id || journeyRes.id)
          } catch (e) {
            console.error("Failed to create journey automatically", e)
          }
        }
      }
    } catch (_err) {
      setMessages(prev => [...prev, {
        text: "Sorry, I couldn't process that. Please make sure the backend is running and try again.",
        isUser: false
      }])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialQuery) handleSend(initialQuery)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, showRoadmap])

  const handleStartJourney = () => {
    if (createdJourneyId) {
      navigate(`/workflow/${createdJourneyId}`)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)] flex">
      {/* Chat Panel */}
      <div className={`flex flex-col ${showRoadmap ? 'w-1/2 border-r border-navy-100' : 'w-full'}`}>
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-saffron-500 flex items-center justify-center mb-4">
                <Bot size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-navy-900 mb-2">Saarthi AI Assistant</h3>
              <p className="text-navy-500 text-sm max-w-md">
                Tell me what you want to do and I'll create a personalized roadmap for you.
              </p>
              <div className="flex flex-wrap gap-2 mt-4 max-w-lg justify-center">
                {['I want to open a tea shop', 'Birth certificate for my baby', 'Apply for farm subsidy', 'Start a restaurant', 'Driving license', 'Student scholarship'].map((s, i) => (
                  <button key={i} onClick={() => handleSend(s)} className="px-3 py-1.5 bg-white border border-navy-100 rounded-full text-xs text-navy-500 hover:border-navy-300 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} isUser={msg.isUser} />
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-saffron-500 flex items-center justify-center shrink-0">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-white border border-navy-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-navy-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 bg-navy-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 bg-navy-300 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}
        </div>

        <ChatInput onSend={handleSend} disabled={loading} />
      </div>

      {/* Roadmap Panel */}
      {showRoadmap && roadmap && (
        <div className="w-1/2 overflow-y-auto bg-navy-50/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-navy-900">{roadmap.title}</h2>
            <button onClick={() => { setShowRoadmap(false); setRoadmap(null) }} className="text-sm text-navy-400 hover:text-navy-600">
              Close
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
            <div className="bg-white rounded-xl p-3 border border-navy-100">
              <span className="text-xs text-navy-400">Location</span>
              <p className="font-medium text-navy-900">{roadmap.location}</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-navy-100">
              <span className="text-xs text-navy-400">Timeline</span>
              <p className="font-medium text-navy-900">{roadmap.timeline} days</p>
            </div>
          </div>

          {roadmap.fastestPath && (
            <div className="bg-saffron-50 border border-saffron-200 rounded-xl p-4 mb-6 text-sm">
              <span className="font-medium text-saffron-700">Fastest Path: </span>
              <span className="text-saffron-800">{roadmap.fastestPath}</span>
            </div>
          )}

          {roadmap.teluguHint && (
            <div className="bg-navy-50 border border-navy-200 rounded-xl p-4 mb-6 text-sm">
              <span className="font-medium text-navy-600">తెలుగు సూచన: </span>
              <span className="text-navy-700">{roadmap.teluguHint}</span>
            </div>
          )}

          <h3 className="font-semibold text-navy-900 mb-3">Roadmap Steps</h3>
          <div className="space-y-3 mb-6">
            {roadmap.steps?.map((step, i) => (
              <div key={i} className="bg-white rounded-xl border border-navy-100 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center text-xs font-bold text-navy-600 shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-navy-900">{step.title}</h4>
                      {statusIcon[step.status]}
                    </div>
                    <p className="text-xs text-navy-500 mt-0.5">{step.dept}</p>
                    {step.days && <p className="text-xs text-navy-400 mt-1">Est. {step.days}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {roadmap.schemes?.length > 0 && (
            <>
              <h3 className="font-semibold text-navy-900 mb-3 flex items-center gap-2">
                <CheckCircle size={18} className="text-green-500" />
                Recommended Schemes
              </h3>
              <div className="space-y-3 mb-6">
                {roadmap.schemes.map((scheme, i) => {
                  const isObject = typeof scheme === 'object' && scheme !== null;
                  const name = isObject ? (scheme.name || 'Scheme') : scheme;
                  const score = isObject ? scheme.match_score : null;
                  const benefit = isObject ? scheme.benefit : null;

                  return (
                    <div key={i} className="bg-white border border-green-100 rounded-xl p-3 shadow-sm relative overflow-hidden">
                      {score && (
                        <div className="absolute top-0 right-0 px-2 py-0.5 bg-green-500 text-[10px] font-bold text-white rounded-bl-lg">
                          {score}% Match
                        </div>
                      )}
                      <h4 className="text-sm font-bold text-navy-900 pr-12">{name}</h4>
                      {benefit && <p className="text-[11px] text-green-700 mt-1 font-medium">{benefit}</p>}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/documents')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-navy-200 rounded-xl text-sm font-medium text-navy-700 hover:bg-navy-50 transition-colors"
            >
              <FileText size={16} />
              Upload Docs
            </button>
            <button
              onClick={handleStartJourney}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-medium hover:bg-navy-800 transition-colors"
            >
              Start Journey
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
