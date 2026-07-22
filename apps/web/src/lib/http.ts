import axios from 'axios'
import { toApiError } from './api-error'
import { getToken } from './token-storage'

/**
 * Instância axios única para falar com apps/api.
 *
 * Sem `withCredentials`: o backend responde CORS com `credentials: false` e a
 * sessão viaja no header Authorization, não em cookie.
 */
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/** Todo `catch` da aplicação recebe um ApiError, nunca um AxiosError cru. */
http.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
)
