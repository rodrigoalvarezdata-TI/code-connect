import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithRouter } from '@/test/utils'
import { SignupPrompt } from './SignupPrompt'

describe('SignupPrompt', () => {
  it('renderiza a mensagem e o link para o destino', () => {
    renderWithRouter(
      <SignupPrompt
        message="Ainda não tem conta?"
        linkText="Crie seu cadastro!"
        to="/register"
      />,
    )
    expect(screen.getByText('Ainda não tem conta?')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Crie seu cadastro!' }),
    ).toHaveAttribute('href', '/register')
  })
})
