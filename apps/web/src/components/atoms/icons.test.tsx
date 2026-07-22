import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CodeIcon, LogoutIcon, SearchIcon } from './icons'

describe('icons', () => {
  it('renderiza um SVG decorativo (aria-hidden)', () => {
    const { container } = render(<CodeIcon />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it('repassa className', () => {
    const { container } = render(<SearchIcon className="text-2xl" />)
    expect(container.querySelector('svg')).toHaveClass('text-2xl')
  })

  it('permite sobrescrever aria-hidden para ícones com significado', () => {
    const { container } = render(<LogoutIcon aria-hidden={false} />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'false')
  })
})
