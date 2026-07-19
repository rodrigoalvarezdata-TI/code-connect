import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FormField } from './FormField'

describe('FormField', () => {
  it('associa o label ao input', () => {
    render(<FormField id="email" label="Email ou usuário" />)
    expect(screen.getByLabelText('Email ou usuário')).toBeInTheDocument()
  })

  it('exibe a mensagem de erro quando informada', () => {
    render(<FormField id="email" label="Email ou usuário" error="Obrigatório" />)
    expect(screen.getByText('Obrigatório')).toBeInTheDocument()
    expect(screen.getByLabelText('Email ou usuário')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })
})
