import { TextLink } from '@/components/atoms/TextLink'
import { CommentComposer } from '@/components/molecules/CommentComposer'
import { CommentItem } from '@/components/molecules/CommentItem'
import type { CommentNode } from '@/services/posts'

interface CommentSectionProps {
  comments: CommentNode[]
  isAuthenticated: boolean
  onAddComment: (body: string) => Promise<void>
  onReply: (parentId: string, body: string) => Promise<void>
  submitting?: boolean
}

/**
 * Seção de comentários do detalhe. Logado escreve comentários e respostas;
 * visitante vê tudo, mas no lugar do campo aparece um convite para entrar
 * (regra: não logado não comenta).
 */
export function CommentSection({
  comments,
  isAuthenticated,
  onAddComment,
  onReply,
  submitting = false,
}: CommentSectionProps) {
  return (
    <section aria-labelledby="comentarios-heading" className="flex flex-col gap-6">
      <h2
        id="comentarios-heading"
        className="text-xl font-semibold text-content"
      >
        Comentários
      </h2>

      {isAuthenticated ? (
        <CommentComposer
          label="Escreva um comentário"
          submitLabel="Comentar"
          submitting={submitting}
          onSubmit={onAddComment}
        />
      ) : (
        <p className="text-sm text-content-muted">
          <TextLink to="/login">Faça login</TextLink> para comentar nesta
          publicação.
        </p>
      )}

      {comments.length === 0 ? (
        <p className="text-sm text-content-muted">
          Ainda não há comentários. Seja o primeiro!
        </p>
      ) : (
        <ul className="flex flex-col gap-6">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="border-t border-border-subtle pt-6 first:border-t-0 first:pt-0"
            >
              <CommentItem
                comment={comment}
                canReply={isAuthenticated}
                onReply={onReply}
                replySubmitting={submitting}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
