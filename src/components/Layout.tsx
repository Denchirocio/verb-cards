import { Link, Outlet, useLocation } from 'react-router'
import { List } from 'lucide-react'

export default function Layout() {
  const location = useLocation()
  const isList = location.pathname === '/lista'

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 grid grid-cols-3 items-center border-b border-card-border bg-cream/95 px-4 py-3 backdrop-blur">
        <div />
        <Link to="/" className="flex justify-center">
          <img src="/logo.png" alt="Dōshiru" className="h-6 w-auto sm:h-7" />
        </Link>
        <div className="flex justify-end">
          {!isList && (
            <Link
              to="/lista"
              className="flex items-center gap-1.5 rounded-full border border-card-border bg-white px-3 py-1.5 text-sm font-medium text-ink-soft transition hover:border-accent hover:text-accent"
            >
              <List size={16} />
              Lista
            </Link>
          )}
        </div>
      </header>
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  )
}
