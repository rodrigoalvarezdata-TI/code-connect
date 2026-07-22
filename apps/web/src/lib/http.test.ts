import { AxiosError, AxiosHeaders } from 'axios'
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { http } from './http'
import { ApiError } from './api-error'
import { clearToken, setToken } from './token-storage'

const originalAdapter = http.defaults.adapter

/** Adapter que devolve a própria config, para inspecionar os headers enviados. */
const echoAdapter: AxiosAdapter = (config) =>
  Promise.resolve({
    data: config,
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  } as AxiosResponse<InternalAxiosRequestConfig>)

describe('http', () => {
  beforeEach(() => {
    localStorage.clear()
    http.defaults.adapter = echoAdapter
  })

  afterEach(() => {
    http.defaults.adapter = originalAdapter
  })

  it('anexa o Bearer token quando há sessão guardada', async () => {
    setToken('jwt-abc')
    const { data } = await http.get<InternalAxiosRequestConfig>('/users/me')
    expect(data.headers.Authorization).toBe('Bearer jwt-abc')
  })

  it('não envia Authorization quando não há token', async () => {
    clearToken()
    const { data } = await http.get<InternalAxiosRequestConfig>('/users/me')
    expect(data.headers.Authorization).toBeUndefined()
  })

  it('converte a falha do axios em ApiError', async () => {
    const config = { headers: new AxiosHeaders() }
    http.defaults.adapter = () =>
      Promise.reject(
        new AxiosError('erro', undefined, config, null, {
          status: 401,
          statusText: '',
          data: { message: 'Credenciais inválidas' },
          headers: {},
          config,
        }),
      )

    await expect(http.post('/auth/login', {})).rejects.toBeInstanceOf(ApiError)
  })
})
