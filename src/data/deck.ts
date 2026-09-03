import { GRUPO1, GRUPO2, IRREGULARES, type Verb, type VerbTab } from './verbsData'

export interface DeckVerb extends Verb {
  tab: VerbTab
}

export const ALL_VERBS: DeckVerb[] = [
  ...GRUPO1.map((v): DeckVerb => ({ ...v, tab: 'grupo1' })),
  ...GRUPO2.map((v): DeckVerb => ({ ...v, tab: 'grupo2' })),
  ...IRREGULARES.map((v): DeckVerb => ({ ...v, tab: 'irregulares' })),
]
