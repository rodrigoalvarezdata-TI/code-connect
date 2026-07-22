import { Outlet } from 'react-router'
import { MobileNav, Sidebar } from '@/components/organisms/Sidebar'

/**
 * Casca das telas logadas e do feed: menu lateral (desktop) / inferior (mobile) +
 * a área de conteúdo (`Outlet`). Vira layout route no `App.tsx`, então feed,
 * detalhe e criação compartilham o mesmo menu sem repeti-lo.
 */
export function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-surface-page text-content">
      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-4 py-6 md:py-14">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
