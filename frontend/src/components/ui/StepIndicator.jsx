import { Check } from 'lucide-react'

export default function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex items-center w-full">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep

        return (
          <div key={index} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-saffron-500 text-white ring-4 ring-saffron-100'
                    : 'bg-navy-100 text-navy-400'
                }`}
              >
                {isCompleted ? <Check size={18} /> : index + 1}
              </div>
              <span className={`mt-2 text-xs font-medium hidden sm:block ${
                isCurrent ? 'text-saffron-600' : isCompleted ? 'text-green-600' : 'text-navy-400'
              }`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mx-2 mb-5 sm:mb-6 rounded ${
                isCompleted ? 'bg-green-500' : 'bg-navy-100'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
