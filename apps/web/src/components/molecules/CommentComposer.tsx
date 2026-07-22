import { useState, type FormEvent } from 'react'
import { Button } from '@/components/atoms/Button'

interface CommentComposerProps {
  onSubmit: (body: string) => Promise<void>
  submitting?: boolean
  placeholder?: string
  label: string
  /** Rótulo do botão de envio (ex.: "Comentar", "Responder"). */
  submitLabel?: string
  autoFocus?: boolean
}

/** Campo de escrever comentário/resposta. Limpa após enviar com sucesso. */
export function CommentComposer({
  onSubmit,
  submitting = false,
  placeholder = 'Escreva um comentário…',
  label,
  submitLabel = 'Comentar',
  autoFocus = false,
}: CommentComposerProps) {
  const [body, setBody] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = body.trim()
    if (!trimmed) return
    await onSubmit(trimmed)
    setBody('')
  }

  const fieldId = `comment-${label.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label htmlFor={fieldId} className="sr-only">
        {label}
      </label>
      <textarea
        id={fieldId}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder={placeholder}
        rows={3}
        autoFocus={autoFocus}
        className="w-full resize-y rounded-md border border-border-subtle bg-surface-input px-3 py-2 text-content placeholder:text-content-muted focus:border-brand-500 focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-500"
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={submitting || body.trim().length === 0}
          className="w-auto px-6"
        >
          {submitting ? 'Enviando…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
