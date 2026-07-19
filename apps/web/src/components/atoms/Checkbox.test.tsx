import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('renderiza com o label', () => {
    render(<Checkbox label="Lembrar-me" />)
    expect(
      screen.getByRole('checkbox', { name: 'Lembrar-me' }),
    ).toBeInTheDocument()
  })

  it('dispara onChange ao alternar', async () => {
    const onChange = vi.fn()
    render(<Checkbox label="Lembrar-me" onChange={onChange} />)
    await userEvent.click(screen.getByRole('checkbox', { name: 'Lembrar-me' }))
    expect(onChange).toHaveBeenCalledTimes(1)
  })
})
