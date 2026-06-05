const colors = {
  navy: 'bg-navy-100 text-navy-700',
  saffron: 'bg-saffron-100 text-saffron-700',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  purple: 'bg-purple-100 text-purple-700',
}

export default function Badge({ children, color = 'navy', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]} ${className}`}>
      {children}
    </span>
  )
}
