import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getToken, setToken } from '@/lib/token-storage'
import * as authService from '@/services/auth'
import { AuthProvider } from './AuthContext'
import { useAuth } from './auth-context'

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

/** Sonda que expõe o estado do contexto e dispara as ações. */
function Probe() {
  const { user, isAuthenticated, isLoading, signIn, signUp, signOut } = useAuth()

  return (
    <div>
      <p>carregando: {String(isLoading)}</p>
      <p>autenticado: {String(isAuthenticated)}</p>
      <p>usuário: {user?.name ?? 'nenhum'}</p>
      <button
        onClick={() => void signIn({ email: ana.email, password: 'S3nh4!' })}
      >
        entrar
      </button>
      <button
        onClick={() =>
          void signUp({ name: ana.name, email: ana.email, password: 'S3nh4!' })
        }
      >
        cadastrar
      </button>
      <button onClick={signOut}>sair</button>
    </div>
  )
}

function renderProbe() {
  return render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('começa deslogado e sem carregar quando não há token guardado', () => {
    renderProbe()
    expect(screen.getByText('carregando: false')).toBeInTheDocument()
    expect(screen.getByText('autenticado: false')).toBeInTheDocument()
    expect(mocked.getMe).not.toHaveBeenCalled()
  })

  it('signIn guarda o token e popula o usuário', async () => {
    mocked.login.mockResolvedValue({
      accessToken: 'jwt-abc',
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: ana,
    })

    renderProbe()
    await userEvent.click(screen.getByRole('button', { name: 'entrar' }))

    await waitFor(() => {
      expect(screen.getByText('usuário: Ana Souza')).toBeInTheDocument()
    })
    expect(getToken()).toBe('jwt-abc')
  })

  it('signUp cadastra e autentica em seguida', async () => {
    mocked.register.mockResolvedValue(ana)
    mocked.login.mockResolvedValue({
      accessToken: 'jwt-abc',
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: ana,
    })

    renderProbe()
    await userEvent.click(screen.getByRole('button', { name: 'cadastrar' }))

    await waitFor(() => {
      expect(screen.getByText('autenticado: true')).toBeInTheDocument()
    })
    expect(mocked.register).toHaveBeenCalled()
    expect(mocked.login).toHaveBeenCalledWith({
      email: ana.email,
      password: 'S3nh4!',
    })
  })

  it('valida o token guardado no mount', async () => {
    setToken('jwt-guardado')
    mocked.getMe.mockResolvedValue(ana)

    renderProbe()

    await waitFor(() => {
      expect(screen.getByText('usuário: Ana Souza')).toBeInTheDocument()
    })
    expect(mocked.getMe).toHaveBeenCalled()
  })

  /** O token dura 1h e não há refresh — um token expirado precisa ser descartado. */
  it('descarta o token guardado quando GET /users/me falha', async () => {
    setToken('jwt-expirado')
    mocked.getMe.mockRejectedValue(new Error('401'))

    renderProbe()

    await waitFor(() => {
      expect(getToken()).toBeNull()
    })
    expect(screen.getByText('autenticado: false')).toBeInTheDocument()
  })

  it('signOut limpa token e usuário', async () => {
    mocked.login.mockResolvedValue({
      accessToken: 'jwt-abc',
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: ana,
    })

    renderProbe()
    await userEvent.click(screen.getByRole('button', { name: 'entrar' }))
    await waitFor(() => {
      expect(screen.getByText('autenticado: true')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: 'sair' }))

    expect(screen.getByText('autenticado: false')).toBeInTheDocument()
    expect(getToken()).toBeNull()
  })
})
