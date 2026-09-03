import { useEffect, useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router'
import { ChevronLeft, ChevronRight, Shuffle } from 'lucide-react'
import { ALL_VERBS } from '../data/deck'
import { conjugate, FORM_LABELS, getRule, type VerbForm } from '../utils/verbConjugation'
import { shuffle } from '../utils/shuffle'

const VALID_FORMS = new Set(Object.keys(FORM_LABELS))

export default function Practice() {
  const { form } = useParams<{ form: string }>()
  const [deck, setDeck] = useState(() => shuffle(ALL_VERBS))
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    setFlipped(false)
  }, [index])

  if (!form || !VALID_FORMS.has(form)) {
    return <Navigate to="/" replace />
  }
  const verbForm = form as VerbForm
  const label = FORM_LABELS[verbForm]

  const verb = deck[index]
  const conjugated = useMemo(() => conjugate(verb, verb.tab, verbForm), [verb, verbForm])
  const rule = useMemo(() => getRule(verb, verb.tab, verbForm), [verb, verbForm])

  function go(delta: number) {
    setIndex((i) => (i + delta + deck.length) % deck.length)
  }

  function reshuffle() {
    setDeck(shuffle(ALL_VERBS))
    setIndex(0)
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-4 py-6">
      <div className="flex w-full items-center justify-between">
        <span className="font-serif text-xl font-semibold text-ink">{label.title}</span>
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
          className="relative aspect-4/5 w-full max-w-sm cursor-pointer overflow-hidden rounded-3xl border border-card-border bg-white p-6 text-left shadow-sm transition hover:shadow-md"
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
            <div className="flex h-full flex-col items-center justify-center gap-3 pb-8 text-center">
              <span className="font-serif text-5xl font-semibold text-ink">{verb.kanji}</span>
              <span className="text-lg text-ink-soft">{verb.hiragana}</span>
              <span className="text-sm italic text-ink-soft">{verb.romaji}</span>
              <span className="mt-2 text-base text-ink-soft">{verb.meaning}</span>
              <span className="mt-6 text-xs uppercase tracking-wide text-ink-soft/70">
                Tocá la card para ver la respuesta
              </span>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 pb-8 text-center">
              <span className="font-serif text-4xl font-semibold text-ink">
                {conjugated.kanjiStem}
                <span className="text-accent">{conjugated.kanjiEnding}</span>
              </span>
              <span className="text-lg text-ink-soft">
                {conjugated.hiraganaStem}
                <span className="text-accent">{conjugated.hiraganaEnding}</span>
              </span>
              {rule && (
                <span className="mt-3 rounded-lg border border-accent px-3 py-1.5 font-mono text-sm font-semibold text-accent">
                  {rule}
                </span>
              )}
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
