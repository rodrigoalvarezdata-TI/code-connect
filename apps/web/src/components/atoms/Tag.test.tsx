import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Tag } from './Tag'

describe('Tag', () => {
  it('renderiza o texto da tag', () => {
    render(<Tag>React</Tag>)
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('não mostra botão de remover sem onRemove', () => {
    render(<Tag>React</Tag>)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('chama onRemove ao clicar no botão', async () => {
    const onRemove = vi.fn()
    render(<Tag onRemove={onRemove}>React</Tag>)

    await userEvent.click(
      screen.getByRole('button', { name: 'Remover filtro React' }),
    )
    expect(onRemove).toHaveBeenCalledOnce()
  })
})
