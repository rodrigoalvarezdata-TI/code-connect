import type { InputHTMLAttributes } from 'react'
import { Label } from '@/components/atoms/Label'
import { Input } from '@/components/atoms/Input'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  error?: string
}

export function FormField({ id, label, error, ...inputProps }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} aria-invalid={error ? true : undefined} {...inputProps} />
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  )
}
