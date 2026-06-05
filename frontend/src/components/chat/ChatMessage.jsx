import { Bot, User } from 'lucide-react'

export default function ChatMessage({ message, isUser }) {
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
        isUser ? 'bg-navy-900' : 'bg-saffron-500'
      }`}>
        {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
      </div>
      <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
        isUser
          ? 'bg-navy-900 text-white rounded-br-md'
          : 'bg-white border border-navy-100 text-navy-700 rounded-bl-md shadow-sm'
      }`}>
        {message.text}
      </div>
    </div>
  )
}
