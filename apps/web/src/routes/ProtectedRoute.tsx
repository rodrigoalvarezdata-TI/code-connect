import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/context/auth-context'

/**
 * Guard de rota — fica fora de `components/` porque não é um componente de
 * atomic design, e sim parte da configuração de rotas.
 *
 * O estado de carregamento é essencial: sem ele, um refresh na página redireciona
 * para /login antes de o token guardado ser validado.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <p role="status" className="p-6 text-sm text-content-muted">
        Carregando…
      </p>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
