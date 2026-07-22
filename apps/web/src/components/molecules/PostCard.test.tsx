import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { makePostSummary } from '@/test/post-fixtures'
import { renderWithRouter } from '@/test/utils'
import { PostCard } from './PostCard'

describe('PostCard', () => {
  it('mostra título, descrição, tags, contadores e autor', () => {
    renderWithRouter(<PostCard post={makePostSummary()} />)

    expect(
      screen.getByRole('heading', { name: 'Hooks reutilizáveis no React' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Como extrair lógica para custom hooks.'),
    ).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('@julio')).toBeInTheDocument()
  })

  it('linka para a página de detalhe', () => {
    renderWithRouter(<PostCard post={makePostSummary({ id: 'abc' })} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/posts/abc')
  })

  it('mostra o placeholder quando não há thumbnail', () => {
    renderWithRouter(<PostCard post={makePostSummary({ thumbnailUrl: null })} />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
