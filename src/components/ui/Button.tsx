// src/components/Button.tsx

import { forwardRef } from 'react'
import clsx from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline'
  isLoading?: boolean
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

const variantClasses = {
  default: 'bg-blue-600 text-white hover:bg-blue-700',
  outline: 'border border-blue-600 text-blue-600 bg-white hover:bg-blue-50',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { size = 'md', variant = 'default', isLoading, className, children, disabled, ...props },
    ref
  ) => (
    <button
      ref={ref}
      className={clsx(
        'rounded font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? '로딩...' : children}
    </button>
  )
)

Button.displayName = 'Button'

export default Button
