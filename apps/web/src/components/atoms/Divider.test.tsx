import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Divider } from './Divider'

describe('Divider', () => {
  it('renderiza o texto central quando informado', () => {
    render(<Divider>ou entre com outras contas</Divider>)
    expect(screen.getByText('ou entre com outras contas')).toBeInTheDocument()
  })

  it('renderiza uma linha simples sem conteúdo', () => {
    const { container } = render(<Divider />)
    expect(container.querySelector('hr')).toBeInTheDocument()
  })
})
