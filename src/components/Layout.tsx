import { Link, Outlet } from 'react-router'
import ThemeToggle from './ThemeToggle'

export default function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 grid grid-cols-3 items-center border-b border-card-border bg-cream/95 px-4 py-3 backdrop-blur">
        <div />
        <Link to="/" className="flex justify-center">
          <img src="/logo.png" alt="Dōshiru" className="h-6 w-auto dark:hidden sm:h-7" />
          <img src="/logo-dark.png" alt="Dōshiru" className="hidden h-6 w-auto dark:block sm:h-7" />
        </Link>
        <div className="flex justify-end">
          <ThemeToggle />
        </div>
      </header>
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  )
}
