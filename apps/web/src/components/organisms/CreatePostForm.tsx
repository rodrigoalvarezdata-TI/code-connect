import { useState, type FormEvent } from 'react'
import { Alert } from '@/components/atoms/Alert'
import { Button } from '@/components/atoms/Button'
import { Label } from '@/components/atoms/Label'
import { FormField } from '@/components/molecules/FormField'

export interface CreatePostFormValues {
  title: string
  description: string
  content: string
  tags: string[]
  thumbnailUrl?: string
}

interface CreatePostFormProps {
  onSubmit: (values: CreatePostFormValues) => void | Promise<void>
  isSubmitting?: boolean
  errorMessage?: string
}

interface FieldErrors {
  title?: string
  description?: string
  content?: string
}

const textareaClass =
  'w-full resize-y rounded-md border border-border-subtle bg-surface-input px-3 py-2 text-content placeholder:text-content-muted focus:border-brand-500 focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-500'

/** Parseia "React, Hooks" em ['React','Hooks'], sem vazios e no máximo 5. */
function parseTags(raw: string): string[] {
  return raw
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 5)
}

/**
 * Formulário de criação de post. Sem design dedicado no Figma — segue os tokens e
 * o padrão dos outros formulários (validação client-side, `noValidate`, Alert
 * para erro da API). A página é a dona da chamada; aqui é só apresentação.
 */
export function CreatePostForm({
  onSubmit,
  isSubmitting = false,
  errorMessage,
}: CreatePostFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fieldErrors: FieldErrors = {
      title: title.trim().length < 3 ? 'Informe um título (mín. 3).' : undefined,
      description: description.trim() ? undefined : 'Informe uma descrição.',
      content: content.trim() ? undefined : 'Informe o código do post.',
    }
    setErrors(fieldErrors)
    if (fieldErrors.title || fieldErrors.description || fieldErrors.content) {
      return
    }

    void onSubmit({
      title: title.trim(),
      description: description.trim(),
      content,
      tags: parseTags(tags),
      thumbnailUrl: thumbnailUrl.trim() || undefined,
    })
  }

  return (
    <form
      className="flex w-full max-w-2xl flex-col gap-5"
      onSubmit={handleSubmit}
      noValidate
    >
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-content">Nova publicação</h1>
        <p className="text-sm text-content-muted">
          Compartilhe um trecho de código com a comunidade.
        </p>
      </header>

      {errorMessage ? <Alert>{errorMessage}</Alert> : null}

      <FormField
        id="title"
        label="Título"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        error={errors.title}
        maxLength={120}
      />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Descrição</Label>
        <textarea
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          aria-invalid={errors.description ? true : undefined}
          aria-describedby={errors.description ? 'description-error' : undefined}
          className={textareaClass}
        />
        {errors.description ? (
          <p id="description-error" className="text-xs text-danger">
            {errors.description}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="content">Código</Label>
        <textarea
          id="content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={8}
          spellCheck={false}
          aria-invalid={errors.content ? true : undefined}
          aria-describedby={errors.content ? 'content-error' : undefined}
          className={`${textareaClass} font-mono`}
        />
        {errors.content ? (
          <p id="content-error" className="text-xs text-danger">
            {errors.content}
          </p>
        ) : null}
      </div>

      <FormField
        id="tags"
        label="Tags (separadas por vírgula)"
        value={tags}
        onChange={(event) => setTags(event.target.value)}
        placeholder="React, Hooks, Front-end"
      />

      <FormField
        id="thumbnailUrl"
        label="URL da imagem (opcional)"
        type="url"
        value={thumbnailUrl}
        onChange={(event) => setThumbnailUrl(event.target.value)}
        placeholder="https://…"
      />

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="w-auto px-8">
          {isSubmitting ? 'Publicando…' : 'Publicar'}
        </Button>
      </div>
    </form>
  )
}
