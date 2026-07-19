import { AuthLayout } from '@/components/templates/AuthLayout'
import { AuthCard } from '@/components/organisms/AuthCard'
import { LoginForm } from '@/components/organisms/LoginForm'

export function LoginPage() {
  return (
    <AuthLayout>
      <AuthCard
        bannerSrc="/banner_login.jpg"
        bannerAlt="Pessoa conectada à plataforma code connect"
      >
        <LoginForm />
      </AuthCard>
    </AuthLayout>
  )
}
