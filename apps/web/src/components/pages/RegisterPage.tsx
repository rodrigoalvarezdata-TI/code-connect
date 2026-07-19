import { AuthLayout } from '@/components/templates/AuthLayout'
import { AuthCard } from '@/components/organisms/AuthCard'
import { TextLink } from '@/components/atoms/TextLink'

/**
 * Placeholder da página de cadastro. Reutiliza o mesmo layout base do login
 * (AuthLayout + AuthCard); futuramente receberá um RegisterForm e outro banner.
 */
export function RegisterPage() {
  return (
    <AuthLayout>
      <AuthCard
        bannerSrc="/banner_login.jpg"
        bannerAlt="Cadastro na plataforma code connect"
      >
        <div className="flex w-full max-w-sm flex-col items-center gap-4 text-center">
          <h1 className="text-2xl font-bold text-content">Cadastro</h1>
          <p className="text-sm text-content-muted">
            Em breve você poderá criar sua conta por aqui.
          </p>
          <TextLink to="/login">Voltar para o login</TextLink>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}
