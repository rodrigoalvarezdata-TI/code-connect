import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'outline'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand-400 text-brand-ink hover:bg-brand-500',
  // Contorno verde (botão "Publicar" do menu): brand-400 tem 13.37:1 sobre
  // surface-card, bem acima do mínimo para texto e para a borda (1.4.11).
  outline:
    'border border-brand-400 text-brand-400 hover:bg-brand-400 hover:text-brand-ink',
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`w-full rounded-lg px-4 py-2.5 font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
