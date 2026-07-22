import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '@/context/AuthContext'
import { ApiError } from '@/lib/api-error'
import * as authService from '@/services/auth'
import { LoginPage } from './LoginPage'

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

/** Monta a rota real para conseguir observar o redirect pós-login. */
function renderLoginRoute() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<p>área logada</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

async function fillAndSubmit() {
  await userEvent.type(screen.getByLabelText('Email'), ana.email)
  await userEvent.type(screen.getByLabelText('Senha'), 'S3nh4Segura!')
  await userEvent.click(screen.getByRole('button', { name: 'Login →' }))
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('renderiza o banner e o formulário de login', () => {
    renderLoginRoute()
    expect(
      screen.getByRole('img', {
        name: 'Pessoa conectada à plataforma code connect',
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Login →' })).toBeInTheDocument()
  })

  it('autentica e redireciona para o dashboard', async () => {
    mocked.login.mockResolvedValue({
      accessToken: 'jwt-abc',
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: ana,
    })

    renderLoginRoute()
    await fillAndSubmit()

    await waitFor(() => {
      expect(screen.getByText('área logada')).toBeInTheDocument()
    })
    expect(mocked.login).toHaveBeenCalledWith({
      email: ana.email,
      password: 'S3nh4Segura!',
    })
  })

  it('exibe a mensagem de credenciais inválidas em um 401', async () => {
    mocked.login.mockRejectedValue(
      new ApiError(401, 'E-mail ou senha inválidos.'),
    )

    renderLoginRoute()
    await fillAndSubmit()

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'E-mail ou senha inválidos.',
      )
    })
    // Segue na tela de login, com o botão reabilitado para nova tentativa.
    expect(screen.getByRole('button', { name: 'Login →' })).toBeEnabled()
  })
})
