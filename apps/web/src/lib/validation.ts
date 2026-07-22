/**
 * Validação client-side dos formulários de autenticação.
 *
 * Espelha as regras dos DTOs de apps/api (`RegisterUserDto`, `LoginDto`) para
 * evitar 400 previsíveis — e porque as mensagens do class-validator vêm em
 * inglês e não servem para exibir ao usuário.
 */

/** Mesmos limites de `apps/api/src/users/users.constants.ts`. */
export const MIN_PASSWORD_LENGTH = 8
export const MAX_PASSWORD_LENGTH = 72
export const MIN_NAME_LENGTH = 2
export const MAX_NAME_LENGTH = 120

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(email: string): string | undefined {
  const value = email.trim()
  if (!value) return 'Informe seu e-mail.'
  if (!EMAIL_PATTERN.test(value)) return 'Informe um e-mail válido.'
  return undefined
}

/** Login não checa tamanho: a senha já existe, só não pode estar vazia. */
export function validateRequiredPassword(password: string): string | undefined {
  if (!password) return 'Informe sua senha.'
  return undefined
}

export function validateNewPassword(password: string): string | undefined {
  if (!password) return 'Informe sua senha.'
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `A senha precisa ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return `A senha pode ter no máximo ${MAX_PASSWORD_LENGTH} caracteres.`
  }
  return undefined
}

export function validateName(name: string): string | undefined {
  const value = name.trim()
  if (!value) return 'Informe seu nome.'
  if (value.length < MIN_NAME_LENGTH) {
    return `O nome precisa ter ao menos ${MIN_NAME_LENGTH} caracteres.`
  }
  if (value.length > MAX_NAME_LENGTH) {
    return `O nome pode ter no máximo ${MAX_NAME_LENGTH} caracteres.`
  }
  return undefined
}
