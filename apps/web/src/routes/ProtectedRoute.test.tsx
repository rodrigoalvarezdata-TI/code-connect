import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '@/context/AuthContext'
import { setToken } from '@/lib/token-storage'
import * as authService from '@/services/auth'
import { ProtectedRoute } from './ProtectedRoute'

vi.mock('@/services/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
  getMe: vi.fn(),
}))

const mocked = vi.mocked(authService)

function renderProtected() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <AuthProvider>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<p>área logada</p>} />
          </Route>
          <Route path="/login" element={<p>tela de login</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('redireciona para o login quando não há sessão', () => {
    renderProtected()
    expect(screen.getByText('tela de login')).toBeInTheDocument()
  })

  /**
   * Sem o estado de carregamento, um refresh na página logada redirigiria para
   * /login antes de o token guardado ser validado.
   */
  it('segura a rota enquanto valida o token guardado', async () => {
    setToken('jwt-abc')
    mocked.getMe.mockResolvedValue({
      id: 'u-1',
      name: 'Ana Souza',
      email: 'ana@example.com',
      createdAt: '2026-01-01T00:00:00.000Z',
    })

    renderProtected()

    expect(screen.getByRole('status')).toHaveTextContent('Carregando…')
    expect(screen.queryByText('tela de login')).not.toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('área logada')).toBeInTheDocument()
    })
  })

  it('manda para o login quando o token guardado é inválido', async () => {
    setToken('jwt-expirado')
    mocked.getMe.mockRejectedValue(new Error('401'))

    renderProtected()

    await waitFor(() => {
      expect(screen.getByText('tela de login')).toBeInTheDocument()
    })
  })
})
