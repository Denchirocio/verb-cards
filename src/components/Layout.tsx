import { Link, Outlet } from 'react-router'

export default function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-center border-b border-card-border bg-cream/95 px-4 py-3 backdrop-blur">
        <Link to="/" className="flex items-center">
          <img src="/logo.png" alt="Dōshiru" className="h-6 w-auto sm:h-7" />
        </Link>
      </header>
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  )
}
