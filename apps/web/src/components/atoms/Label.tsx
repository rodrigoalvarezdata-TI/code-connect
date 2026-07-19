import type { LabelHTMLAttributes, ReactNode } from 'react'

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode
}

export function Label({ className = '', children, ...props }: LabelProps) {
  return (
    <label className={`block text-sm text-content-muted ${className}`} {...props}>
      {children}
    </label>
  )
}
