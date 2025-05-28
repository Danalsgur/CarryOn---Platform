import { useState, useCallback } from 'react'

type ValidationRule<T> = (value: T) => string | undefined

type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T[K]>
}

interface UseFormOptions<T> {
  initialValues: T
  validate?: ValidationRules<T>
  onSubmit: (values: T) => void | Promise<void>
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setValues(prev => ({ ...prev, [name]: value }))
    
    if (validate?.[name as keyof T]) {
      const error = validate[name as keyof T]?.(value as any)
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }, [validate])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validate) {
      const newErrors: Partial<Record<keyof T, string>> = {}
      let hasErrors = false

      Object.keys(validate).forEach(key => {
        const typedKey = key as keyof T
        const error = validate[typedKey]?.(values[typedKey])
        if (error) {
          newErrors[typedKey] = error
          hasErrors = true
        }
      })

      setErrors(newErrors)
      if (hasErrors) return
    }

    try {
      setIsSubmitting(true)
      await onSubmit(values)
    } finally {
      setIsSubmitting(false)
    }
  }, [values, validate, onSubmit])

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit
  }
} 