import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { AuthProvider } from '@/context/AuthContext'

/** Renderiza um componente que depende do react-router dentro de um MemoryRouter. */
export function renderWithRouter(ui: ReactElement, { route = '/' } = {}) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>)
}

/**
 * Igual ao `renderWithRouter`, mas também provê a sessão — use para qualquer
 * componente que chame `useAuth()`, que lança fora do AuthProvider.
 */
export function renderWithProviders(ui: ReactElement, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>,
  )
}
