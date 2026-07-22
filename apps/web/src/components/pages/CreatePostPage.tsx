import { useState } from 'react'
import { useNavigate } from 'react-router'
import {
  CreatePostForm,
  type CreatePostFormValues,
} from '@/components/organisms/CreatePostForm'
import { ApiError } from '@/lib/api-error'
import { createPost } from '@/services/posts'

/**
 * Criação de post (rota protegida `/posts/new`). A página é dona da chamada à API
 * e dos estados; o formulário é apresentacional. Ao publicar, vai para o detalhe.
 */
export function CreatePostPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>()

  async function handleSubmit(values: CreatePostFormValues) {
    setIsSubmitting(true)
    setErrorMessage(undefined)
    try {
      const post = await createPost({
        title: values.title,
        description: values.description,
        content: values.content,
        tags: values.tags.length > 0 ? values.tags : undefined,
        thumbnailUrl: values.thumbnailUrl,
      })
      void navigate(`/posts/${post.id}`)
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : 'Não foi possível publicar. Tente novamente.',
      )
      setIsSubmitting(false)
    }
  }

  return (
    <CreatePostForm
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
    />
  )
}
