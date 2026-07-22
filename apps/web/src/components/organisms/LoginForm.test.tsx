import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithRouter } from '@/test/utils'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  it('renderiza título, campos e ações principais', () => {
    renderWithRouter(<LoginForm />)
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Login →' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Crie seu cadastro!' }),
    ).toHaveAttribute('href', '/register')
  })

  it('submete os valores preenchidos', async () => {
    const onSubmit = vi.fn()
    renderWithRouter(<LoginForm onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText('Email'), 'ana@example.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'segredo')
    await userEvent.click(screen.getByRole('checkbox', { name: 'Lembrar-me' }))
    await userEvent.click(screen.getByRole('button', { name: 'Login →' }))

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'ana@example.com',
      password: 'segredo',
      remember: true,
    })
  })

  it('bloqueia o envio e sinaliza os campos quando o e-mail é inválido', async () => {
    const onSubmit = vi.fn()
    renderWithRouter(<LoginForm onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText('Email'), 'nao-e-email')
    await userEvent.type(screen.getByLabelText('Senha'), 'segredo')
    await userEvent.click(screen.getByRole('button', { name: 'Login →' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Informe um e-mail válido.')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
  })

  it('exibe o erro vindo da API como alerta', () => {
    renderWithRouter(<LoginForm errorMessage="E-mail ou senha inválidos." />)
    expect(screen.getByRole('alert')).toHaveTextContent(
      'E-mail ou senha inválidos.',
    )
  })

  it('desabilita o botão durante o envio', () => {
    renderWithRouter(<LoginForm isSubmitting />)
    expect(screen.getByRole('button', { name: 'Entrando…' })).toBeDisabled()
  })
})
