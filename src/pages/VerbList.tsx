import { useMemo, useState } from 'react'
import { VERB_TABS, type VerbTab } from '../data/verbsData'
import { ALL_VERBS } from '../data/deck'
import { Search } from 'lucide-react'
import BackButton from '../components/BackButton'
import SpeakButton from '../components/SpeakButton'

export default function VerbList() {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<VerbTab | 'todos'>('todos')

  const verbs = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ALL_VERBS.filter((v) => {
      if (tab !== 'todos' && v.tab !== tab) return false
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

      <div className="mt-4 flex items-center gap-2 rounded-full border border-card-border bg-white px-4 py-2.5">
        <Search size={18} className="text-ink-soft" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por kanji, romaji o significado..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink-soft/70"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setTab('todos')}
          className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
            tab === 'todos'
              ? 'border-accent bg-accent-soft text-accent'
              : 'border-card-border bg-white text-ink-soft'
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
                : 'border-card-border bg-white text-ink-soft'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ul className="mt-5 divide-y divide-card-border overflow-hidden rounded-2xl border border-card-border bg-white">
        {verbs.map((v) => (
          <li key={`${v.tab}-${v.kanji}`} className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="flex items-center gap-1">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-lg font-semibold text-ink">{v.kanji}</span>
                  <span className="text-sm text-ink-soft">{v.hiragana}</span>
                </div>
                <span className="text-xs text-ink-soft">{v.romaji}</span>
              </div>
              <SpeakButton text={v.hiragana} size={16} className="h-7 w-7" />
            </div>
            <span className="text-right text-sm text-ink-soft">{v.meaning}</span>
          </li>
        ))}
        {verbs.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-ink-soft">Sin resultados.</li>
        )}
      </ul>
    </div>
  )
}
