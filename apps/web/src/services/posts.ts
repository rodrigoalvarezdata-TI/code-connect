import { http } from '@/lib/http'

export interface PostAuthor {
  id: string
  name: string
}

export interface PostSummary {
  id: string
  title: string
  description: string
  thumbnailUrl: string | null
  tags: string[]
  author: PostAuthor
  likesCount: number
  commentsCount: number
  likedByMe: boolean
  createdAt: string
}

export interface CommentNode {
  id: string
  body: string
  author: PostAuthor
  createdAt: string
  replies: CommentNode[]
}

export interface PostDetail extends PostSummary {
  content: string
  comments: CommentNode[]
}

export interface PaginatedPosts {
  items: PostSummary[]
  total: number
  page: number
  limit: number
  hasNextPage: boolean
}

export interface LikeState {
  likesCount: number
  likedByMe: boolean
}

export interface ListPostsParams {
  search?: string
  page?: number
  limit?: number
}

export interface CreatePostInput {
  title: string
  description: string
  content: string
  tags?: string[]
  thumbnailUrl?: string
}

export interface CreateCommentInput {
  body: string
  parentId?: string
}

/**
 * O feed é público: `GET /posts` e `GET /posts/:id` funcionam sem token. O
 * interceptor de `@/lib/http` anexa o Bearer automaticamente quando há sessão,
 * então `likedByMe` vem preenchido para quem está logado sem esforço extra aqui.
 *
 * Como a API roda com `forbidNonWhitelisted`, os payloads são montados campo a
 * campo (nunca por spread do estado do formulário).
 */

export async function getPosts(
  params: ListPostsParams = {},
): Promise<PaginatedPosts> {
  const { data } = await http.get<PaginatedPosts>('/posts', {
    params: {
      ...(params.search ? { search: params.search } : {}),
      ...(params.page ? { page: params.page } : {}),
      ...(params.limit ? { limit: params.limit } : {}),
    },
  })
  return data
}

export async function getPost(id: string): Promise<PostDetail> {
  const { data } = await http.get<PostDetail>(`/posts/${id}`)
  return data
}

export async function createPost(input: CreatePostInput): Promise<PostDetail> {
  const { data } = await http.post<PostDetail>('/posts', {
    title: input.title,
    description: input.description,
    content: input.content,
    ...(input.tags ? { tags: input.tags } : {}),
    ...(input.thumbnailUrl ? { thumbnailUrl: input.thumbnailUrl } : {}),
  })
  return data
}

export async function likePost(postId: string): Promise<LikeState> {
  const { data } = await http.post<LikeState>(`/posts/${postId}/likes`)
  return data
}

export async function unlikePost(postId: string): Promise<LikeState> {
  const { data } = await http.delete<LikeState>(`/posts/${postId}/likes`)
  return data
}

export async function createComment(
  postId: string,
  input: CreateCommentInput,
): Promise<CommentNode> {
  const { data } = await http.post<CommentNode>(`/posts/${postId}/comments`, {
    body: input.body,
    ...(input.parentId ? { parentId: input.parentId } : {}),
  })
  return data
}
