import { Tag } from '@/components/atoms/Tag'
import { Thumbnail } from '@/components/atoms/Thumbnail'
import { AuthorTag } from '@/components/molecules/AuthorTag'
import { PostStats } from '@/components/molecules/PostStats'
import type { PostDetail } from '@/services/posts'

interface PostDetailCardProps {
  post: PostDetail
  /** Ativa a curtida interativa (só quando logado). Sem ele, os números são só leitura. */
  onToggleLike?: () => void
  likePending?: boolean
}

/**
 * Bloco principal do detalhe: o mesmo card do feed (miniatura, título, tags,
 * indicadores, autor) — aqui com curtida interativa — seguido do bloco "Código:".
 */
export function PostDetailCard({
  post,
  onToggleLike,
  likePending,
}: PostDetailCardProps) {
  return (
    <article className="flex flex-col gap-8">
      <div className="overflow-hidden rounded-lg bg-surface-card">
        <Thumbnail
          src={post.thumbnailUrl}
          alt={post.title}
          seed={post.id}
          className="aspect-[16/9] w-full"
        />
        <div className="flex flex-col gap-4 p-4 sm:p-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold text-content">
              {post.title}
            </h1>
            <p className="text-sm text-content-muted">{post.description}</p>
          </div>

          {post.tags.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <li key={tag}>
                  <Tag>{tag}</Tag>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="flex items-center justify-between gap-2">
            <PostStats
              likesCount={post.likesCount}
              commentsCount={post.commentsCount}
              likedByMe={post.likedByMe}
              onToggleLike={onToggleLike}
              likePending={likePending}
            />
            <AuthorTag name={post.author.name} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="font-semibold text-content-muted">Código:</h2>
        <div className="overflow-x-auto rounded-lg bg-surface-card p-4">
          <pre className="text-sm text-content">
            <code className="font-mono">{post.content}</code>
          </pre>
        </div>
      </div>
    </article>
  )
}
