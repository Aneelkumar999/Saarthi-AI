import { CheckCircle, Clock, Circle, ChevronRight } from 'lucide-react'

const statusConfig = {
  completed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' },
  in_progress: { icon: Clock, color: 'text-saffron-500', bg: 'bg-saffron-50', border: 'border-saffron-200' },
  pending: { icon: Circle, color: 'text-navy-300', bg: 'bg-navy-50', border: 'border-navy-200' },
}

export default function WorkflowStepper({ steps }) {
  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const config = statusConfig[step.status]
        const Icon = config.icon
        const isLast = index === steps.length - 1

        return (
          <div key={index}>
            <div className={`flex items-start gap-3 p-4 rounded-xl border ${config.bg} ${config.border} transition-all`}>
              <Icon size={20} className={`${config.color} mt-0.5 shrink-0`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-navy-400">Step {index + 1}</span>
                  {step.status === 'completed' && (
                    <span className="text-xs text-green-600 font-medium">Completed</span>
                  )}
                  {step.status === 'in_progress' && (
                    <span className="text-xs text-saffron-600 font-medium">In Progress</span>
                  )}
                </div>
                <h4 className="text-sm font-semibold text-navy-900 mt-0.5">{step.title}</h4>
                <p className="text-xs text-navy-500 mt-1">{step.description}</p>
                {step.department && (
                  <span className="inline-block mt-2 px-2 py-0.5 bg-white rounded text-xs text-navy-500 border border-navy-100">
                    {step.department}
                  </span>
                )}
              </div>
              <ChevronRight size={16} className="text-navy-300 mt-1 shrink-0" />
            </div>
            {!isLast && (
              <div className="ml-7 h-3 border-l-2 border-dashed border-navy-200" />
            )}
          </div>
        )
      })}
    </div>
  )
}
