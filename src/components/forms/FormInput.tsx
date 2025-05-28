import { InputHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(({
  label,
  error,
  className,
  ...props
}, ref) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        ref={ref}
        className={clsx(
          'appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400',
          'focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
          error ? 'border-red-300' : 'border-gray-300',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
})

FormInput.displayName = 'FormInput' 