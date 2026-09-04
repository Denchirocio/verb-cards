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
      className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
        known
          ? 'border-emerald-500 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
          : 'border-ink bg-ink text-cream hover:opacity-90'
      }`}
    >
      <Check size={16} />
      {known ? 'Ya lo sé' : 'Marcar como sabido'}
    </button>
  )
}
