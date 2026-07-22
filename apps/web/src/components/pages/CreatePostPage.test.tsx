import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as postsService from '@/services/posts'
import { makePostDetail } from '@/test/post-fixtures'
import { CreatePostPage } from './CreatePostPage'

vi.mock('@/services/posts')

const posts = vi.mocked(postsService)

function renderCreate() {
  return render(
    <MemoryRouter initialEntries={['/posts/new']}>
      <Routes>
        <Route path="/posts/new" element={<CreatePostPage />} />
        <Route path="/posts/:id" element={<p>detalhe do post</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('CreatePostPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    posts.createPost.mockResolvedValue(makePostDetail({ id: 'novo-post' }))
  })

  it('cria o post e navega para o detalhe', async () => {
    renderCreate()

    await userEvent.type(screen.getByLabelText('Título'), 'Meu novo post')
    await userEvent.type(screen.getByLabelText('Descrição'), 'Descrição do post')
    await userEvent.type(screen.getByLabelText('Código'), 'console.log(1)')
    await userEvent.click(screen.getByRole('button', { name: 'Publicar' }))

    await waitFor(() => {
      expect(screen.getByText('detalhe do post')).toBeInTheDocument()
    })
    expect(posts.createPost).toHaveBeenCalledWith({
      title: 'Meu novo post',
      description: 'Descrição do post',
      content: 'console.log(1)',
      tags: undefined,
      thumbnailUrl: undefined,
    })
  })
})
