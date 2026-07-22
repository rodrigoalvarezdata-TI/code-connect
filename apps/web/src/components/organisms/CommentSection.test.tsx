import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { CommentNode } from '@/services/posts'
import { renderWithRouter } from '@/test/utils'
import { CommentSection } from './CommentSection'

const comments: CommentNode[] = [
  {
    id: 'c1',
    body: 'Comentário raiz',
    author: { id: 'u1', name: 'Marcia Alves' },
    createdAt: '2026-07-22T10:00:00.000Z',
    replies: [],
  },
]

describe('CommentSection', () => {
  it('mostra o campo de comentar para quem está logado', () => {
    renderWithRouter(
      <CommentSection
        comments={comments}
        isAuthenticated
        onAddComment={vi.fn()}
        onReply={vi.fn()}
      />,
    )
    expect(screen.getByLabelText('Escreva um comentário')).toBeInTheDocument()
  })

  it('mostra convite para login (sem campo) para visitante', () => {
    renderWithRouter(
      <CommentSection
        comments={comments}
        isAuthenticated={false}
        onAddComment={vi.fn()}
        onReply={vi.fn()}
      />,
    )
    expect(
      screen.queryByLabelText('Escreva um comentário'),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Faça login' })).toHaveAttribute(
      'href',
      '/login',
    )
  })

  it('lista os comentários existentes', () => {
    renderWithRouter(
      <CommentSection
        comments={comments}
        isAuthenticated={false}
        onAddComment={vi.fn()}
        onReply={vi.fn()}
      />,
    )
    expect(screen.getByText('Comentário raiz')).toBeInTheDocument()
  })
})
