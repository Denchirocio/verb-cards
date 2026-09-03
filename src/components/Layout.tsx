import { Link, Outlet, useLocation, useNavigate } from 'react-router'
import { ChevronLeft, List } from 'lucide-react'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'
  const isList = location.pathname === '/lista'

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-card-border bg-cream/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          {!isHome && (
            <button
              onClick={() => navigate(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition hover:bg-cream-2"
              aria-label="Volver"
            >
              <ChevronLeft size={22} />
            </button>
          )}
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="Dōshiru" className="h-6 w-auto sm:h-7" />
          </Link>
        </div>
        {!isList && (
          <Link
            to="/lista"
            className="flex items-center gap-1.5 rounded-full border border-card-border bg-white px-3 py-1.5 text-sm font-medium text-ink-soft transition hover:border-accent hover:text-accent"
          >
            <List size={16} />
            Lista
          </Link>
        )}
      </header>
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  )
}
