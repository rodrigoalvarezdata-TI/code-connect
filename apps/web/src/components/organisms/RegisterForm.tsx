import { useState } from 'react'
import type { FormEvent } from 'react'
import { FormField } from '@/components/molecules/FormField'
import { SocialLoginGroup } from '@/components/molecules/SocialLoginGroup'
import { SignupPrompt } from '@/components/molecules/SignupPrompt'
import { Alert } from '@/components/atoms/Alert'
import { Checkbox } from '@/components/atoms/Checkbox'
import { Button } from '@/components/atoms/Button'
import { validateEmail, validateName, validateNewPassword } from '@/lib/validation'

export interface RegisterFormValues {
  name: string
  email: string
  password: string
  remember: boolean
}

interface RegisterFormProps {
  onSubmit?: (values: RegisterFormValues) => void | Promise<void>
  /** Desabilita o envio enquanto a chamada à API está em andamento. */
  isSubmitting?: boolean
  /** Erro de nível formulário vindo da API (ex.: e-mail já cadastrado). */
  errorMessage?: string
}

interface FieldErrors {
  name?: string
  email?: string
  password?: string
}

export function RegisterForm({
  onSubmit,
  isSubmitting,
  errorMessage,
}: RegisterFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const fieldErrors: FieldErrors = {
      name: validateName(name),
      email: validateEmail(email),
      password: validateNewPassword(password),
    }
    setErrors(fieldErrors)

    if (fieldErrors.name || fieldErrors.email || fieldErrors.password) return

    void onSubmit?.({
      name: name.trim(),
      email: email.trim(),
      password,
      remember,
    })
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold text-content">Cadastro</h1>
        <p className="text-xl text-content-muted">Olá! Preencha seus dados.</p>
      </header>

      {errorMessage ? <Alert>{errorMessage}</Alert> : null}

      {/* noValidate: a validação é nossa, em português e com aria-invalid. */}
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <FormField
          id="name"
          label="Nome"
          type="text"
          placeholder="Nome completo"
          autoComplete="name"
          value={name}
          error={errors.name}
          onChange={(event) => setName(event.target.value)}
        />
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
          autoComplete="new-password"
          value={password}
          error={errors.password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Checkbox
          label="Lembrar-me"
          checked={remember}
          onChange={(event) => setRemember(event.target.checked)}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Cadastrando…' : 'Cadastrar →'}
        </Button>
      </form>

      <SocialLoginGroup />
      <SignupPrompt
        message="Já tem conta?"
        linkText="Faça seu login!"
        to="/login"
      />
    </div>
  )
}
