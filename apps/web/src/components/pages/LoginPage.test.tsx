import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithRouter } from '@/test/utils'
import { LoginPage } from './LoginPage'

describe('LoginPage', () => {
  it('renderiza o banner e o formulário de login', () => {
    renderWithRouter(<LoginPage />)
    expect(
      screen.getByRole('img', {
        name: 'Pessoa conectada à plataforma code connect',
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Login →' })).toBeInTheDocument()
  })
})
