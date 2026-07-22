import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { clearToken, getToken, setToken } from '@/lib/token-storage'
import * as authService from '@/services/auth'
import type { AuthUser, LoginInput, RegisterInput } from '@/services/auth'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(() => getToken() !== null)

  /**
   * O token dura 1h e não há refresh token, então um token guardado pode estar
   * expirado. Validamos com GET /users/me antes de considerar o usuário logado.
   */
  useEffect(() => {
    if (getToken() === null) return

    let active = true

    authService
      .getMe()
      .then((me) => {
        if (active) setUser(me)
      })
      .catch(() => {
        clearToken()
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const signIn = useCallback(async (input: LoginInput) => {
    const { accessToken, user: loggedUser } = await authService.login(input)
    setToken(accessToken)
    setUser(loggedUser)
  }, [])

  const signUp = useCallback(
    async ({ name, email, password }: RegisterInput) => {
      // POST /users não devolve token — autentica em seguida com as mesmas
      // credenciais para o usuário já cair logado.
      await authService.register({ name, email, password })
      await signIn({ email, password })
    },
    [signIn],
  )

  const signOut = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      signIn,
      signUp,
      signOut,
    }),
    [user, isLoading, signIn, signUp, signOut],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
