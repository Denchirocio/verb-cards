import { Volume2 } from 'lucide-react'
import { speakJapanese } from '../utils/speech'

export default function SpeakButton({ text, size = 18, className = '' }: { text: string; size?: number; className?: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        speakJapanese(text)
      }}
      className={`flex shrink-0 items-center justify-center rounded-full text-ink-soft transition hover:bg-cream-2 hover:text-accent ${className}`}
      aria-label={`Escuchar ${text}`}
    >
      <Volume2 size={size} />
    </button>
  )
}
