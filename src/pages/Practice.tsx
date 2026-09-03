import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Navigate, useParams } from 'react-router'
import { RefreshCw, Shuffle } from 'lucide-react'
import { ALL_VERBS } from '../data/deck'
import { VERB_TABS } from '../data/verbsData'
import { conjugate, FORM_LABELS, FORM_TAG, FORM_USAGE, getRule, type VerbForm } from '../utils/verbConjugation'
import { shuffle } from '../utils/shuffle'
import { capitalize } from '../utils/text'
import BackButton from '../components/BackButton'
import ListaLink from '../components/ListaLink'
import SpeakButton from '../components/SpeakButton'

const VALID_FORMS = new Set(Object.keys(FORM_LABELS))
const GRUPO_NUM: Record<string, string> = { grupo1: 'I', grupo2: 'II', irregulares: 'III' }
const SWIPE_THRESHOLD = 70

export default function Practice() {
  const { form } = useParams<{ form: string }>()
  const [deck, setDeck] = useState(() => shuffle(ALL_VERBS))
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [exiting, setExiting] = useState<'left' | 'right' | null>(null)
  const [suppressTransition, setSuppressTransition] = useState(false)
  const startRef = useRef<{ x: number; y: number } | null>(null)
  const suppressClickRef = useRef(false)

  useEffect(() => {
    setFlipped(false)
  }, [index])

  // After snapping the position back to 0 for the new card, re-enable the
  // transition on the next paint — otherwise that reset itself animates,
  // which looks like the card boomerangs back after it just left the screen.
  useEffect(() => {
    if (!suppressTransition) return
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setSuppressTransition(false))
    })
    return () => cancelAnimationFrame(id)
  }, [suppressTransition])

  if (!form || !VALID_FORMS.has(form)) {
    return <Navigate to="/" replace />
  }
  const verbForm = form as VerbForm
  const label = FORM_LABELS[verbForm]

  const verb = deck[index]
  const conjugated = conjugate(verb, verb.tab, verbForm)
  const rule = getRule(verb, verb.tab, verbForm)
  const grupoLabel = VERB_TABS.find((t) => t.id === verb.tab)?.label ?? ''

  const peekIndex = dragX < 0 ? (index + 1) % deck.length : (index - 1 + deck.length) % deck.length
  const peekVerb = deck[peekIndex]

  function go(delta: number) {
    setIndex((i) => (i + delta + deck.length) % deck.length)
  }

  function reshuffle() {
    setDeck(shuffle(ALL_VERBS))
    setIndex(0)
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (exiting) return
    startRef.current = { x: e.clientX, y: e.clientY }
    setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging || !startRef.current) return
    setDragX(e.clientX - startRef.current.x)
  }

  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging || !startRef.current) return
    const dx = e.clientX - startRef.current.x
    const dy = e.clientY - startRef.current.y
    setDragging(false)
    startRef.current = null

    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      suppressClickRef.current = true
      const dir = dx < 0 ? 'left' : 'right'
      const exitDistance = window.innerWidth + 100
      setExiting(dir)
      setDragX(dir === 'left' ? -exitDistance : exitDistance)
      window.setTimeout(() => {
        go(dir === 'left' ? 1 : -1)
        setExiting(null)
        setSuppressTransition(true)
        setDragX(0)
      }, 220)
    } else {
      setDragX(0)
    }
  }

  function handleCardClick() {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
    setFlipped((f) => !f)
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6">
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <BackButton />
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate font-serif text-xl font-semibold text-ink">{label.title}</span>
            <span className="text-xs text-ink-soft">
              {index + 1} / {deck.length}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={reshuffle}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition hover:bg-cream-2"
            aria-label="Barajar de nuevo"
          >
            <Shuffle size={18} />
          </button>
          <ListaLink />
        </div>
      </div>

      <div className="mt-4 flex w-full flex-1 flex-col items-center">
        <div className="relative w-full min-h-[420px] max-w-xl flex-1">
          <div
            aria-hidden
            className="absolute inset-0 rounded-3xl border border-card-border bg-cream-2"
            style={{ transform: 'scale(0.92) translateY(18px)' }}
          />
          <div
            aria-hidden
            className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-3xl border border-card-border bg-white text-center"
            style={{ transform: 'scale(0.96) translateY(9px)' }}
          >
            <span className="font-serif text-3xl font-semibold text-ink/30 sm:text-4xl">{peekVerb.kanji}</span>
            <span className="text-sm text-ink-soft/40">{peekVerb.hiragana}</span>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={handleCardClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setFlipped((f) => !f)
              }
              if (e.key === 'ArrowRight') go(1)
              if (e.key === 'ArrowLeft') go(-1)
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{
              transform: `translateX(${dragX}px) rotate(${dragX / 28}deg)`,
              transition: dragging || suppressTransition ? 'none' : 'transform 220ms ease',
              touchAction: 'pan-y',
            }}
            className="absolute inset-0 flex cursor-grab select-none flex-col rounded-3xl border border-card-border bg-white p-6 text-left shadow-sm active:cursor-grabbing"
          >
            <div className="flex items-center justify-between">
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${FORM_TAG[verbForm].className}`}>
                {label.jp}
              </span>
              <span className="rounded-full border border-card-border px-2.5 py-1 text-xs font-medium text-ink-soft">
                Grupo {GRUPO_NUM[verb.tab]} · {grupoLabel}
              </span>
            </div>

            {!flipped ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                <span className="text-base text-ink-soft">{verb.hiragana}</span>
                <span className="font-serif text-4xl font-semibold break-words text-ink sm:text-5xl">
                  {verb.kanji}
                </span>
                <span className="text-sm italic tracking-wide text-ink-soft">{verb.romaji.toUpperCase()}</span>
                <SpeakButton text={verb.hiragana} size={22} className="h-10 w-10" />
                <div className="my-2 h-px w-14 bg-card-border" />
                <span className="text-lg text-ink-soft">{capitalize(verb.meaning)}</span>
                <div className="my-2 h-px w-14 bg-card-border" />
                <span className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-ink-soft">
                  <RefreshCw size={12} />
                  Tocá la card para ver la respuesta
                </span>
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                <span className="break-words text-base text-ink-soft">
                  {conjugated.hiraganaStem}
                  <span className="text-accent">{conjugated.hiraganaEnding}</span>
                </span>
                <span className="font-serif text-4xl font-semibold break-words text-ink sm:text-5xl">
                  {conjugated.kanjiStem}
                  <span className="text-accent">{conjugated.kanjiEnding}</span>
                </span>
                <SpeakButton
                  text={`${conjugated.hiraganaStem}${conjugated.hiraganaEnding}`}
                  size={22}
                  className="h-10 w-10"
                />
                <div className="my-2 h-px w-14 bg-card-border" />
                <span className="text-lg text-ink-soft">{capitalize(verb.meaning)}</span>
                {rule && (
                  <span className="mt-1 rounded-lg border border-accent px-3 py-1.5 font-mono text-sm font-semibold text-accent">
                    {rule}
                  </span>
                )}
                <div className="my-2 h-px w-14 bg-card-border" />
                <p className="max-w-sm text-xs leading-snug text-ink-soft">{FORM_USAGE[verbForm]}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
