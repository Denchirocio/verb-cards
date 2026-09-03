import { Navigate, useParams } from 'react-router'
import { ALL_VERBS } from '../data/deck'
import { VERB_TABS } from '../data/verbsData'
import { conjugate, FORM_GROUPS, FORM_LABELS, FORM_TAG } from '../utils/verbConjugation'
import { capitalize } from '../utils/text'
import BackButton from '../components/BackButton'
import SpeakButton from '../components/SpeakButton'

export default function VerbDetail() {
  const { kanji } = useParams<{ kanji: string }>()
  const verb = ALL_VERBS.find((v) => v.kanji === kanji)

  if (!verb) return <Navigate to="/lista" replace />

  const grupoLabel = VERB_TABS.find((t) => t.id === verb.tab)?.label ?? ''

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
      <div className="flex items-center gap-2">
        <BackButton />
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink">Todas las formas</h1>
      </div>

      <div className="mt-4 rounded-2xl border border-card-border bg-surface p-5 text-center">
        <span className="inline-block rounded-full border border-card-border px-2.5 py-1 text-xs font-medium text-ink-soft">
          {grupoLabel}
        </span>
        <div className="mt-2 font-serif text-4xl font-semibold text-ink">{verb.kanji}</div>
        <div className="mt-1 text-lg text-ink-soft">{verb.hiragana}</div>
        <div className="mt-1 flex items-center justify-center gap-2 text-sm italic text-ink-soft">
          {verb.romaji.toUpperCase()}
          <SpeakButton text={verb.hiragana} size={16} className="h-6 w-6" />
        </div>
        <div className="mt-2 text-base text-ink-soft">{capitalize(verb.meaning)}</div>
      </div>

      <div className="mt-6 flex flex-col gap-5">
        {FORM_GROUPS.map((group) => (
          <div key={group.id}>
            <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${group.colorClass}`}>
              {group.title}
            </span>
            <div className="mt-2 divide-y divide-card-border overflow-hidden rounded-2xl border border-card-border bg-surface">
              {group.forms.map((form) => {
                const c = conjugate(verb, verb.tab, form)
                return (
                  <div key={form} className="flex items-center justify-between gap-3 px-4 py-3">
                    <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${FORM_TAG[form].className}`}>
                      {FORM_LABELS[form].jp}
                    </span>
                    <div className="text-right">
                      <div className="font-serif text-lg font-semibold text-ink">
                        {c.kanjiStem}
                        <span className="text-accent">{c.kanjiEnding}</span>
                      </div>
                      <div className="text-xs text-ink-soft">
                        {c.hiraganaStem}
                        <span className="text-accent">{c.hiraganaEnding}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
