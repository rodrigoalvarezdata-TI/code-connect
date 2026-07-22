import axios from 'axios'

/** Formato de erro do Nest: `message` é array no 400 e string no 401/409. */
interface NestErrorBody {
  statusCode?: number
  message?: string | string[]
  error?: string
}

/** Status sintético para falhas que nunca chegaram ao servidor. */
export const NETWORK_ERROR_STATUS = 0

/**
 * Erro normalizado da API: `message` já vem em português e pronta para exibir.
 *
 * As mensagens de validação do class-validator (400) vêm em inglês e citam
 * nomes de campo do DTO, então nunca são repassadas ao usuário — a validação
 * client-side dos formulários cobre esses casos antes do request sair.
 */
export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (!axios.isAxiosError(error)) {
    return new ApiError(
      NETWORK_ERROR_STATUS,
      'Algo deu errado. Tente novamente.',
    )
  }

  if (!error.response) {
    return new ApiError(
      NETWORK_ERROR_STATUS,
      'Não foi possível conectar ao servidor. Tente novamente.',
    )
  }

  const { status, data } = error.response
  const body = (data ?? {}) as NestErrorBody
  const serverMessage = typeof body.message === 'string' ? body.message : null

  if (status === 401) {
    return new ApiError(status, 'E-mail ou senha inválidos.')
  }

  if (status === 409) {
    // O backend já responde em português neste caso ("E-mail já cadastrado").
    return new ApiError(status, serverMessage ?? 'E-mail já cadastrado.')
  }

  if (status === 400) {
    return new ApiError(status, 'Confira os dados informados e tente de novo.')
  }

  if (status >= 500) {
    return new ApiError(status, 'Erro no servidor. Tente novamente mais tarde.')
  }

  return new ApiError(status, serverMessage ?? 'Algo deu errado. Tente novamente.')
}
