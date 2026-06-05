import { Bot, FileCheck, Route, Shield, Globe, Zap } from 'lucide-react'
import Card from '../ui/Card'

const features = [
  {
    icon: Bot,
    title: 'AI Intent Parsing',
    description: 'Simply state what you need in natural language. Our AI understands your goal instantly.',
    color: 'bg-navy-900',
  },
  {
    icon: Route,
    title: 'Smart Roadmaps',
    description: 'Get a complete step-by-step workflow with all approvals mapped out for your specific case.',
    color: 'bg-saffron-500',
  },
  {
    icon: FileCheck,
    title: 'Document Checklists',
    description: 'Never miss a document. Get personalized checklists based on your exact requirements.',
    color: 'bg-green-500',
  },
  {
    icon: Zap,
    title: 'Auto Form Filling',
    description: 'Upload documents once and let AI auto-fill every government form for you.',
    color: 'bg-purple-500',
  },
  {
    icon: Shield,
    title: 'Scheme Discovery',
    description: 'Never miss a benefit. We proactively match you with eligible government schemes.',
    color: 'bg-blue-500',
  },
  {
    icon: Globe,
    title: 'Telugu & English',
    description: 'Interact in your preferred language with real-time localized support.',
    color: 'bg-pink-500',
  },
]

export default function FeatureCards() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">
            Everything you need to navigate government services
          </h2>
          <p className="text-navy-500 text-lg max-w-2xl mx-auto">
            From intent to submission — Saarthi AI handles the complexity so you don't have to.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} hover className="p-6">
                <div className={`w-11 h-11 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-navy-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-navy-500 leading-relaxed">{feature.description}</p>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
