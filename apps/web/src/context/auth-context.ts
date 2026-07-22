import { createContext, use } from 'react'
import type { AuthUser, LoginInput, RegisterInput } from '@/services/auth'

export interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  /** True enquanto o token guardado ainda está sendo validado no mount. */
  isLoading: boolean
  signIn: (input: LoginInput) => Promise<void>
  signUp: (input: RegisterInput) => Promise<void>
  signOut: () => void
}

/**
 * O contexto e o hook moram fora do `AuthContext.tsx` porque o Fast Refresh do
 * React só funciona quando um arquivo exporta apenas componentes.
 */
export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = use(AuthContext)
  if (context === null) {
    throw new Error('useAuth precisa estar dentro de um AuthProvider')
  }
  return context
}
