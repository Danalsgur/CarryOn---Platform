// src/components/Button.tsx

import { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg' // ✅ 'lg' 추가
  variant?: 'default' | 'outline'
}

export default function Button({
  children,
  size = 'md',
  variant = 'default',
  className = '',
  ...props
}: ButtonProps) {
  const base = 'rounded font-semibold transition-all duration-200 focus:outline-none'

  const sizeStyle = {
    sm: 'text-sm px-3 py-1',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3', // ✅ lg 스타일 추가
  }[size]

  const variantStyle = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50',
  }[variant]

  return (
    <button
      {...props}
      className={clsx(base, sizeStyle, variantStyle, className)}
    >
      {children}
    </button>
  )
}
