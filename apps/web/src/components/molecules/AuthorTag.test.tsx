import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { handleFromName } from '@/lib/handle'
import { AuthorTag } from './AuthorTag'

describe('handleFromName', () => {
  it('deriva o handle a partir do primeiro nome', () => {
    expect(handleFromName('Julio Silva')).toBe('@julio')
  })
})

describe('AuthorTag', () => {
  it('mostra o handle do autor', () => {
    render(<AuthorTag name="Marcia Alves" />)
    expect(screen.getByText('@marcia')).toBeInTheDocument()
  })
})
