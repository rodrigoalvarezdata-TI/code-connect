import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SearchHeader } from './SearchHeader'

describe('SearchHeader', () => {
  it('não mostra chip nem "Limpar tudo" sem termo ativo', () => {
    render(<SearchHeader search="" onSearch={vi.fn()} />)
    expect(screen.queryByText('Limpar tudo')).not.toBeInTheDocument()
  })

  it('mostra o termo ativo como chip e limpa ao clicar em "Limpar tudo"', async () => {
    const onSearch = vi.fn()
    render(<SearchHeader search="react" onSearch={onSearch} />)

    expect(screen.getByText('react')).toBeInTheDocument()
    await userEvent.click(screen.getByText('Limpar tudo'))
    expect(onSearch).toHaveBeenCalledWith('')
  })
})
