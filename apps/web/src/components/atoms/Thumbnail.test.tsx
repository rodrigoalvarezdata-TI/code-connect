import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Thumbnail } from './Thumbnail'

describe('Thumbnail', () => {
  it('renderiza a imagem quando há src', () => {
    render(
      <Thumbnail src="https://ex.com/a.png" alt="Meu post" seed="p1" />,
    )
    expect(screen.getByRole('img', { name: 'Meu post' })).toBeInTheDocument()
  })

  it('mostra o placeholder com iniciais quando src é null', () => {
    render(<Thumbnail src={null} alt="Hooks no React" seed="p2" />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('HN')).toBeInTheDocument()
  })

  it('cai no placeholder quando a imagem falha ao carregar', () => {
    render(<Thumbnail src="https://ex.com/x.png" alt="Grid Responsivo" seed="p3" />)
    fireEvent.error(screen.getByRole('img', { name: 'Grid Responsivo' }))
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('GR')).toBeInTheDocument()
  })
})
