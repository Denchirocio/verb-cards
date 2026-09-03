import { Link } from 'react-router'
import { FORM_GROUPS, FORM_LABELS } from '../utils/verbConjugation'

export default function Menu() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink">
        Elegí una forma
      </h1>
      <p className="mt-2 text-ink-soft">
        Practicá la conjugación con cards que podés voltear.
      </p>

      <div className="mt-8 flex flex-col gap-8">
        {FORM_GROUPS.map((group) => (
          <section key={group.title}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-soft">
              {group.title}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {group.forms.map((form) => (
                <Link
                  key={form}
                  to={`/practicar/${form}`}
                  className="group flex flex-col gap-1 rounded-2xl border border-card-border bg-white px-4 py-4 transition hover:border-accent hover:shadow-md"
                >
                  <span className="font-serif text-xl font-semibold text-ink group-hover:text-accent">
                    {FORM_LABELS[form].jp}
                  </span>
                  <span className="text-sm text-ink-soft">{FORM_LABELS[form].title}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
