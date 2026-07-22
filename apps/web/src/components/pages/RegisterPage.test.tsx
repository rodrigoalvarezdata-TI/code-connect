import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '@/context/AuthContext'
import { ApiError } from '@/lib/api-error'
import * as authService from '@/services/auth'
import { RegisterPage } from './RegisterPage'

vi.mock('@/services/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
  getMe: vi.fn(),
}))

const mocked = vi.mocked(authService)

const ana = {
  id: 'u-1',
  name: 'Ana Souza',
  email: 'ana@example.com',
  createdAt: '2026-01-01T00:00:00.000Z',
}

function renderRegisterRoute() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <AuthProvider>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<p>área logada</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

async function fillAndSubmit() {
  await userEvent.type(screen.getByLabelText('Nome'), ana.name)
  await userEvent.type(screen.getByLabelText('Email'), ana.email)
  await userEvent.type(screen.getByLabelText('Senha'), 'S3nh4Segura!')
  await userEvent.click(screen.getByRole('button', { name: 'Cadastrar →' }))
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renderiza o formulário de cadastro e o link para o login', () => {
    renderRegisterRoute()
    expect(
      screen.getByRole('heading', { name: 'Cadastro' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Faça seu login!' }),
    ).toHaveAttribute('href', '/login')
  })

  /** POST /users não devolve token, então o cadastro é seguido de um login. */
  it('cadastra, autentica e redireciona para o dashboard', async () => {
    mocked.register.mockResolvedValue(ana)
    mocked.login.mockResolvedValue({
      accessToken: 'jwt-abc',
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: ana,
    })

    renderRegisterRoute()
    await fillAndSubmit()

    await waitFor(() => {
      expect(screen.getByText('área logada')).toBeInTheDocument()
    })
    expect(mocked.register).toHaveBeenCalledWith({
      name: ana.name,
      email: ana.email,
      password: 'S3nh4Segura!',
    })
  })

  it('exibe a mensagem do backend quando o e-mail já existe (409)', async () => {
    mocked.register.mockRejectedValue(new ApiError(409, 'E-mail já cadastrado'))

    renderRegisterRoute()
    await fillAndSubmit()

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('E-mail já cadastrado')
    })
    expect(mocked.login).not.toHaveBeenCalled()
  })
})
