import { AxiosError, AxiosHeaders } from 'axios'
import { describe, expect, it } from 'vitest'
import { ApiError, NETWORK_ERROR_STATUS, toApiError } from './api-error'

/** Monta um AxiosError com resposta, como o axios entrega ao interceptor. */
function axiosErrorWithResponse(status: number, data: unknown) {
  const config = { headers: new AxiosHeaders() }
  return new AxiosError('erro', undefined, config, null, {
    status,
    statusText: '',
    data,
    headers: {},
    config,
  })
}

describe('toApiError', () => {
  it('traduz 401 para mensagem de credenciais inválidas', () => {
    const error = toApiError(
      axiosErrorWithResponse(401, { message: 'Credenciais inválidas' }),
    )
    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(401)
    expect(error.message).toBe('E-mail ou senha inválidos.')
  })

  it('repassa a mensagem do backend no 409, que já vem em português', () => {
    const error = toApiError(
      axiosErrorWithResponse(409, { message: 'E-mail já cadastrado' }),
    )
    expect(error.status).toBe(409)
    expect(error.message).toBe('E-mail já cadastrado')
  })

  it('não expõe as mensagens em inglês do class-validator no 400', () => {
    const error = toApiError(
      axiosErrorWithResponse(400, {
        message: ['email must be an email', 'password is too short'],
      }),
    )
    expect(error.status).toBe(400)
    expect(error.message).toBe('Confira os dados informados e tente de novo.')
  })

  it('traduz 500 para mensagem de erro no servidor', () => {
    const error = toApiError(axiosErrorWithResponse(500, {}))
    expect(error.message).toBe('Erro no servidor. Tente novamente mais tarde.')
  })

  it('identifica falha de rede (sem resposta)', () => {
    const error = toApiError(new AxiosError('Network Error'))
    expect(error.status).toBe(NETWORK_ERROR_STATUS)
    expect(error.message).toBe(
      'Não foi possível conectar ao servidor. Tente novamente.',
    )
  })

  it('preserva um ApiError já normalizado', () => {
    const original = new ApiError(418, 'sou um bule')
    expect(toApiError(original)).toBe(original)
  })
})
