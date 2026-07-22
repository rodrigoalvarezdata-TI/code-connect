import type { ComponentType, SVGProps } from 'react'
import { Link, NavLink, useNavigate } from 'react-router'
import { BrandMark } from '@/components/atoms/BrandMark'
import {
  FeedIcon,
  LoginIcon,
  LogoutIcon,
  PlusIcon,
} from '@/components/atoms/icons'
import { useAuth } from '@/context/auth-context'

type IconType = ComponentType<SVGProps<SVGSVGElement>>

interface SessionAction {
  label: string
  icon: IconType
  /** Rota (visitante → Entrar) ou ação (logado → Sair). Um dos dois. */
  to?: string
  onClick?: () => void
}

/**
 * Modelo compartilhado pelo menu (desktop e mobile). Centraliza a regra do link
 * de sessão: **Entrar** quando visitante, **Sair** quando logado — o requisito
 * explícito do menu lateral.
 */
function useNavModel() {
  const { isAuthenticated, signOut } = useAuth()
  const navigate = useNavigate()

  const publishTo = isAuthenticated ? '/posts/new' : '/login'

  const session: SessionAction = isAuthenticated
    ? {
        label: 'Sair',
        icon: LogoutIcon,
        onClick: () => {
          signOut()
          void navigate('/')
        },
      }
    : { label: 'Entrar', icon: LoginIcon, to: '/login' }

  return { publishTo, session }
}

const itemClass =
  'flex flex-col items-center gap-1 rounded-md px-4 py-2 text-content-muted transition-colors hover:text-content focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500'
const activeItemClass = 'text-content'

function SessionLink({ session }: { session: SessionAction }) {
  const Icon = session.icon
  if (session.to) {
    return (
      <Link to={session.to} className={itemClass}>
        <Icon className="text-3xl" />
        <span className="text-sm">{session.label}</span>
      </Link>
    )
  }
  return (
    <button type="button" onClick={session.onClick} className={itemClass}>
      <Icon className="text-3xl" />
      <span className="text-sm">{session.label}</span>
    </button>
  )
}

/** Menu lateral (desktop). Escondido abaixo de `md` — lá entra o `MobileNav`. */
export function Sidebar() {
  const { publishTo, session } = useNavModel()

  return (
    <nav
      aria-label="Menu principal"
      className="hidden w-44 shrink-0 flex-col items-center gap-10 rounded-lg bg-surface-card px-4 py-10 md:flex"
    >
      <Link
        to="/"
        aria-label="code connect — página inicial"
        className="flex items-center gap-2 text-brand-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <BrandMark className="w-10" />
        <span className="text-sm font-semibold leading-tight text-content">
          code
          <br />
          connect
        </span>
      </Link>

      <div className="flex w-full flex-col items-center gap-8">
        <Link
          to={publishTo}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-brand-400 px-4 py-2.5 font-semibold text-brand-400 transition-colors hover:bg-brand-400 hover:text-brand-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <PlusIcon className="text-lg" />
          Publicar
        </Link>

        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `${itemClass} ${isActive ? activeItemClass : ''}`
          }
        >
          <FeedIcon className="text-3xl" />
          <span className="text-sm">Feed</span>
        </NavLink>

        <SessionLink session={session} />
      </div>
    </nav>
  )
}

/** Menu inferior (mobile), com os mesmos itens — some a partir de `md`. */
export function MobileNav() {
  const { publishTo, session } = useNavModel()

  return (
    <nav
      aria-label="Menu principal"
      className="sticky bottom-0 z-10 flex items-center justify-around gap-2 rounded-t-lg bg-surface-card px-2 py-3 md:hidden"
    >
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `${itemClass} ${isActive ? activeItemClass : ''}`
        }
      >
        <FeedIcon className="text-2xl" />
        <span className="text-xs">Feed</span>
      </NavLink>
      <Link to={publishTo} className={itemClass}>
        <PlusIcon className="text-2xl" />
        <span className="text-xs">Publicar</span>
      </Link>
      <SessionLink session={session} />
    </nav>
  )
}
