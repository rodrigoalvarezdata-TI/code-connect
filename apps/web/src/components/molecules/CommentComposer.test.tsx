import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CommentComposer } from './CommentComposer'

describe('CommentComposer', () => {
  it('desabilita o envio enquanto o campo está vazio', () => {
    render(<CommentComposer label="Comentar" onSubmit={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Comentar' })).toBeDisabled()
  })

  it('envia o texto e limpa o campo', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<CommentComposer label="Comentar" onSubmit={onSubmit} />)

    const field = screen.getByLabelText('Comentar')
    await userEvent.type(field, 'Muito bom!')
    await userEvent.click(screen.getByRole('button', { name: 'Comentar' }))

    expect(onSubmit).toHaveBeenCalledWith('Muito bom!')
    expect(field).toHaveValue('')
  })
})
