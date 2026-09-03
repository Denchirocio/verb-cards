import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { VERB_TABS, type VerbTab } from '../data/verbsData'
import { ALL_VERBS } from '../data/deck'
import { Search } from 'lucide-react'
import BackButton from '../components/BackButton'
import SpeakButton from '../components/SpeakButton'
import { capitalize } from '../utils/text'

type FilterTab = VerbTab | 'todos' | 'excepciones'

export default function VerbList() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<FilterTab>('todos')

  const exceptionCount = useMemo(() => ALL_VERBS.filter((v) => v.exception).length, [])

  const verbs = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ALL_VERBS.filter((v) => {
      if (tab === 'excepciones' && !v.exception) return false
      if (tab !== 'todos' && tab !== 'excepciones' && v.tab !== tab) return false
      if (!q) return true
      return (
        v.kanji.includes(q) ||
        v.hiragana.includes(q) ||
        v.romaji.toLowerCase().includes(q) ||
        v.meaning.toLowerCase().includes(q)
      )
    })
  }, [query, tab])

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
      <div className="flex items-center gap-2">
        <BackButton />
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink">
          Lista de verbos
        </h1>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-full border border-card-border bg-surface px-4 py-2.5">
        <Search size={18} className="text-ink-soft" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por kanji, romaji o significado..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink-soft"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setTab('todos')}
          className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
            tab === 'todos'
              ? 'border-accent bg-accent-soft text-accent'
              : 'border-card-border bg-surface text-ink-soft'
          }`}
        >
          Todos ({ALL_VERBS.length})
        </button>
        {VERB_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
              tab === t.id
                ? 'border-accent bg-accent-soft text-accent'
                : 'border-card-border bg-surface text-ink-soft'
            }`}
          >
            {t.label}
          </button>
        ))}
        <button
          onClick={() => setTab('excepciones')}
          className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
            tab === 'excepciones'
              ? 'border-rose-500 bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
              : 'border-card-border bg-surface text-ink-soft'
          }`}
        >
          Excepciones ({exceptionCount})
        </button>
      </div>

      <ul className="mt-5 divide-y divide-card-border overflow-hidden rounded-2xl border border-card-border bg-surface">
        {verbs.map((v) => (
          <li
            key={`${v.tab}-${v.kanji}`}
            onClick={() => navigate(`/verbo/${encodeURIComponent(v.kanji)}`)}
            className="flex cursor-pointer items-center justify-between gap-4 px-4 py-4 transition hover:bg-cream-2"
          >
            <div className="flex items-center gap-4">
              <SpeakButton text={v.hiragana} size={19} className="h-8 w-8" />
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-2xl font-semibold text-ink">{v.kanji}</span>
                  <span className="text-base text-ink-soft">{v.hiragana}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-ink-soft">{v.romaji}</span>
                  {v.exception && (
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                      Excepción
                    </span>
                  )}
                </div>
              </div>
            </div>
            <span className="text-right text-base text-ink-soft">{capitalize(v.meaning)}</span>
          </li>
        ))}
        {verbs.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-ink-soft">Sin resultados.</li>
        )}
      </ul>
    </div>
  )
}
