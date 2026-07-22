import { useState, type FormEvent } from 'react'
import { SearchIcon } from '@/components/atoms/icons'

interface SearchBarProps {
  defaultValue?: string
  onSearch: (term: string) => void
}

/**
 * Campo de busca do feed. Submete o termo (Enter/ícone) para o pai, que dispara o
 * full-text search no backend. `role="search"` + label sr-only dão o rótulo.
 */
export function SearchBar({ defaultValue = '', onSearch }: SearchBarProps) {
  const [value, setValue] = useState(defaultValue)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSearch(value.trim())
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="w-full">
      <label htmlFor="feed-search" className="sr-only">
        Buscar publicações
      </label>
      <div className="flex items-center gap-3 rounded-md border border-border-subtle bg-surface-card px-4 py-2.5 focus-within:border-brand-500">
        <SearchIcon className="shrink-0 text-2xl text-content-muted" />
        <input
          id="feed-search"
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Digite o que você procura"
          className="w-full bg-transparent text-content placeholder:text-content-muted focus:outline-none"
        />
      </div>
    </form>
  )
}
