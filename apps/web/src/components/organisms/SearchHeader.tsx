import { Tag } from '@/components/atoms/Tag'
import { SearchBar } from '@/components/molecules/SearchBar'

interface SearchHeaderProps {
  /** Termo de busca ativo (vem do query param da URL). */
  search: string
  onSearch: (term: string) => void
}

/**
 * Cabeçalho de busca reutilizado pelo feed e pelo detalhe. Submeter dispara o
 * full-text search no backend; o termo ativo vira um chip removível + "Limpar
 * tudo", espelhando os filtros do design.
 */
export function SearchHeader({ search, onSearch }: SearchHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* key reinicia o campo quando o termo muda por fora (ex.: Limpar tudo). */}
      <SearchBar key={search} defaultValue={search} onSearch={onSearch} />

      {search ? (
        <div className="flex items-center justify-between gap-4">
          <ul className="flex flex-wrap gap-3">
            <li>
              <Tag onRemove={() => onSearch('')}>{search}</Tag>
            </li>
          </ul>
          <button
            type="button"
            onClick={() => onSearch('')}
            className="shrink-0 text-sm text-content-muted underline-offset-2 transition-colors hover:text-content hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            Limpar tudo
          </button>
        </div>
      ) : null}
    </div>
  )
}
