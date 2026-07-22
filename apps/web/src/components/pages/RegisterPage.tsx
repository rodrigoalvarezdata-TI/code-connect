import { useState } from 'react'
import { useNavigate } from 'react-router'
import { AuthLayout } from '@/components/templates/AuthLayout'
import { AuthCard } from '@/components/organisms/AuthCard'
import { RegisterForm } from '@/components/organisms/RegisterForm'
import type { RegisterFormValues } from '@/components/organisms/RegisterForm'
import { useAuth } from '@/context/auth-context'
import { ApiError } from '@/lib/api-error'

/**
 * Página de cadastro. Reutiliza o mesmo layout base do login
 * (AuthLayout + AuthCard) e renderiza o RegisterForm.
 *
 * Em caso de sucesso o usuário já cai autenticado: `signUp` cadastra e faz
 * login em seguida, porque POST /users não devolve token.
 */
export function RegisterPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>()

  async function handleSubmit({ name, email, password }: RegisterFormValues) {
    setIsSubmitting(true)
    setErrorMessage(undefined)

    try {
      // `remember` fica de fora: o ValidationPipe da API rejeita campo extra.
      await signUp({ name, email, password })
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
      <AuthCard bannerAlt="Cadastro na plataforma code connect">
        <RegisterForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
        />
      </AuthCard>
    </AuthLayout>
  )
}
