import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renderiza o conteúdo', () => {
    render(<Button>Login →</Button>)
    expect(screen.getByRole('button', { name: 'Login →' })).toBeInTheDocument()
  })

  it('dispara onClick quando clicado', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Entrar</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('não dispara onClick quando desabilitado', async () => {
    const onClick = vi.fn()
    render(
      <Button onClick={onClick} disabled>
        Entrar
      </Button>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(onClick).not.toHaveBeenCalled()
  })
})
