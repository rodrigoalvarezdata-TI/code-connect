import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithRouter } from '@/test/utils'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  it('renderiza título, campos e ações principais', () => {
    renderWithRouter(<LoginForm />)
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email ou usuário')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Login →' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Crie seu cadastro!' }),
    ).toHaveAttribute('href', '/register')
  })

  it('submete os valores preenchidos', async () => {
    const onSubmit = vi.fn()
    renderWithRouter(<LoginForm onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText('Email ou usuário'), 'rodrigo')
    await userEvent.type(screen.getByLabelText('Senha'), 'segredo')
    await userEvent.click(screen.getByRole('checkbox', { name: 'Lembrar-me' }))
    await userEvent.click(screen.getByRole('button', { name: 'Login →' }))

    expect(onSubmit).toHaveBeenCalledWith({
      identifier: 'rodrigo',
      password: 'segredo',
      remember: true,
    })
  })
})
