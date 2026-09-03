import { useEffect, useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router'
import { ChevronLeft, ChevronRight, Shuffle } from 'lucide-react'
import { ALL_VERBS, type DeckVerb } from '../data/deck'
import { conjugate, FORM_GROUPS, FORM_LABELS, FORM_USAGE, getRule, type VerbForm } from '../utils/verbConjugation'
import { shuffle } from '../utils/shuffle'

const VALID_FORMS = new Set(Object.keys(FORM_LABELS))

interface Pair {
  verb: DeckVerb
  form: VerbForm
}

function buildDeck(allowedForms: VerbForm[]): Pair[] {
  return shuffle(ALL_VERBS).map((verb) => ({
    verb,
    form: allowedForms[Math.floor(Math.random() * allowedForms.length)],
  }))
}

export default function Practice() {
  const { form, groupId } = useParams<{ form?: string; groupId?: string }>()

  const group = groupId ? FORM_GROUPS.find((g) => g.id === groupId) : undefined
  const isGroupMode = Boolean(groupId)
  const singleFormValid = !isGroupMode && form && VALID_FORMS.has(form)

  const allowedForms = useMemo<VerbForm[]>(() => {
    if (group) return group.forms
    if (singleFormValid) return [form as VerbForm]
    return []
  }, [group, singleFormValid, form])

  const [deck, setDeck] = useState<Pair[]>(() => buildDeck(allowedForms))
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    setFlipped(false)
  }, [index])

  if (isGroupMode && !group) return <Navigate to="/" replace />
  if (!isGroupMode && !singleFormValid) return <Navigate to="/" replace />

  const pair = deck[index]
  const label = FORM_LABELS[pair.form]
  const conjugated = conjugate(pair.verb, pair.verb.tab, pair.form)
  const rule = getRule(pair.verb, pair.verb.tab, pair.form)

  const topTitle = group ? `Práctica: ${group.title}` : label.title

  function go(delta: number) {
    setIndex((i) => (i + delta + deck.length) % deck.length)
  }

  function reshuffle() {
    setDeck(buildDeck(allowedForms))
    setIndex(0)
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center px-4 py-6">
      <div className="flex w-full max-w-xl items-center justify-between">
        <span className="font-serif text-xl font-semibold text-ink">{topTitle}</span>
        <button
          onClick={reshuffle}
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition hover:bg-cream-2"
          aria-label="Barajar de nuevo"
        >
          <Shuffle size={18} />
        </button>
      </div>

      <div className="mt-6 flex w-full flex-1 items-center gap-3">
        <button
          onClick={() => go(-1)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-card-border bg-white text-ink-soft transition hover:border-accent hover:text-accent"
          aria-label="Anterior"
        >
          <ChevronLeft size={22} />
        </button>

        <button
          onClick={() => setFlipped((f) => !f)}
          className="relative w-full max-w-xl cursor-pointer rounded-3xl border border-card-border bg-white p-6 text-left shadow-sm transition hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-accent">
              {label.jp}
            </span>
            <span className="text-xs font-medium text-ink-soft">
              {index + 1} / {deck.length}
            </span>
          </div>

          {!flipped ? (
            <div className="flex min-h-52 flex-col items-center justify-center gap-1.5 py-6 text-center">
              <span className="font-serif text-3xl font-semibold break-words text-ink sm:text-4xl">
                {pair.verb.kanji}
              </span>
              <span className="text-lg text-ink-soft">{pair.verb.hiragana}</span>
              <span className="text-sm italic text-ink-soft">{pair.verb.romaji}</span>
              <span className="text-base text-ink-soft">{pair.verb.meaning}</span>
              <span className="mt-3 text-xs uppercase tracking-wide text-ink-soft/70">
                Tocá la card para ver la respuesta
              </span>
            </div>
          ) : (
            <div className="flex min-h-52 flex-col items-center justify-center gap-1.5 py-6 text-center">
              <span className="font-serif text-3xl font-semibold break-words text-ink sm:text-4xl">
                {conjugated.kanjiStem}
                <span className="text-accent">{conjugated.kanjiEnding}</span>
              </span>
              <span className="text-lg break-words text-ink-soft">
                {conjugated.hiraganaStem}
                <span className="text-accent">{conjugated.hiraganaEnding}</span>
              </span>
              <span className="text-sm text-ink-soft">{pair.verb.meaning}</span>
              {rule && (
                <span className="mt-1 rounded-lg border border-accent px-3 py-1.5 font-mono text-sm font-semibold text-accent">
                  {rule}
                </span>
              )}
              <p className="mt-1 max-w-sm text-xs leading-snug text-ink-soft/80">{FORM_USAGE[pair.form]}</p>
            </div>
          )}
        </button>

        <button
          onClick={() => go(1)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-card-border bg-white text-ink-soft transition hover:border-accent hover:text-accent"
          aria-label="Siguiente"
        >
          <ChevronRight size={22} />
        </button>
      </div>
    </div>
  )
}
