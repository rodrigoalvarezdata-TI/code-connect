import type { ReactNode } from 'react'

interface AlertProps {
  children: ReactNode
}

/**
 * Mensagem de erro de nível formulário (ex.: credenciais inválidas vindas da API).
 *
 * `role="alert"` faz o leitor de tela anunciar assim que a mensagem aparece.
 * A cor nunca é o único sinal (WCAG 1.4.1) — o próprio texto carrega o
 * significado; a borda `danger` só reforça.
 */
export function Alert({ children }: AlertProps) {
  return (
    <p
      role="alert"
      className="rounded-lg border border-danger px-4 py-3 text-sm text-danger"
    >
      {children}
    </p>
  )
}
