import { Link } from 'react-router'
import { List } from 'lucide-react'

export default function ListaLink() {
  return (
    <Link
      to="/lista"
      className="flex shrink-0 items-center gap-1.5 rounded-full border border-card-border bg-surface px-3 py-1.5 text-sm font-medium text-ink-soft transition hover:border-accent hover:text-accent"
    >
      <List size={16} />
      Lista
    </Link>
  )
}
