import type { PostDetail, PostSummary } from '@/services/posts'

/** Fixtures de post para os testes — evita repetir o shape em cada arquivo. */
export function makePostSummary(overrides: Partial<PostSummary> = {}): PostSummary {
  return {
    id: 'p1',
    title: 'Hooks reutilizáveis no React',
    description: 'Como extrair lógica para custom hooks.',
    thumbnailUrl: null,
    tags: ['React', 'Hooks'],
    author: { id: 'u1', name: 'Julio Silva' },
    likesCount: 12,
    commentsCount: 3,
    likedByMe: false,
    createdAt: '2026-07-22T10:00:00.000Z',
    ...overrides,
  }
}

export function makePostDetail(overrides: Partial<PostDetail> = {}): PostDetail {
  return {
    ...makePostSummary(),
    content: 'const useToggle = () => {}',
    comments: [],
    ...overrides,
  }
}
