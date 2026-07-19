import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithRouter } from '@/test/utils'
import { RememberForgot } from './RememberForgot'

describe('RememberForgot', () => {
  it('reflete o estado de checked e o link de esqueci a senha', () => {
    renderWithRouter(
      <RememberForgot checked onCheckedChange={vi.fn()} />,
    )
    expect(screen.getByRole('checkbox', { name: 'Lembrar-me' })).toBeChecked()
    expect(
      screen.getByRole('link', { name: 'Esqueci a senha' }),
    ).toBeInTheDocument()
  })

  it('notifica a mudança do checkbox', async () => {
    const onCheckedChange = vi.fn()
    renderWithRouter(
      <RememberForgot checked={false} onCheckedChange={onCheckedChange} />,
    )
    await userEvent.click(screen.getByRole('checkbox', { name: 'Lembrar-me' }))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })
})
