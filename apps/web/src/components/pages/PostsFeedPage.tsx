import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Button } from '@/components/atoms/Button'
import { PostList } from '@/components/organisms/PostList'
import { SearchHeader } from '@/components/organisms/SearchHeader'
import { ApiError } from '@/lib/api-error'
import { getPosts, type PostSummary } from '@/services/posts'

/**
 * Feed público (rota `/`). Lê o termo de busca do query param (`?search=`), então
 * a URL é a fonte da verdade do filtro — dá para compartilhar/voltar. A busca é
 * full-text no backend. Paginação incremental via "Carregar mais".
 */
export function PostsFeedPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') ?? ''

  const [posts, setPosts] = useState<PostSummary[]>([])
  const [page, setPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>()

  // Refaz a primeira página sempre que o termo muda.
  useEffect(() => {
    let active = true
    setIsLoading(true)
    setErrorMessage(undefined)
    getPosts({ search: search || undefined, page: 1 })
      .then((data) => {
        if (!active) return
        setPosts(data.items)
        setPage(1)
        setHasNextPage(data.hasNextPage)
      })
      .catch((error: unknown) => {
        if (!active) return
        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : 'Não foi possível carregar o feed.',
        )
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [search])

  const handleSearch = useCallback(
    (term: string) => {
      setSearchParams(term ? { search: term } : {})
    },
    [setSearchParams],
  )

  async function handleLoadMore() {
    setIsLoadingMore(true)
    try {
      const next = page + 1
      const data = await getPosts({ search: search || undefined, page: next })
      setPosts((current) => [...current, ...data.items])
      setPage(next)
      setHasNextPage(data.hasNextPage)
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : 'Não foi possível carregar mais publicações.',
      )
    } finally {
      setIsLoadingMore(false)
    }
  }

  return (
    <div className="flex flex-col gap-12">
      <SearchHeader search={search} onSearch={handleSearch} />

      <PostList
        posts={posts}
        isLoading={isLoading}
        errorMessage={errorMessage}
        emptyMessage={
          search
            ? `Nenhuma publicação encontrada para "${search}".`
            : 'Nenhuma publicação ainda.'
        }
      />

      {hasNextPage && !isLoading ? (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="w-auto px-8"
          >
            {isLoadingMore ? 'Carregando…' : 'Carregar mais'}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
