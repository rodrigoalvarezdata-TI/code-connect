import type { ReactNode } from 'react'
import { BannerImage } from '@/components/atoms/BannerImage'

interface AuthCardProps {
  bannerAlt: string
  children: ReactNode
}

/**
 * Card base de autenticação: banner à esquerda + conteúdo à direita.
 * Reutilizável entre Login e Cadastro — basta trocar o alt e o conteúdo.
 */
export function AuthCard({ bannerAlt, children }: AuthCardProps) {
  return (
    <div className="flex w-full max-w-3xl overflow-hidden rounded-2xl bg-surface-card p-3 shadow-2xl">
      <div className="hidden w-1/2 shrink-0 md:block">
        <BannerImage alt={bannerAlt} />
      </div>
      <div className="flex w-full items-center justify-center p-6 md:w-1/2 md:p-8">
        {children}
      </div>
    </div>
  )
}
