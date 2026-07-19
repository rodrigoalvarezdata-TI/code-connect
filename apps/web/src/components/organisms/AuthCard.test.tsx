import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AuthCard } from './AuthCard'

describe('AuthCard', () => {
  it('renderiza o banner e o conteúdo filho', () => {
    render(
      <AuthCard bannerSrc="/banner_login.jpg" bannerAlt="Banner de login">
        <p>Conteúdo do formulário</p>
      </AuthCard>,
    )
    const banner = screen.getByRole('img', { name: 'Banner de login' })
    expect(banner).toHaveAttribute('src', '/banner_login.jpg')
    expect(screen.getByText('Conteúdo do formulário')).toBeInTheDocument()
  })
})
