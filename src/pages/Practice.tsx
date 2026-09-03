import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Navigate, useParams } from 'react-router'
import { RefreshCw, Shuffle, Target } from 'lucide-react'
import { ALL_VERBS, type DeckVerb } from '../data/deck'
import { VERB_TABS } from '../data/verbsData'
import { conjugate, FORM_LABELS, FORM_TAG, FORM_USAGE, getRule, type VerbForm } from '../utils/verbConjugation'
import { shuffle } from '../utils/shuffle'
import { capitalize } from '../utils/text'
import { hiraganaToRomaji } from '../utils/hiraganaToRomaji'
import { getKnownSet, toggleKnown } from '../utils/progress'
import BackButton from '../components/BackButton'
import ListaLink from '../components/ListaLink'
import SpeakButton from '../components/SpeakButton'
import KnownToggle from '../components/KnownToggle'

const VALID_FORMS = new Set(Object.keys(FORM_LABELS))
const GRUPO_NUM: Record<string, string> = { grupo1: 'I', grupo2: 'II', irregulares: 'III' }
const SWIPE_THRESHOLD = 70

// Los verbos ya marcados como sabidos no desaparecen del mazo normal —
// solo se les baja la prioridad (key elevada a una potencia < 1 los
// empuja hacia el final del orden) para que aparezcan con menos frecuencia
// sin dejar de repasarse nunca del todo.
function weightedShuffle(verbs: DeckVerb[], known: Set<string>): DeckVerb[] {
  return verbs
    .map((v) => ({ v, key: Math.random() ** (known.has(v.kanji) ? 0.35 : 1) }))
    .sort((a, b) => a.key - b.key)
    .map((x) => x.v)
}

function buildDeck(focusMode: boolean, known: Set<string>): DeckVerb[] {
  if (focusMode) {
    return shuffle(ALL_VERBS.filter((v) => !known.has(v.kanji)))
  }
  return weightedShuffle(ALL_VERBS, known)
}

export default function Practice() {
  const { form } = useParams<{ form: string }>()
  const [knownSet, setKnownSet] = useState(() => getKnownSet())
  const [focusMode, setFocusMode] = useState(false)
  const [deck, setDeck] = useState(() => buildDeck(false, getKnownSet()))
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

  const verb: DeckVerb | undefined = deck[index]
  const conjugated = verb ? conjugate(verb, verb.tab, verbForm) : null
  const rule = verb ? getRule(verb, verb.tab, verbForm) : ''
  const grupoLabel = verb ? (VERB_TABS.find((t) => t.id === verb.tab)?.label ?? '') : ''
  const conjugatedRomaji = conjugated
    ? hiraganaToRomaji(`${conjugated.hiraganaStem}${conjugated.hiraganaEnding}`).toUpperCase()
    : ''
  const known = verb ? knownSet.has(verb.kanji) : false

  const peekIndex = deck.length ? (dragX < 0 ? (index + 1) % deck.length : (index - 1 + deck.length) % deck.length) : 0
  const peekVerb = deck.length ? deck[peekIndex] : null

  function go(delta: number) {
    if (!deck.length) return
    setIndex((i) => (i + delta + deck.length) % deck.length)
  }

  function reshuffle() {
    setDeck(buildDeck(focusMode, knownSet))
    setIndex(0)
  }

  function toggleFocusMode() {
    const next = !focusMode
    setFocusMode(next)
    setDeck(buildDeck(next, knownSet))
    setIndex(0)
  }

  function handleToggleKnown() {
    if (!verb) return
    const nowKnown = toggleKnown(verb.kanji)
    const nextKnown = new Set(knownSet)
    if (nowKnown) nextKnown.add(verb.kanji)
    else nextKnown.delete(verb.kanji)
    setKnownSet(nextKnown)

    if (focusMode) {
      setDeck(buildDeck(true, nextKnown))
      setIndex(0)
    }
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
              {focusMode ? 'Solo difíciles · ' : ''}
              {deck.length ? `${index + 1} / ${deck.length}` : '0 / 0'}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={toggleFocusMode}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
              focusMode ? 'bg-accent-soft text-accent' : 'text-ink-soft hover:bg-cream-2'
            }`}
            aria-label={focusMode ? 'Ver todos los verbos' : 'Repasar solo lo que me cuesta'}
            title={focusMode ? 'Ver todos los verbos' : 'Repasar solo lo que me cuesta'}
          >
            <Target size={18} />
          </button>
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
        {!verb || !conjugated ? (
          <div className="flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-3 rounded-3xl border border-card-border bg-surface p-6 text-center">
            <span className="text-4xl">🎉</span>
            <p className="font-serif text-xl font-semibold text-ink">¡Marcaste todos como sabidos!</p>
            <p className="text-sm text-ink-soft">Volvé al modo completo para seguir repasando de a poco.</p>
            <button
              onClick={toggleFocusMode}
              className="mt-2 rounded-full border border-accent px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent-soft"
            >
              Ver todos de nuevo
            </button>
          </div>
        ) : (
          <div className="relative w-full min-h-[480px] max-w-xl flex-1">
            <div
              aria-hidden
              className="absolute inset-0 rounded-3xl border border-card-border bg-cream-2"
              style={{ transform: 'scale(0.92) translateY(18px)' }}
            />
            {peekVerb && (
              <div
                aria-hidden
                className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-3xl border border-card-border bg-surface text-center"
                style={{ transform: 'scale(0.96) translateY(9px)' }}
              >
                <span className="font-serif text-3xl font-semibold text-ink/30 sm:text-4xl">{peekVerb.kanji}</span>
                <span className="text-sm text-ink-soft/40">{peekVerb.hiragana}</span>
              </div>
            )}

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
              className="absolute inset-0 flex cursor-grab select-none flex-col rounded-3xl border border-card-border bg-surface p-6 text-left shadow-sm active:cursor-grabbing"
            >
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-3 py-1.5 text-sm font-bold uppercase tracking-wide ${FORM_TAG[verbForm].className}`}>
                  {label.jp}
                </span>
                <span className="rounded-full border border-card-border px-3 py-1.5 text-sm font-medium text-ink-soft">
                  Grupo {GRUPO_NUM[verb.tab]} · {grupoLabel}
                </span>
              </div>

              {!flipped ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
                  <span className="text-xl text-ink-soft">{verb.hiragana}</span>
                  <span className="font-serif text-5xl font-semibold break-words text-ink sm:text-6xl">
                    {verb.kanji}
                  </span>
                  <span className="text-lg italic tracking-wide text-ink-soft">{verb.romaji.toUpperCase()}</span>
                  <SpeakButton text={verb.hiragana} size={24} className="h-11 w-11" />
                  <div className="my-1 h-px w-16 bg-card-border" />
                  <span className="text-2xl text-ink-soft">{capitalize(verb.meaning)}</span>
                  <div className="my-1 h-px w-16 bg-card-border" />
                  <span className="flex items-center gap-1.5 text-sm uppercase tracking-wide text-ink-soft">
                    <RefreshCw size={14} />
                    Tocá para voltear
                  </span>
                  <div className="mt-10">
                    <KnownToggle known={known} onToggle={handleToggleKnown} />
                  </div>
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
                  <span className="break-words text-xl text-ink-soft">
                    {conjugated.hiraganaStem}
                    <span className="text-accent">{conjugated.hiraganaEnding}</span>
                  </span>
                  <span className="font-serif text-5xl font-semibold break-words text-ink sm:text-6xl">
                    {conjugated.kanjiStem}
                    <span className="text-accent">{conjugated.kanjiEnding}</span>
                  </span>
                  <span className="text-lg italic tracking-wide text-ink-soft">{conjugatedRomaji}</span>
                  <SpeakButton
                    text={`${conjugated.hiraganaStem}${conjugated.hiraganaEnding}`}
                    size={24}
                    className="h-11 w-11"
                  />
                  <div className="my-1 h-px w-16 bg-card-border" />
                  <span className="text-2xl text-ink-soft">{capitalize(verb.meaning)}</span>
                  {rule && (
                    <span className="mt-1 rounded-lg border border-accent px-3.5 py-2 font-mono text-base font-semibold text-accent">
                      {rule}
                    </span>
                  )}
                  <div className="my-1 h-px w-16 bg-card-border" />
                  <p className="max-w-sm text-sm leading-snug text-ink-soft">{FORM_USAGE[verbForm]}</p>
                  <div className="mt-10">
                    <KnownToggle known={known} onToggle={handleToggleKnown} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
