import { useNavigate } from 'react-router'
import { Button } from '@/components/atoms/Button'
import { useAuth } from '@/context/auth-context'

/**
 * Área logada mínima. Existe para provar a integração ponta a ponta: o nome
 * exibido vem do usuário resolvido via GET /users/me, o que só funciona se o
 * interceptor estiver anexando o Bearer token corretamente.
 */
export function DashboardPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  function handleSignOut() {
    signOut()
    void navigate('/login', { replace: true })
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-surface-page px-4 py-10">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-surface-card p-8">
        <h1 className="text-3xl font-semibold text-content">
          Olá, {user?.name}!
        </h1>
        <p className="text-sm text-content-muted">
          Você está autenticado como {user?.email}.
        </p>
        <Button type="button" onClick={handleSignOut}>
          Sair
        </Button>
      </div>
    </main>
  )
}
