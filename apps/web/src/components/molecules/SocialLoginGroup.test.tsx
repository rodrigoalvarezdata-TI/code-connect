import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SocialLoginGroup } from './SocialLoginGroup'

describe('SocialLoginGroup', () => {
  it('renderiza o divisor e os botões sociais', () => {
    render(<SocialLoginGroup />)
    expect(screen.getByText('ou entre com outras contas')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Github' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Gmail' })).toBeInTheDocument()
  })

  it('dispara o callback ao clicar no botão do Github', async () => {
    const onGithub = vi.fn()
    render(<SocialLoginGroup onGithub={onGithub} />)
    await userEvent.click(screen.getByRole('button', { name: 'Github' }))
    expect(onGithub).toHaveBeenCalledTimes(1)
  })
})
