import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithRouter } from '@/test/utils'
import { RegisterForm } from './RegisterForm'

describe('RegisterForm', () => {
  it('renderiza título, campos e ações principais', () => {
    renderWithRouter(<RegisterForm />)
    expect(
      screen.getByRole('heading', { name: 'Cadastro' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Cadastrar →' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Faça seu login!' }),
    ).toHaveAttribute('href', '/login')
  })

  it('submete os valores preenchidos', async () => {
    const onSubmit = vi.fn()
    renderWithRouter(<RegisterForm onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText('Nome'), 'Rodrigo Alvarez')
    await userEvent.type(screen.getByLabelText('Email'), 'rodrigo@code.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'S3nh4Segura!')
    await userEvent.click(screen.getByRole('checkbox', { name: 'Lembrar-me' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar →' }))

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Rodrigo Alvarez',
      email: 'rodrigo@code.com',
      password: 'S3nh4Segura!',
      remember: true,
    })
  })

  /** Espelha o mínimo do RegisterUserDto — evita um 400 previsível. */
  it('bloqueia o envio quando a senha tem menos de 8 caracteres', async () => {
    const onSubmit = vi.fn()
    renderWithRouter(<RegisterForm onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText('Nome'), 'Rodrigo Alvarez')
    await userEvent.type(screen.getByLabelText('Email'), 'rodrigo@code.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'curta')
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar →' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(
      screen.getByText('A senha precisa ter ao menos 8 caracteres.'),
    ).toBeInTheDocument()
  })

  it('exibe o erro vindo da API como alerta', () => {
    renderWithRouter(<RegisterForm errorMessage="E-mail já cadastrado" />)
    expect(screen.getByRole('alert')).toHaveTextContent('E-mail já cadastrado')
  })

  it('desabilita o botão durante o envio', () => {
    renderWithRouter(<RegisterForm isSubmitting />)
    expect(screen.getByRole('button', { name: 'Cadastrando…' })).toBeDisabled()
  })
})
