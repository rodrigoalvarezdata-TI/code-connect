import { useState } from 'react'
import { CodeIcon } from './icons'

interface ThumbnailProps {
  /** URL da miniatura; `null`/ausente cai direto no placeholder. */
  src: string | null
  /** Nome acessível (título do post) — também vira as iniciais do placeholder. */
  alt: string
  /** Chave estável (id do post) para o placeholder ser sempre igual pro mesmo post. */
  seed: string
  className?: string
}

/** Hash estável e barato — dá variação determinística ao placeholder. */
function hashSeed(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return hash
}

function initials(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '<>'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

// Posições do brilho de destaque — só variam a composição; a cor fica nos
// tokens de marca, então o placeholder respeita a paleta e o contraste.
const GLOW_POSITIONS = [
  '-top-8 -left-8',
  '-top-8 -right-8',
  '-bottom-10 -left-6',
  '-bottom-10 -right-6',
  'top-1/3 -right-10',
]

/**
 * Miniatura do post. Quando não há `src` — ou quando a imagem falha ao carregar
 * (`onError`) — renderiza um placeholder determinístico montado só com tokens de
 * marca (sem servir imagem no backend). O placeholder é decorativo: o título do
 * post já aparece ao lado no card, então ele fica `aria-hidden`.
 */
export function Thumbnail({ src, alt, seed, className = '' }: ThumbnailProps) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(src) && !failed

  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-surface-input ${className}`}
    >
      {showImage ? (
        <img
          src={src as string}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface-card via-surface-input to-surface-card"
        >
          <span
            className={`absolute h-28 w-28 rounded-full bg-brand-500/20 blur-2xl ${
              GLOW_POSITIONS[hashSeed(seed) % GLOW_POSITIONS.length]
            }`}
          />
          <CodeIcon className="absolute left-3 top-3 text-2xl text-brand-400/70" />
          <span className="text-3xl font-semibold tracking-wide text-content/80">
            {initials(alt)}
          </span>
        </div>
      )}
    </div>
  )
}
