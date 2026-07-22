import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '@/context/AuthContext'
import { setToken } from '@/lib/token-storage'
import * as authService from '@/services/auth'
import { Sidebar } from './Sidebar'

vi.mock('@/services/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
  getMe: vi.fn(),
}))

const mocked = vi.mocked(authService)

function renderSidebar() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Sidebar />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('mostra "Entrar" e leva Publicar ao login quando visitante', () => {
    renderSidebar()

    expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute(
      'href',
      '/login',
    )
    expect(screen.getByRole('link', { name: /Publicar/ })).toHaveAttribute(
      'href',
      '/login',
    )
  })

  it('mostra "Sair" e leva Publicar à criação quando logado', async () => {
    setToken('jwt-abc')
    mocked.getMe.mockResolvedValue({
      id: 'u1',
      name: 'Julio Silva',
      email: 'julio@ex.com',
      createdAt: '2026-01-01T00:00:00.000Z',
    })

    renderSidebar()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument()
    })
    expect(screen.getByRole('link', { name: /Publicar/ })).toHaveAttribute(
      'href',
      '/posts/new',
    )
  })
})
