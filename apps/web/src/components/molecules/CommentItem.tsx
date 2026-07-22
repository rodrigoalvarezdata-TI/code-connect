import { useState } from 'react'
import { Avatar } from '@/components/atoms/Avatar'
import type { CommentNode } from '@/services/posts'
import { handleFromName } from '@/lib/handle'
import { CommentComposer } from './CommentComposer'

interface CommentItemProps {
  comment: CommentNode
  /** Se o usuário pode responder (logado). Respostas nunca podem ser respondidas. */
  canReply: boolean
  onReply?: (parentId: string, body: string) => Promise<void>
  replySubmitting?: boolean
  /** Interno: marca as respostas para não renderizarem afordância de resposta. */
  isReply?: boolean
}

/** Um comentário e, para comentários-raiz, suas respostas (1 nível). */
export function CommentItem({
  comment,
  canReply,
  onReply,
  replySubmitting = false,
  isReply = false,
}: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(false)
  const [replyOpen, setReplyOpen] = useState(false)
  const hasReplies = comment.replies.length > 0

  return (
    <article className={isReply ? '' : 'flex flex-col gap-2'}>
      <div className="flex items-start gap-2">
        <Avatar name={comment.author.name} className="size-8" />
        <div className="flex flex-col gap-0.5">
          <p className="text-sm">
            <span className="font-semibold text-content">
              {handleFromName(comment.author.name)}
            </span>{' '}
            <span className="text-content">{comment.body}</span>
          </p>
        </div>
      </div>

      {!isReply ? (
        <div className="flex items-center gap-4 pl-10 text-sm">
          {canReply ? (
            <button
              type="button"
              onClick={() => setReplyOpen((open) => !open)}
              className="font-semibold text-content-muted transition-colors hover:text-content focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              Responder
            </button>
          ) : null}
          {hasReplies ? (
            <button
              type="button"
              onClick={() => setShowReplies((open) => !open)}
              aria-expanded={showReplies}
              className="text-content-muted transition-colors hover:text-content focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              {showReplies
                ? 'Ocultar respostas'
                : `Ver respostas (${comment.replies.length})`}
            </button>
          ) : null}
        </div>
      ) : null}

      {replyOpen && canReply && onReply ? (
        <div className="pl-10">
          <CommentComposer
            label={`Responder a ${handleFromName(comment.author.name)}`}
            placeholder="Escreva uma resposta…"
            submitLabel="Responder"
            submitting={replySubmitting}
            autoFocus
            onSubmit={async (body) => {
              await onReply(comment.id, body)
              setReplyOpen(false)
              setShowReplies(true)
            }}
          />
        </div>
      ) : null}

      {hasReplies && showReplies ? (
        <ul className="flex flex-col gap-3 pl-10">
          {comment.replies.map((reply) => (
            <li key={reply.id}>
              <CommentItem comment={reply} canReply={false} isReply />
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  )
}
