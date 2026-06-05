import { Link } from 'react-router-dom'
import Badge from '../ui/Badge'
import Card from '../ui/Card'
import { Clock, FileText, ChevronRight } from 'lucide-react'

export default function JourneyCard({ journey }) {
  return (
    <Link to={`/workflow/${journey.id}`} className="block h-full">
      <Card hover className="p-5 h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-navy-900">{journey.title}</h3>
            <p className="text-xs text-navy-500 mt-0.5">{journey.intent_name || journey.intent}</p>
          </div>
          <Badge color={journey.status === 'in_progress' ? 'saffron' : journey.status === 'completed' ? 'green' : 'navy'}>
            {journey.status === 'in_progress' ? 'In Progress' : journey.status === 'completed' ? 'Completed' : 'Pending'}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-xs text-navy-500 mb-4 mt-auto">
          <span className="flex items-center gap-1">
            <FileText size={14} />
            {journey.total_steps || journey.totalSteps || 0} steps
          </span>
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {journey.completed_steps || journey.completedSteps || 0}/{(journey.total_steps || journey.totalSteps) || 0} done
          </span>
        </div>

        <div className="w-full bg-navy-100 rounded-full h-2 mb-3">
          <div
            className="bg-saffron-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((journey.completed_steps || journey.completedSteps || 0) / Math.max(1, journey.total_steps || journey.totalSteps || 1)) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-navy-400">
            {Math.round((((journey.completed_steps || journey.completedSteps || 0) / Math.max(1, journey.total_steps || journey.totalSteps || 1))) * 100)}% complete
          </span>
          <ChevronRight size={16} className="text-navy-300" />
        </div>
      </Card>
    </Link>
  )
}
