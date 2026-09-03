const STORAGE_KEY = 'doshiru-known-verbs'

function readKnown(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

function writeKnown(set: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]))
  } catch {
    // localStorage puede fallar (modo privado, cuota llena) — el progreso
    // simplemente no persiste esa vez, no es motivo para romper la app.
  }
}

export function getKnownSet(): Set<string> {
  return readKnown()
}

export function isKnown(kanji: string): boolean {
  return readKnown().has(kanji)
}

export function toggleKnown(kanji: string): boolean {
  const set = readKnown()
  const next = !set.has(kanji)
  if (next) set.add(kanji)
  else set.delete(kanji)
  writeKnown(set)
  return next
}
