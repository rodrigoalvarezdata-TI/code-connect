import type { ReactNode } from 'react'
import { BrandMark } from '@/components/atoms/BrandMark'

interface AuthLayoutProps {
  children: ReactNode
}

/** Layout full-viewport das telas de autenticação: fundo escuro + marcas d'água. */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-surface-page px-4 py-10">
      <BrandMark className="pointer-events-none absolute -left-10 top-8 w-48 text-white/[0.04]" />
      <BrandMark className="pointer-events-none absolute right-6 top-1/4 w-40 text-white/[0.04]" />
      <BrandMark className="pointer-events-none absolute bottom-8 right-24 w-56 text-white/[0.04]" />
      <BrandMark className="pointer-events-none absolute -bottom-10 left-1/4 w-44 text-white/[0.04]" />
      <div className="relative z-10 flex w-full justify-center">{children}</div>
    </main>
  )
}
