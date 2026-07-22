import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CreatePostForm } from './CreatePostForm'

describe('CreatePostForm', () => {
  it('valida campos obrigatórios antes de enviar', async () => {
    const onSubmit = vi.fn()
    render(<CreatePostForm onSubmit={onSubmit} />)

    await userEvent.click(screen.getByRole('button', { name: 'Publicar' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Informe um título (mín. 3).')).toBeInTheDocument()
    expect(screen.getByText('Informe uma descrição.')).toBeInTheDocument()
    expect(screen.getByText('Informe o código do post.')).toBeInTheDocument()
  })

  it('envia os valores com as tags parseadas', async () => {
    const onSubmit = vi.fn()
    render(<CreatePostForm onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText('Título'), 'Meu post')
    await userEvent.type(screen.getByLabelText('Descrição'), 'Uma descrição')
    await userEvent.type(screen.getByLabelText('Código'), 'const x = 1')
    await userEvent.type(
      screen.getByLabelText('Tags (separadas por vírgula)'),
      'React, Hooks',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Publicar' }))

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Meu post',
      description: 'Uma descrição',
      content: 'const x = 1',
      tags: ['React', 'Hooks'],
      thumbnailUrl: undefined,
    })
  })

  it('exibe erro vindo da API', () => {
    render(<CreatePostForm onSubmit={vi.fn()} errorMessage="Deu ruim." />)
    expect(screen.getByRole('alert')).toHaveTextContent('Deu ruim.')
  })
})
