import type { ReactNode } from 'react'

interface DividerProps {
  children?: ReactNode
  className?: string
}

export function Divider({ children, className = '' }: DividerProps) {
  if (!children) {
    return <hr className={`border-t border-border-subtle ${className}`} />
  }

  return (
    <div className={`flex items-center gap-3 text-xs text-content-muted ${className}`}>
      <span className="h-px flex-1 bg-border-subtle" />
      <span>{children}</span>
      <span className="h-px flex-1 bg-border-subtle" />
    </div>
  )
}
