import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as postsService from '@/services/posts'
import { makePostSummary } from '@/test/post-fixtures'
import { renderWithRouter } from '@/test/utils'
import { PostsFeedPage } from './PostsFeedPage'

vi.mock('@/services/posts')

const mocked = vi.mocked(postsService)

function page(items = [makePostSummary()], hasNextPage = false) {
  return { items, total: items.length, page: 1, limit: 12, hasNextPage }
}

describe('PostsFeedPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocked.getPosts.mockResolvedValue(page())
  })

  it('carrega e renderiza os posts do feed', async () => {
    renderWithRouter(<PostsFeedPage />)

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Hooks reutilizáveis no React' }),
      ).toBeInTheDocument()
    })
    expect(mocked.getPosts).toHaveBeenCalledWith({
      search: undefined,
      page: 1,
    })
  })

  it('dispara a busca full-text ao submeter o termo', async () => {
    renderWithRouter(<PostsFeedPage />)
    await waitFor(() => expect(mocked.getPosts).toHaveBeenCalled())

    await userEvent.type(
      screen.getByLabelText('Buscar publicações'),
      'tailwind',
    )
    await userEvent.keyboard('{Enter}')

    await waitFor(() => {
      expect(mocked.getPosts).toHaveBeenCalledWith({
        search: 'tailwind',
        page: 1,
      })
    })
  })

  it('mostra "Carregar mais" quando há próxima página', async () => {
    mocked.getPosts.mockResolvedValue(page([makePostSummary()], true))
    renderWithRouter(<PostsFeedPage />)

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Carregar mais' }),
      ).toBeInTheDocument()
    })
  })
})
