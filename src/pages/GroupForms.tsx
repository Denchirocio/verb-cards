import { Navigate, useNavigate, useParams } from 'react-router'
import { FORM_GROUPS, FORM_LABELS, FORM_TAG } from '../utils/verbConjugation'
import BackButton from '../components/BackButton'

export default function GroupForms() {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const group = FORM_GROUPS.find((g) => g.id === groupId)

  if (!group) return <Navigate to="/" replace />

  function pickRandom() {
    const form = group!.forms[Math.floor(Math.random() * group!.forms.length)]
    navigate(`/practicar/${form}`)
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8">
      <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${group.colorClass}`}>
        {group.title}
      </span>
      <div className="mt-3 flex items-center gap-2">
        <BackButton />
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink">Elegí una forma</h1>
      </div>
      <p className="mt-2 text-ink-soft">{group.description}</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {group.forms.map((form) => (
          <button
            key={form}
            onClick={() => navigate(`/practicar/${form}`)}
            className="group flex flex-col gap-1 rounded-2xl border border-card-border bg-white px-4 py-4 text-left transition hover:border-accent hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${FORM_TAG[form].className}`}>
                {FORM_TAG[form].label}
              </span>
              <span className="h-2 w-2 rounded-full bg-ink-soft/25" />
            </div>
            <span className="font-serif text-xl font-semibold text-ink group-hover:text-accent">
              {FORM_LABELS[form].jp}
            </span>
            <span className="text-sm text-ink-soft">{FORM_LABELS[form].title}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between text-xs text-ink-soft">
        <span>{group.forms.length === 1 ? '1 forma disponible' : `${group.forms.length} formas disponibles`}</span>
        <span>Tocá una para practicar</span>
      </div>

      {group.forms.length > 1 && (
        <button
          onClick={pickRandom}
          className="mt-6 self-center text-sm text-ink-soft transition hover:text-accent"
        >
          🎲 ¿Indeciso? Elegir una forma al azar
        </button>
      )}
    </div>
  )
}
