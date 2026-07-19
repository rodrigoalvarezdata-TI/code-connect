import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AuthLayout } from './AuthLayout'

describe('AuthLayout', () => {
  it('renderiza o conteúdo filho', () => {
    render(
      <AuthLayout>
        <p>Conteúdo</p>
      </AuthLayout>,
    )
    expect(screen.getByText('Conteúdo')).toBeInTheDocument()
  })
})
