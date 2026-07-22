import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Alert } from './Alert'

describe('Alert', () => {
  it('renderiza a mensagem com role de alerta para leitores de tela', () => {
    render(<Alert>E-mail ou senha inválidos.</Alert>)
    expect(screen.getByRole('alert')).toHaveTextContent(
      'E-mail ou senha inválidos.',
    )
  })
})
