const STORAGE_KEY = 'code-connect:access-token'

/**
 * Persistência do access token em localStorage.
 *
 * Todas as operações são protegidas por try/catch: o acesso a localStorage
 * lança em modo privativo e quando o storage está cheio. Falhar em silêncio é
 * aceitável aqui — o pior caso é a sessão não sobreviver ao refresh.
 */

export function getToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string) {
  try {
    localStorage.setItem(STORAGE_KEY, token)
  } catch {
    // storage indisponível — segue apenas com a sessão em memória
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // idem
  }
}
