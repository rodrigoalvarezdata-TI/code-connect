import type { ReactNode } from 'react'
import { Link } from 'react-router'

interface TextLinkProps {
  to: string
  children: ReactNode
  className?: string
}

export function TextLink({ to, children, className = '' }: TextLinkProps) {
  return (
    <Link
      to={to}
      className={`text-brand-500 underline-offset-2 transition-colors hover:text-brand-400 hover:underline ${className}`}
    >
      {children}
    </Link>
  )
}
