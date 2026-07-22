import { Link } from 'react-router'
import { Tag } from '@/components/atoms/Tag'
import { Thumbnail } from '@/components/atoms/Thumbnail'
import type { PostSummary } from '@/services/posts'
import { AuthorTag } from './AuthorTag'
import { PostStats } from './PostStats'

interface PostCardProps {
  post: PostSummary
}

/**
 * Card do feed: miniatura + título/descrição + tags + indicadores + autor. O card
 * inteiro é um link para o detalhe, então os indicadores aqui são só leitura
 * (curtir/comentar acontecem na página de detalhe, evitando link dentro de link).
 */
export function PostCard({ post }: PostCardProps) {
  return (
    <Link
      to={`/posts/${post.id}`}
      className="flex h-full w-full flex-col overflow-hidden rounded-lg bg-surface-card transition-colors hover:bg-surface-input focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      <Thumbnail
        src={post.thumbnailUrl}
        alt={post.title}
        seed={post.id}
        className="aspect-[16/9] w-full"
      />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex flex-col gap-2">
          <h2 className="line-clamp-2 text-lg font-semibold text-content">
            {post.title}
          </h2>
          <p className="line-clamp-3 text-sm text-content-muted">
            {post.description}
          </p>
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

        <div className="mt-auto flex items-center justify-between gap-2">
          <PostStats
            likesCount={post.likesCount}
            commentsCount={post.commentsCount}
            likedByMe={post.likedByMe}
          />
          <AuthorTag name={post.author.name} />
        </div>
      </div>
    </Link>
  )
}
