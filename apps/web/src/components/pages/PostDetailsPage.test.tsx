import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '@/context/AuthContext'
import { setToken } from '@/lib/token-storage'
import * as authService from '@/services/auth'
import * as postsService from '@/services/posts'
import { makePostDetail } from '@/test/post-fixtures'
import { PostDetailsPage } from './PostDetailsPage'

vi.mock('@/services/posts')
vi.mock('@/services/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
  getMe: vi.fn(),
}))

const posts = vi.mocked(postsService)
const auth = vi.mocked(authService)

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/posts/p1']}>
      <AuthProvider>
        <Routes>
          <Route path="/posts/:id" element={<PostDetailsPage />} />
          <Route path="/login" element={<p>tela de login</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('PostDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    posts.getPost.mockResolvedValue(makePostDetail())
  })

  it('carrega e mostra o post com o bloco de código', async () => {
    renderDetail()
    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'Hooks reutilizáveis no React',
        }),
      ).toBeInTheDocument()
    })
    expect(screen.getByText('const useToggle = () => {}')).toBeInTheDocument()
  })

  it('visitante não vê campo de comentar e é levado ao login ao curtir', async () => {
    renderDetail()
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument(),
    )

    expect(
      screen.queryByLabelText('Escreva um comentário'),
    ).not.toBeInTheDocument()

    await userEvent.click(
      screen.getByRole('button', { name: 'Curtir publicação' }),
    )
    expect(screen.getByText('tela de login')).toBeInTheDocument()
    expect(posts.likePost).not.toHaveBeenCalled()
  })

  it('logado consegue curtir', async () => {
    setToken('jwt-abc')
    auth.getMe.mockResolvedValue({
      id: 'u1',
      name: 'Julio Silva',
      email: 'julio@ex.com',
      createdAt: '2026-01-01T00:00:00.000Z',
    })
    posts.likePost.mockResolvedValue({ likesCount: 13, likedByMe: true })

    renderDetail()
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument(),
    )
    // Espera a sessão resolver (o campo de comentar aparece quando logado).
    await waitFor(() =>
      expect(screen.getByLabelText('Escreva um comentário')).toBeInTheDocument(),
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Curtir publicação' }),
    )
    await waitFor(() => expect(posts.likePost).toHaveBeenCalledWith('p1'))
  })
})
