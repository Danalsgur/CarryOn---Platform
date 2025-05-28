import { useEffect } from 'react'

export function useEscapeKey(handler: () => void, isActive: boolean) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handler()
      }
    }
    if (isActive) {
      document.addEventListener('keydown', handleEsc)
      return () => document.removeEventListener('keydown', handleEsc)
    }
  }, [handler, isActive])
} 