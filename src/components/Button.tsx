// src/components/Button.tsx

import { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'
import Spinner from './Spinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'destructive'
  loading?: boolean
}

export default function Button({
  children,
  size = 'md',
  variant = 'default',
  className = '',
  loading = false,
  ...props
}: ButtonProps) {
  const base = 'rounded-control font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-dark/30'

  const sizeStyle = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3',
  }[size]

  const variantStyle = {
    default: 'bg-brand text-white hover:bg-brand-dark active:bg-brand-dark/90',
    outline: 'border border-brand text-brand hover:bg-brand-light/20 active:bg-brand-light/30',
    destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  }[variant]

  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={clsx(
        base, 
        sizeStyle, 
        variantStyle, 
        className,
        loading && 'opacity-70 cursor-wait'
      )}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <Spinner size="sm" color="white" className="mr-2" />
          {children}
        </div>
      ) : (
        children
      )}
    </button>
  )
}
