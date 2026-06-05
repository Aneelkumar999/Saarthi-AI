export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-navy-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3.5 py-2.5 rounded-lg border bg-white text-navy-900 text-sm placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 transition-colors ${
          error ? 'border-red-400 focus:ring-red-400/20 focus:border-red-400' : 'border-navy-200'
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
