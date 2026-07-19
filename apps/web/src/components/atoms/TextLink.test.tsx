import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithRouter } from '@/test/utils'
import { TextLink } from './TextLink'

describe('TextLink', () => {
  it('renderiza um link para o destino informado', () => {
    renderWithRouter(<TextLink to="/register">Crie seu cadastro!</TextLink>)
    const link = screen.getByRole('link', { name: 'Crie seu cadastro!' })
    expect(link).toHaveAttribute('href', '/register')
  })
})
