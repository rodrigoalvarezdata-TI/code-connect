import { CloseIcon } from './icons'

interface TagProps {
  children: string
  /** Quando informado, o chip ganha um botão de remover (filtros ativos). */
  onRemove?: () => void
  className?: string
}

/**
 * Chip de tag. Usado tanto nas tags de um post quanto nos filtros ativos da
 * busca. `bg-surface-input` + `text-content` dão 10.16:1 de contraste.
 */
export function Tag({ children, onRemove, className = '' }: TagProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border border-border-subtle bg-surface-input px-2 py-0.5 text-xs text-content ${className}`}
    >
      {children}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remover filtro ${children}`}
          className="flex size-4 items-center justify-center rounded-sm text-content-muted transition-colors hover:text-content focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-500"
        >
          <CloseIcon className="text-sm" />
        </button>
      ) : null}
    </span>
  )
}
