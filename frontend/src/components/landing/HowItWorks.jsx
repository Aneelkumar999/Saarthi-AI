import { MessageCircle, Cpu, FileOutput } from 'lucide-react'

const steps = [
  {
    icon: MessageCircle,
    number: '01',
    title: 'State Your Goal',
    description: 'Tell Saarthi what you want to do in plain language — "I want to start a restaurant" or "I need a birth certificate."',
  },
  {
    icon: Cpu,
    number: '02',
    title: 'AI Builds Your Roadmap',
    description: 'Saarthi parses your intent, maps all required services, and generates a dependency-ordered workflow.',
  },
  {
    icon: FileOutput,
    number: '03',
    title: 'Follow & Complete',
    description: 'Follow the step-by-step guide. Upload documents, let AI auto-fill forms, and track your progress to completion.',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-navy-50/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-navy-900 mb-4">
            How Saarthi AI Works
          </h2>
          <p className="text-navy-500 text-lg max-w-2xl mx-auto">
            Three simple steps from intent to completion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="relative text-center">
                <div className="w-16 h-16 rounded-2xl bg-white border border-navy-100 shadow-sm flex items-center justify-center mx-auto mb-5">
                  <Icon size={28} className="text-navy-900" />
                </div>
                <span className="absolute top-0 left-1/2 -translate-x-1/2 text-6xl font-bold text-navy-100 -z-10 select-none">
                  {step.number}
                </span>
                <h3 className="text-xl font-semibold text-navy-900 mb-2">{step.title}</h3>
                <p className="text-sm text-navy-500 leading-relaxed max-w-xs mx-auto">{step.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
