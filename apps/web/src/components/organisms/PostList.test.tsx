import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { makePostSummary } from '@/test/post-fixtures'
import { renderWithRouter } from '@/test/utils'
import { PostList } from './PostList'

describe('PostList', () => {
  it('mostra estado de carregando', () => {
    renderWithRouter(<PostList posts={[]} isLoading />)
    expect(screen.getByRole('status')).toHaveTextContent('Carregando')
  })

  it('mostra mensagem de vazio quando não há posts', () => {
    renderWithRouter(
      <PostList posts={[]} isLoading={false} emptyMessage="Nada aqui." />,
    )
    expect(screen.getByText('Nada aqui.')).toBeInTheDocument()
  })

  it('renderiza um card por post', () => {
    renderWithRouter(
      <PostList
        posts={[
          makePostSummary({ id: 'a', title: 'Post A' }),
          makePostSummary({ id: 'b', title: 'Post B' }),
        ]}
        isLoading={false}
      />,
    )
    expect(screen.getByRole('heading', { name: 'Post A' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Post B' })).toBeInTheDocument()
  })

  it('mostra o erro quando informado', () => {
    renderWithRouter(
      <PostList posts={[]} isLoading={false} errorMessage="Deu ruim." />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Deu ruim.')
  })
})
