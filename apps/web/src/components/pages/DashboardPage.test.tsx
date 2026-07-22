import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '@/context/AuthContext'
import { setToken } from '@/lib/token-storage'
import * as authService from '@/services/auth'
import { DashboardPage } from './DashboardPage'

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

function renderDashboardRoute() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <AuthProvider>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/login" element={<p>tela de login</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    setToken('jwt-abc')
    mocked.getMe.mockResolvedValue(ana)
  })

  it('exibe o usuário resolvido pela API', async () => {
    renderDashboardRoute()

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Olá, Ana Souza!' }),
      ).toBeInTheDocument()
    })
    expect(
      screen.getByText('Você está autenticado como ana@example.com.'),
    ).toBeInTheDocument()
  })

  it('sai da sessão e volta para o login', async () => {
    renderDashboardRoute()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Sair' }))

    expect(screen.getByText('tela de login')).toBeInTheDocument()
    expect(localStorage.length).toBe(0)
  })
})
