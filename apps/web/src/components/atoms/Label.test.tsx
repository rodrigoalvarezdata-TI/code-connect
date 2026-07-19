import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Label } from './Label'

describe('Label', () => {
  it('renderiza o texto e associa via htmlFor', () => {
    render(<Label htmlFor="senha">Senha</Label>)
    const label = screen.getByText('Senha')
    expect(label).toBeInTheDocument()
    expect(label).toHaveAttribute('for', 'senha')
  })
})
