import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowRight, Mic } from 'lucide-react'

const suggestions = [
  'I want to open a tea shop in Hyderabad',
  'Need birth certificate for my baby',
  'Apply for farm subsidy in Telangana',
  'Start a small restaurant',
]

export default function Hero() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate('/chat', { state: { initialQuery: query } })
    }
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-navy-50/80 to-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-saffron-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-navy-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-saffron-50 border border-saffron-200 rounded-full text-saffron-700 text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 bg-saffron-500 rounded-full animate-pulse" />
            AI-Powered Government Navigator
          </div>

          <h1 className="text-5xl md:text-8xl font-black text-navy-900 tracking-tighter mb-4">
            Saarthi<span className="text-saffron-500">AI</span>
          </h1>

          <h2 className="text-2xl md:text-4xl font-bold text-navy-800 leading-tight mb-6">
            Don't search for services.
            <br />
            <span className="text-navy-500">State your goal.</span>
          </h2>

          <p className="text-lg md:text-xl text-navy-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Tell us what you want to do, and we'll build a personalized roadmap — with every document, approval, and step mapped out for you.
          </p>

          <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
            <div className="relative flex items-center">
              <div className="absolute left-4 text-navy-400">
                <Search size={20} />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What do you want to do today?"
                className="w-full pl-12 pr-24 py-4 rounded-2xl border border-navy-200 bg-white text-navy-900 text-base placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-900/10 focus:border-navy-300 shadow-lg shadow-navy-900/5 transition-all"
              />
              <div className="absolute right-2 flex items-center gap-1">
                <button
                  type="button"
                  className="p-2.5 rounded-xl text-navy-400 hover:bg-navy-50 transition-colors"
                  title="Voice input"
                >
                  <Mic size={18} />
                </button>
                <button
                  type="submit"
                  className="p-2.5 rounded-xl bg-navy-900 text-white hover:bg-navy-800 transition-colors"
                >
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </form>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(s)
                  navigate('/chat', { state: { initialQuery: s } })
                }}
                className="px-3 py-1.5 bg-white border border-navy-100 rounded-full text-xs text-navy-500 hover:border-navy-300 hover:text-navy-700 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t border-navy-100 flex flex-col items-center">
            <p className="text-xs text-navy-400 mb-3 uppercase tracking-widest font-bold">Administrative Access</p>
            <Link 
              to="/admin" 
              className="flex items-center gap-2 px-4 py-2 bg-navy-50 text-navy-600 rounded-lg text-xs font-bold hover:bg-navy-100 transition-all border border-navy-100"
            >
              <Shield size={14} className="text-navy-400" />
              Officer Portal
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

import { Shield } from 'lucide-react'
import { Link } from 'react-router-dom'
