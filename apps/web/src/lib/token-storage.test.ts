import { beforeEach, describe, expect, it } from 'vitest'
import { clearToken, getToken, setToken } from './token-storage'

describe('token-storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('retorna null quando não há token guardado', () => {
    expect(getToken()).toBeNull()
  })

  it('guarda e recupera o token', () => {
    setToken('jwt-abc')
    expect(getToken()).toBe('jwt-abc')
  })

  it('remove o token', () => {
    setToken('jwt-abc')
    clearToken()
    expect(getToken()).toBeNull()
  })
})
