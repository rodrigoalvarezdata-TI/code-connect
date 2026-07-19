import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SocialButton } from './SocialButton'

describe('SocialButton', () => {
  it('renderiza o label e o ícone', () => {
    render(<SocialButton icon="/Github.png" label="Github" />)
    const button = screen.getByRole('button', { name: 'Github' })
    expect(button).toBeInTheDocument()
    expect(button.querySelector('img')).toHaveAttribute('src', '/Github.png')
  })

  it('dispara onClick quando clicado', async () => {
    const onClick = vi.fn()
    render(<SocialButton icon="/Google.png" label="Gmail" onClick={onClick} />)
    await userEvent.click(screen.getByRole('button', { name: 'Gmail' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
