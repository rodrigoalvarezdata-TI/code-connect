import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { makePostDetail } from '@/test/post-fixtures'
import { PostDetailCard } from './PostDetailCard'

describe('PostDetailCard', () => {
  it('mostra título, código e autor', () => {
    render(
      <PostDetailCard
        post={makePostDetail({ content: 'const x = 1' })}
        onToggleLike={vi.fn()}
      />,
    )
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Hooks reutilizáveis no React',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('const x = 1')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Código:' })).toBeInTheDocument()
  })

  it('aciona onToggleLike ao clicar em curtir', async () => {
    const onToggleLike = vi.fn()
    render(
      <PostDetailCard post={makePostDetail()} onToggleLike={onToggleLike} />,
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Curtir publicação' }),
    )
    expect(onToggleLike).toHaveBeenCalledOnce()
  })
})
