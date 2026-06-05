import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import { Bot } from 'lucide-react'

const mockResponses = [
  {
    trigger: /tea|shop|restaurant|cafe|food/i,
    text: "Great choice! To open a food business in Hyderabad, here's your roadmap:\n\n1. **Trade License** (GHMC) — Required for all commercial establishments\n2. **FSSAI License** (Food Safety Dept) — Mandatory for food businesses\n3. **Shop & Establishment Registration** (Labour Dept)\n\nDocuments needed: Aadhaar, PAN, Rental Agreement, Passport-size photos.\n\nEstimated time: 15-20 days. Shall I generate the detailed checklist?",
  },
  {
    trigger: /birth|certificate|baby|child/i,
    text: "I can help you get a birth certificate! Here's the process:\n\n1. **Hospital Discharge Summary** — Get it from the hospital where the birth occurred\n2. **Form 1 Submission** — Submit to the local Municipality/GRAM Panchayat\n\nDocuments needed: Parent's Aadhaar, Hospital records, Mother's discharge summary.\n\nEstimated time: 7-10 days. Would you like me to generate the form checklist?",
  },
  {
    trigger: /farm|subsidy|agriculture|rythu/i,
    text: "Here are the farm subsidies available for you in Telangana:\n\n1. **Rythu Bandhu** — Investment support for farmers (₹5,000/acre/season)\n2. **Rythu Bima** — Life insurance coverage for farmers\n3. **PM KISAN** — ₹6,000/year in 3 installments\n\nEligibility: Must have valid land records and Aadhaar linked.\n\nShall I check your eligibility and start the application?",
  },
]

const defaultResponse = "I understand your query. Let me help you navigate through this. Could you tell me more details about:\n\n1. **What** specifically do you want to accomplish?\n2. **Where** (which city/district) is this for?\n\nThis will help me generate a precise roadmap for you."

export default function ChatWindow({ initialQuery }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (initialQuery) {
      handleSend(initialQuery)
    }
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const getResponse = (text) => {
    for (const resp of mockResponses) {
      if (resp.trigger.test(text)) return resp.text
    }
    return defaultResponse
  }

  const handleSend = async (text) => {
    setMessages(prev => [...prev, { text, isUser: true }])
    setLoading(true)

    await new Promise(r => setTimeout(r, 800 + Math.random() * 800))

    setMessages(prev => [...prev, { text: getResponse(text), isUser: false }])
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-full bg-navy-50/30">
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
  )
}
