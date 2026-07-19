import type { InputHTMLAttributes } from 'react'

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function Checkbox({ label, className = '', ...props }: CheckboxProps) {
  return (
    <label className="inline-flex select-none items-center gap-2 text-sm text-content-muted">
      <input
        type="checkbox"
        className={`h-4 w-4 rounded border-border-subtle bg-surface-input accent-brand-500 ${className}`}
        {...props}
      />
      {label}
    </label>
  )
}
