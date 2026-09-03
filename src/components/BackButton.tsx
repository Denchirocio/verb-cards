import { useNavigate } from 'react-router'
import { ChevronLeft } from 'lucide-react'

export default function BackButton() {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(-1)}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-soft transition hover:bg-cream-2"
      aria-label="Volver"
    >
      <ChevronLeft size={22} />
    </button>
  )
}
