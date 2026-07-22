import { useState } from 'react'
import type { FormEvent } from 'react'
import { FormField } from '@/components/molecules/FormField'
import { RememberForgot } from '@/components/molecules/RememberForgot'
import { SocialLoginGroup } from '@/components/molecules/SocialLoginGroup'
import { SignupPrompt } from '@/components/molecules/SignupPrompt'
import { Alert } from '@/components/atoms/Alert'
import { Button } from '@/components/atoms/Button'
import { validateEmail, validateRequiredPassword } from '@/lib/validation'

export interface LoginFormValues {
  email: string
  password: string
  remember: boolean
}

interface LoginFormProps {
  onSubmit?: (values: LoginFormValues) => void | Promise<void>
  /** Desabilita o envio enquanto a chamada à API está em andamento. */
  isSubmitting?: boolean
  /** Erro de nível formulário vindo da API (ex.: credenciais inválidas). */
  errorMessage?: string
}

interface FieldErrors {
  email?: string
  password?: string
}

export function LoginForm({ onSubmit, isSubmitting, errorMessage }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const fieldErrors: FieldErrors = {
      email: validateEmail(email),
      password: validateRequiredPassword(password),
    }
    setErrors(fieldErrors)

    if (fieldErrors.email || fieldErrors.password) return

    void onSubmit?.({ email: email.trim(), password, remember })
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold text-content">Login</h1>
        <p className="text-xl text-content-muted">Boas-vindas! Faça seu login.</p>
      </header>

      {errorMessage ? <Alert>{errorMessage}</Alert> : null}

      {/* noValidate: a validação é nossa, em português e com aria-invalid. */}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <FormField
          id="email"
          label="Email"
          type="email"
          placeholder="Digite seu email"
          autoComplete="email"
          value={email}
          error={errors.email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <FormField
          id="password"
          label="Senha"
          type="password"
          placeholder="••••••"
          autoComplete="current-password"
          value={password}
          error={errors.password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <RememberForgot checked={remember} onCheckedChange={setRemember} />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Entrando…' : 'Login →'}
        </Button>
      </form>

      <SocialLoginGroup />
      <SignupPrompt
        message="Ainda não tem conta?"
        linkText="Crie seu cadastro!"
        to="/register"
      />
    </div>
  )
}
