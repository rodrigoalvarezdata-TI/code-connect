import { useState } from 'react'
import type { FormEvent } from 'react'
import { FormField } from '@/components/molecules/FormField'
import { RememberForgot } from '@/components/molecules/RememberForgot'
import { SocialLoginGroup } from '@/components/molecules/SocialLoginGroup'
import { SignupPrompt } from '@/components/molecules/SignupPrompt'
import { Button } from '@/components/atoms/Button'

export interface LoginFormValues {
  identifier: string
  password: string
  remember: boolean
}

interface LoginFormProps {
  onSubmit?: (values: LoginFormValues) => void
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit?.({ identifier, password, remember })
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-content">Login</h1>
        <p className="text-sm text-content-muted">Boas-vindas! Faça seu login.</p>
      </header>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <FormField
          id="identifier"
          label="Email ou usuário"
          type="text"
          placeholder="usuario123"
          autoComplete="username"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
        />
        <FormField
          id="password"
          label="Senha"
          type="password"
          placeholder="••••••"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <RememberForgot checked={remember} onCheckedChange={setRemember} />
        <Button type="submit">Login →</Button>
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
