import { Link } from 'react-router'
import { FORM_GROUPS } from '../utils/verbConjugation'
import ListaLink from '../components/ListaLink'

export default function Menu() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink">
          Elegí un grupo
        </h1>
        <ListaLink />
      </div>
      <p className="mt-2 text-ink-soft">
        Practicá la conjugación con cards que podés voltear.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FORM_GROUPS.map((group) => (
          <Link
            key={group.id}
            to={`/grupo/${group.id}`}
            className="group flex flex-col gap-3 rounded-3xl border border-card-border bg-surface p-5 text-left transition hover:border-accent hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${group.colorClass}`}>
                {group.title}
              </span>
              <span className="text-xs font-medium text-ink-soft">
                {group.forms.length === 1 ? '1 forma' : `${group.forms.length} formas`}
              </span>
            </div>
            <div>
              <span className="font-serif text-4xl font-semibold text-ink group-hover:text-accent">
                {group.jp}
              </span>
              <span className="block text-sm italic tracking-wide text-ink-soft">{group.romaji.toUpperCase()}</span>
            </div>
            <span className="text-sm text-ink-soft">{group.description}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
