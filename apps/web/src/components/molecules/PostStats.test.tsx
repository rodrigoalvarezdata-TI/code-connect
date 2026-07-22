import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PostStats } from './PostStats'

describe('PostStats', () => {
  it('mostra contadores de curtidas e comentários (só leitura)', () => {
    render(<PostStats likesCount={12} commentsCount={3} likedByMe={false} />)

    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('vira botão quando onToggleLike é informado e reflete likedByMe', async () => {
    const onToggleLike = vi.fn()
    render(
      <PostStats
        likesCount={5}
        commentsCount={1}
        likedByMe
        onToggleLike={onToggleLike}
      />,
    )

    const button = screen.getByRole('button', { name: 'Remover curtida' })
    expect(button).toHaveAttribute('aria-pressed', 'true')

    await userEvent.click(button)
    expect(onToggleLike).toHaveBeenCalledOnce()
  })
})
