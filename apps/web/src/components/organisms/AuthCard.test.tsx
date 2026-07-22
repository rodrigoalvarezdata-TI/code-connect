import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AuthCard } from './AuthCard'

describe('AuthCard', () => {
  it('renderiza o banner e o conteúdo filho', () => {
    render(
      <AuthCard bannerAlt="Banner de login">
        <p>Conteúdo do formulário</p>
      </AuthCard>,
    )
    const banner = screen.getByRole('img', { name: 'Banner de login' })
    // Regex, não caminho literal: sob o Vitest o import resolve para uma URL de
    // dev sem hash, diferente do nome hasheado que o build de produção emite.
    expect(banner.getAttribute('src')).toMatch(/banner-login.*\.jpg$/)
    expect(screen.getByText('Conteúdo do formulário')).toBeInTheDocument()
  })
})
