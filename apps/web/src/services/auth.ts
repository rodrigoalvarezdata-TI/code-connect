import { http } from '@/lib/http'

export interface AuthUser {
  id: string
  name: string
  email: string
  createdAt: string
}

export interface LoginResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  user: AuthUser
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

/**
 * O ValidationPipe da API roda com `forbidNonWhitelisted: true` — qualquer
 * campo extra no body vira 400. Por isso os payloads abaixo são montados campo
 * a campo, nunca por spread do estado do formulário (que carrega `remember`).
 */

export async function login({ email, password }: LoginInput) {
  const { data } = await http.post<LoginResponse>('/auth/login', {
    email,
    password,
  })
  return data
}

export async function register({ name, email, password }: RegisterInput) {
  const { data } = await http.post<AuthUser>('/users', {
    name,
    email,
    password,
  })
  return data
}

export async function getMe() {
  const { data } = await http.get<AuthUser>('/users/me')
  return data
}
