import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BrandMark } from './BrandMark'

describe('BrandMark', () => {
  it('é decorativo por padrão', () => {
    const { container } = render(<BrandMark />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it('expõe um nome acessível quando recebe title', () => {
    render(<BrandMark title="code connect" />)
    expect(screen.getByRole('img', { name: 'code connect' })).toBeInTheDocument()
  })
})
