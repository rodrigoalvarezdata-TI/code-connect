import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BannerImage } from './BannerImage'

describe('BannerImage', () => {
  it('expõe o alt recebido como nome acessível', () => {
    render(<BannerImage alt="Banner de login" />)
    expect(screen.getByRole('img', { name: 'Banner de login' })).toBeInTheDocument()
  })

  it('oferece AVIF e WebP antes do fallback JPG', () => {
    const { container } = render(<BannerImage alt="Banner" />)
    const types = Array.from(container.querySelectorAll('source')).map((s) =>
      s.getAttribute('type'),
    )
    expect(types).toEqual(['image/avif', 'image/webp'])
    // O src do <img> é o fallback e só é usado por browsers sem AVIF/WebP.
    expect(screen.getByRole('img')).toHaveAttribute('src', expect.stringContaining('.jpg'))
  })

  it('restringe os <source> ao breakpoint em que o banner aparece', () => {
    const { container } = render(<BannerImage alt="Banner" />)
    for (const source of container.querySelectorAll('source')) {
      expect(source).toHaveAttribute('media', '(min-width: 768px)')
    }
  })

  it('declara dimensões para o browser reservar a proporção', () => {
    render(<BannerImage alt="Banner" />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('width', '800')
    expect(img).toHaveAttribute('height', '1327')
  })

  it('mantém o picture como display:contents para não quebrar o h-full', () => {
    const { container } = render(<BannerImage alt="Banner" />)
    expect(container.querySelector('picture')).toHaveClass('contents')
  })
})
