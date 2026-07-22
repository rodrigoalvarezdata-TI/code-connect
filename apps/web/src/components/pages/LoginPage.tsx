import { useState } from 'react'
import { useNavigate } from 'react-router'
import { AuthLayout } from '@/components/templates/AuthLayout'
import { AuthCard } from '@/components/organisms/AuthCard'
import { LoginForm } from '@/components/organisms/LoginForm'
import type { LoginFormValues } from '@/components/organisms/LoginForm'
import { useAuth } from '@/context/auth-context'
import { ApiError } from '@/lib/api-error'

/**
 * Página de login. O formulário é presentacional — é aqui que a chamada à API
 * acontece, e é daqui que sai o estado de envio/erro que ele exibe.
 */
export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>()

  async function handleSubmit({ email, password }: LoginFormValues) {
    setIsSubmitting(true)
    setErrorMessage(undefined)

    try {
      // `remember` fica de fora: o ValidationPipe da API rejeita campo extra.
      await signIn({ email, password })
      void navigate('/dashboard', { replace: true })
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : 'Algo deu errado. Tente novamente.',
      )
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <AuthCard bannerAlt="Pessoa conectada à plataforma code connect">
        <LoginForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
        />
      </AuthCard>
    </AuthLayout>
  )
}
