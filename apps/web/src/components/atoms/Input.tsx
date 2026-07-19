import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      className={`w-full rounded-md border border-border-subtle bg-surface-input px-3 py-2 text-content placeholder:text-content-muted focus:border-brand-500 focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-500 ${className}`}
      {...props}
    />
  )
}
