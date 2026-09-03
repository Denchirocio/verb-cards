let voices: SpeechSynthesisVoice[] = []

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const loadVoices = () => {
    voices = window.speechSynthesis.getVoices()
  }
  loadVoices()
  window.speechSynthesis.onvoiceschanged = loadVoices
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function speakJapanese(text: string) {
  if (!isSpeechSupported() || !text) return
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'ja-JP'
  utterance.rate = 0.85

  const jaVoice = voices.find((v) => v.lang === 'ja-JP') ?? voices.find((v) => v.lang.startsWith('ja'))
  if (jaVoice) utterance.voice = jaVoice

  window.speechSynthesis.speak(utterance)
}
