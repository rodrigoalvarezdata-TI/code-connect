interface AvatarProps {
  /** Nome do usuário — vira as iniciais exibidas. */
  name: string
  className?: string
}

function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

/**
 * Avatar de usuário com iniciais (não há upload de foto no backend). Decorativo:
 * o nome/handle sempre aparece ao lado, então fica `aria-hidden`. Cores só de
 * tokens de marca — `brand-ink` sobre `brand-400` tem contraste 11.2:1.
 */
export function Avatar({ name, className = '' }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-brand-400 text-xs font-semibold text-brand-ink ${className}`}
    >
      {initials(name)}
    </span>
  )
}
