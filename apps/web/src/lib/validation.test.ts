import { describe, expect, it } from 'vitest'
import {
  MAX_PASSWORD_LENGTH,
  validateEmail,
  validateName,
  validateNewPassword,
  validateRequiredPassword,
} from './validation'

describe('validateEmail', () => {
  it('exige o campo preenchido', () => {
    expect(validateEmail('   ')).toBe('Informe seu e-mail.')
  })

  it('rejeita formato inválido', () => {
    expect(validateEmail('nao-e-email')).toBe('Informe um e-mail válido.')
  })

  it('aceita e-mail válido', () => {
    expect(validateEmail('ana@example.com')).toBeUndefined()
  })
})

describe('validateRequiredPassword', () => {
  it('exige o campo preenchido', () => {
    expect(validateRequiredPassword('')).toBe('Informe sua senha.')
  })

  it('não impõe tamanho mínimo no login', () => {
    expect(validateRequiredPassword('123')).toBeUndefined()
  })
})

describe('validateNewPassword', () => {
  it('exige o mínimo de 8 caracteres do RegisterUserDto', () => {
    expect(validateNewPassword('1234567')).toBe(
      'A senha precisa ter ao menos 8 caracteres.',
    )
  })

  it('rejeita acima do máximo do backend', () => {
    expect(validateNewPassword('a'.repeat(MAX_PASSWORD_LENGTH + 1))).toBe(
      'A senha pode ter no máximo 72 caracteres.',
    )
  })

  it('aceita senha dentro dos limites', () => {
    expect(validateNewPassword('S3nh4Segura!')).toBeUndefined()
  })
})

describe('validateName', () => {
  it('exige o campo preenchido', () => {
    expect(validateName('  ')).toBe('Informe seu nome.')
  })

  it('rejeita nome com menos de 2 caracteres', () => {
    expect(validateName('A')).toBe('O nome precisa ter ao menos 2 caracteres.')
  })

  it('aceita nome válido', () => {
    expect(validateName('Ana Souza')).toBeUndefined()
  })
})
