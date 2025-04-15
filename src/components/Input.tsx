type InputProps = {
  label: string
  value: string
  setValue: (v: string) => void
  type?: string
  placeholder?: string
}

export default function Input({
  label,
  value,
  setValue,
  type = 'text',
  placeholder,
}: InputProps) {
  return (
    <div>
      <label className="block mb-1 text-sm font-medium text-text-primary">
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-control shadow-control focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition"
      />
    </div>
  )
}
