import { beforeEach, describe, expect, it, vi } from 'vitest'
import { http } from '@/lib/http'
import { getMe, login, register } from './auth'

vi.mock('@/lib/http', () => ({
  http: { get: vi.fn(), post: vi.fn() },
}))

const mockedHttp = vi.mocked(http)

describe('services/auth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedHttp.post.mockResolvedValue({ data: {} })
    mockedHttp.get.mockResolvedValue({ data: {} })
  })

  it('faz login em POST /auth/login', async () => {
    mockedHttp.post.mockResolvedValue({ data: { accessToken: 'jwt-abc' } })

    const result = await login({ email: 'ana@example.com', password: 'S3nh4!' })

    expect(mockedHttp.post).toHaveBeenCalledWith('/auth/login', {
      email: 'ana@example.com',
      password: 'S3nh4!',
    })
    expect(result).toEqual({ accessToken: 'jwt-abc' })
  })

  it('cadastra em POST /users', async () => {
    await register({
      name: 'Ana Souza',
      email: 'ana@example.com',
      password: 'S3nh4Segura!',
    })

    expect(mockedHttp.post).toHaveBeenCalledWith('/users', {
      name: 'Ana Souza',
      email: 'ana@example.com',
      password: 'S3nh4Segura!',
    })
  })

  /**
   * O ValidationPipe da API roda com forbidNonWhitelisted — um `remember`
   * vazando no body derruba o cadastro com 400.
   */
  it('não envia campos fora do DTO, mesmo se chegarem no input', async () => {
    const input = {
      name: 'Ana Souza',
      email: 'ana@example.com',
      password: 'S3nh4Segura!',
      remember: true,
    }

    await register(input)

    expect(mockedHttp.post).toHaveBeenCalledWith(
      '/users',
      expect.not.objectContaining({ remember: expect.anything() }),
    )
  })

  it('busca o perfil em GET /users/me', async () => {
    await getMe()
    expect(mockedHttp.get).toHaveBeenCalledWith('/users/me')
  })
})
