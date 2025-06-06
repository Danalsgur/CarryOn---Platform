type InputProps = {
  label: string
  value: string
  setValue: (v: string) => void
  type?: string
  placeholder?: string
  rightElement?: React.ReactNode
  maxLength?: number
  disabled?: boolean
}

export default function Input({
  label,
  value,
  setValue,
  type = 'text',
  placeholder,
  rightElement,
  maxLength,
  disabled = false,
}: InputProps) {
  return (
    <div className="mb-4">
      <label className="block mb-2 text-sm font-medium text-text-primary">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => setValue(e.target.value)}
          maxLength={maxLength}
          disabled={disabled}
          className={`w-full px-4 py-2 border border-gray-300 rounded-control shadow-control focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all duration-200 ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-4 flex items-center text-text-muted">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  )
}
