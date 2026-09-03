import { Check } from 'lucide-react'

export default function KnownToggle({ known, onToggle }: { known: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        known
          ? 'border-emerald-500 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
          : 'border-card-border text-ink-soft hover:border-accent hover:text-accent'
      }`}
    >
      <Check size={14} />
      {known ? 'Ya lo sé' : 'Marcar como sabido'}
    </button>
  )
}
