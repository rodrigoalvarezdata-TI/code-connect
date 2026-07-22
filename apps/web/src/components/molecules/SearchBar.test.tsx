import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SearchBar } from './SearchBar'

describe('SearchBar', () => {
  it('submete o termo (com trim) ao pai', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} />)

    await userEvent.type(
      screen.getByLabelText('Buscar publicações'),
      '  react hooks  ',
    )
    await userEvent.keyboard('{Enter}')

    expect(onSearch).toHaveBeenCalledWith('react hooks')
  })

  it('parte do valor inicial informado', () => {
    render(<SearchBar defaultValue="tailwind" onSearch={() => {}} />)
    expect(screen.getByLabelText('Buscar publicações')).toHaveValue('tailwind')
  })
})
