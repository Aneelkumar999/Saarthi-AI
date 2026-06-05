import { useState, useRef, useEffect } from 'react'
import { Send, Mic, MicOff } from 'lucide-react'

export default function ChatInput({ onSend, disabled = false }) {
  const [text, setText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-IN'

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setText(transcript)
        setIsRecording(false)
      }

      recognitionRef.current.onerror = () => {
        setIsRecording(false)
      }

      recognitionRef.current.onend = () => {
        setIsRecording(false)
      }
    }
  }, [])

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in your browser.")
      return
    }

    if (isRecording) {
      recognitionRef.current.stop()
    } else {
      setIsRecording(true)
      recognitionRef.current.start()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (text.trim() && !disabled) {
      onSend(text.trim())
      setText('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col p-3 bg-white border-t border-navy-100">
      {isRecording && (
        <div className="flex items-center gap-2 mb-2 px-2 py-1 bg-red-50 rounded-lg animate-pulse">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Listening...</span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleRecording}
          className={`p-2.5 rounded-xl transition-all duration-300 ${
            isRecording 
              ? 'bg-red-100 text-red-600 ring-2 ring-red-200' 
              : 'text-navy-400 hover:bg-navy-50'
          }`}
          title={isRecording ? "Stop recording" : "Voice input"}
        >
          {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message..."
          disabled={disabled}
          className="flex-1 px-4 py-2.5 rounded-xl bg-navy-50 text-navy-900 text-sm placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-900/10 border border-transparent focus:border-navy-200 transition-all"
        />
        <button
          type="submit"
          disabled={!text.trim() || disabled}
          className="p-2.5 rounded-xl bg-navy-900 text-white hover:bg-navy-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          <Send size={18} />
        </button>
      </div>
    </form>
  )
}
