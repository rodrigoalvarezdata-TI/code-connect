import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { CommentNode } from '@/services/posts'
import { CommentItem } from './CommentItem'

const comment: CommentNode = {
  id: 'c1',
  body: 'Achei muito bom seu código!',
  author: { id: 'u1', name: 'Marcia Alves' },
  createdAt: '2026-07-22T10:00:00.000Z',
  replies: [
    {
      id: 'r1',
      body: 'Obrigado!',
      author: { id: 'u2', name: 'Julio Silva' },
      createdAt: '2026-07-22T11:00:00.000Z',
      replies: [],
    },
  ],
}

describe('CommentItem', () => {
  it('mostra o autor e o corpo do comentário', () => {
    render(<CommentItem comment={comment} canReply={false} />)
    expect(screen.getByText('@marcia')).toBeInTheDocument()
    expect(screen.getByText('Achei muito bom seu código!')).toBeInTheDocument()
  })

  it('esconde respostas até clicar em "Ver respostas"', async () => {
    render(<CommentItem comment={comment} canReply={false} />)
    expect(screen.queryByText('Obrigado!')).not.toBeInTheDocument()

    await userEvent.click(
      screen.getByRole('button', { name: 'Ver respostas (1)' }),
    )
    expect(screen.getByText('Obrigado!')).toBeInTheDocument()
  })

  it('abre o campo de resposta quando pode responder', async () => {
    render(
      <CommentItem comment={comment} canReply onReply={vi.fn()} />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Responder' }))
    expect(
      screen.getByLabelText('Responder a @marcia'),
    ).toBeInTheDocument()
  })

  it('não oferece responder quando canReply é false', () => {
    render(<CommentItem comment={comment} canReply={false} />)
    expect(
      screen.queryByRole('button', { name: 'Responder' }),
    ).not.toBeInTheDocument()
  })
})
