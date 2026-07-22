import { ChatIcon, CodeIcon, ShareIcon } from '@/components/atoms/icons'

interface PostStatsProps {
  likesCount: number
  commentsCount: number
  likedByMe: boolean
  /** Quando informado, a curtida vira um botão. Sem ele, os números são só leitura
   * (é o caso do card no feed, onde o card inteiro é um link). */
  onToggleLike?: () => void
  likePending?: boolean
  className?: string
}

/**
 * Linha de indicadores do post: curtidas (glifo `code` = "Aprovar" no design),
 * compartilhar (só visual) e comentários. Cada número tem um rótulo acessível,
 * então o significado nunca fica só no ícone.
 */
export function PostStats({
  likesCount,
  commentsCount,
  likedByMe,
  onToggleLike,
  likePending = false,
  className = '',
}: PostStatsProps) {
  return (
    <div className={`flex items-center gap-4 text-content-muted ${className}`}>
      {onToggleLike ? (
        <button
          type="button"
          onClick={onToggleLike}
          disabled={likePending}
          aria-pressed={likedByMe}
          aria-label={likedByMe ? 'Remover curtida' : 'Curtir publicação'}
          className={`flex items-center gap-1.5 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-60 ${
            likedByMe ? 'text-brand-400' : 'hover:text-content'
          }`}
        >
          <CodeIcon className="text-2xl" />
          <span className="text-sm tabular-nums">{likesCount}</span>
        </button>
      ) : (
        <span className="flex items-center gap-1.5">
          <CodeIcon className="text-2xl" />
          <span className="text-sm tabular-nums">{likesCount}</span>
          <span className="sr-only">curtidas</span>
        </span>
      )}

      <span className="flex items-center gap-1.5" aria-hidden="true">
        <ShareIcon className="text-2xl" />
      </span>

      <span className="flex items-center gap-1.5">
        <ChatIcon className="text-2xl" />
        <span className="text-sm tabular-nums">{commentsCount}</span>
        <span className="sr-only">comentários</span>
      </span>
    </div>
  )
}
