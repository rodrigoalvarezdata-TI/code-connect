import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Avatar } from './Avatar'

describe('Avatar', () => {
  it('mostra as iniciais do primeiro e último nome', () => {
    render(<Avatar name="Julio Silva" />)
    expect(screen.getByText('JS')).toBeInTheDocument()
  })

  it('usa duas letras quando só há um nome', () => {
    render(<Avatar name="Marcia" />)
    expect(screen.getByText('MA')).toBeInTheDocument()
  })
})
