import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Alert } from '@/components/atoms/Alert'
import { TextLink } from '@/components/atoms/TextLink'
import { CommentSection } from '@/components/organisms/CommentSection'
import { PostDetailCard } from '@/components/organisms/PostDetailCard'
import { SearchHeader } from '@/components/organisms/SearchHeader'
import { useAuth } from '@/context/auth-context'
import { ApiError } from '@/lib/api-error'
import {
  createComment,
  getPost,
  likePost,
  unlikePost,
  type PostDetail,
} from '@/services/posts'

/**
 * Detalhe do post (rota `/posts/:id`, pública). Visitante vê tudo; curtir e
 * comentar exigem sessão — curtir sem login manda para `/login`, e o campo de
 * comentário some (a `CommentSection` mostra o convite para entrar).
 */
export function PostDetailsPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const [post, setPost] = useState<PostDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string>()
  const [likePending, setLikePending] = useState(false)
  const [commentSubmitting, setCommentSubmitting] = useState(false)

  const loadPost = useCallback(async () => {
    const data = await getPost(id)
    setPost(data)
    return data
  }, [id])

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setErrorMessage(undefined)
    getPost(id)
      .then((data) => {
        if (active) setPost(data)
      })
      .catch((error: unknown) => {
        if (!active) return
        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : 'Não foi possível carregar a publicação.',
        )
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [id])

  async function handleToggleLike() {
    if (!isAuthenticated) {
      void navigate('/login')
      return
    }
    if (!post) return

    setLikePending(true)
    try {
      const state = post.likedByMe
        ? await unlikePost(post.id)
        : await likePost(post.id)
      setPost((current) => (current ? { ...current, ...state } : current))
    } catch {
      // Mantém o estado anterior em caso de falha; nada de otimismo enganoso.
    } finally {
      setLikePending(false)
    }
  }

  async function submitComment(body: string, parentId?: string) {
    setCommentSubmitting(true)
    try {
      await createComment(id, parentId ? { body, parentId } : { body })
      // Relê para trazer a árvore e o contador consistentes.
      await loadPost()
    } finally {
      setCommentSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <p role="status" className="py-10 text-center text-content-muted">
        Carregando publicação…
      </p>
    )
  }

  if (errorMessage || !post) {
    return (
      <div className="flex flex-col gap-4">
        <Alert>{errorMessage ?? 'Publicação não encontrada.'}</Alert>
        <TextLink to="/">Voltar para o feed</TextLink>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-12">
      <SearchHeader
        search=""
        onSearch={(term) =>
          void navigate(term ? `/?search=${encodeURIComponent(term)}` : '/')
        }
      />

      <PostDetailCard
        post={post}
        onToggleLike={handleToggleLike}
        likePending={likePending}
      />

      <CommentSection
        comments={post.comments}
        isAuthenticated={isAuthenticated}
        submitting={commentSubmitting}
        onAddComment={(body) => submitComment(body)}
        onReply={(parentId, body) => submitComment(body, parentId)}
      />
    </div>
  )
}
