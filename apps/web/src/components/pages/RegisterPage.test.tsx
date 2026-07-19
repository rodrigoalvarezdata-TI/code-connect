import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithRouter } from '@/test/utils'
import { RegisterPage } from './RegisterPage'

describe('RegisterPage', () => {
  it('renderiza o placeholder de cadastro e o link de volta ao login', () => {
    renderWithRouter(<RegisterPage />)
    expect(screen.getByRole('heading', { name: 'Cadastro' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Voltar para o login' }),
    ).toHaveAttribute('href', '/login')
  })
})
