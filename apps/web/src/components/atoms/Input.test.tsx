import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Input } from './Input'

describe('Input', () => {
  it('renderiza com placeholder', () => {
    render(<Input placeholder="usuario123" />)
    expect(screen.getByPlaceholderText('usuario123')).toBeInTheDocument()
  })

  it('aceita digitação do usuário', async () => {
    render(<Input placeholder="usuario123" />)
    const input = screen.getByPlaceholderText('usuario123')
    await userEvent.type(input, 'rodrigo')
    expect(input).toHaveValue('rodrigo')
  })
})
