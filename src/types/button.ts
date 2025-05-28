import { ButtonHTMLAttributes } from 'react'

export type ButtonSize = 'sm' | 'md' | 'lg'
export type ButtonVariant = 'default' | 'outline' | 'ghost'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize
  variant?: ButtonVariant
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
} 