import { Alert } from '@/components/atoms/Alert'
import { PostCard } from '@/components/molecules/PostCard'
import type { PostSummary } from '@/services/posts'

interface PostListProps {
  posts: PostSummary[]
  isLoading: boolean
  errorMessage?: string
  emptyMessage?: string
}

/**
 * Lista do feed: aba "Recentes" + grade de cards, com estados de carregando,
 * erro e vazio. A grade reflowa de 1 para 2 colunas (mobile-first, 1.4.10).
 */
export function PostList({
  posts,
  isLoading,
  errorMessage,
  emptyMessage = 'Nenhuma publicação encontrada.',
}: PostListProps) {
  return (
    <section className="flex flex-col gap-8" aria-label="Publicações">
      <div className="flex justify-center border-b border-border-subtle">
        <span className="border-b-2 border-brand-400 px-4 pb-2 font-semibold text-brand-400">
          Recentes
        </span>
      </div>

      {errorMessage ? <Alert>{errorMessage}</Alert> : null}

      {isLoading ? (
        <p role="status" className="py-8 text-center text-content-muted">
          Carregando publicações…
        </p>
      ) : posts.length === 0 && !errorMessage ? (
        <p className="py-8 text-center text-content-muted">{emptyMessage}</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <li key={post.id}>
              <PostCard post={post} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
