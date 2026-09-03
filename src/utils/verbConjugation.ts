import type { Verb, VerbTab } from '../data/verbsData';
import { shuffle } from './shuffle';

export type VerbForm =
  | 'diccionario' | 'nai' | 'ta' | 'nakatta'
  | 'masu' | 'masen' | 'mashita' | 'masendeshita'
  | 'te'
  | 'teimasu' | 'teimasen' | 'teimashita' | 'teimasendeshita';

export interface ConjugatedForm {
  kanjiStem: string;
  kanjiEnding: string;
  hiraganaStem: string;
  hiraganaEnding: string;
}

// Fila de conjugación Godan según la última kana del verbo (silabario う→い/あ, く→き/か, etc.)
const GODAN_ROWS: Record<string, { masuRow: string; naiRow: string; teEnding: string }> = {
  'う': { masuRow: 'い', naiRow: 'わ', teEnding: 'って' },
  'く': { masuRow: 'き', naiRow: 'か', teEnding: 'いて' },
  'ぐ': { masuRow: 'ぎ', naiRow: 'が', teEnding: 'いで' },
  'す': { masuRow: 'し', naiRow: 'さ', teEnding: 'して' },
  'つ': { masuRow: 'ち', naiRow: 'た', teEnding: 'って' },
  'ぬ': { masuRow: 'に', naiRow: 'な', teEnding: 'んで' },
  'ぶ': { masuRow: 'び', naiRow: 'ば', teEnding: 'んで' },
  'む': { masuRow: 'み', naiRow: 'ま', teEnding: 'んで' },
  'る': { masuRow: 'り', naiRow: 'ら', teEnding: 'って' },
};

const ICHIDAN_ENDINGS: Record<Exclude<VerbForm, 'diccionario'>, string> = {
  masu: 'ます', masen: 'ません', mashita: 'ました', masendeshita: 'ませんでした',
  te: 'て', ta: 'た',
  teimasu: 'ています', teimasen: 'ていません', teimashita: 'ていました', teimasendeshita: 'ていませんでした',
  nai: 'ない', nakatta: 'なかった',
};

// いく es la excepción léxica más conocida del japonés: en las formas て/た usa って/った
// en vez de seguir la fila く (que daría いいて/いいた) — no hay otra regla que la explique.
const TE_EXCEPTIONS: Record<string, string> = { 'いく': 'って' };

// て/で → た/だ es un cambio mecánico de un solo carácter: って→った, んで→んだ, etc.
function teToTa(teEnding: string): string {
  if (teEnding.endsWith('で')) return teEnding.slice(0, -1) + 'だ';
  return teEnding.slice(0, -1) + 'た';
}

const IRREGULAR_FORMS: Record<string, Record<Exclude<VerbForm, 'diccionario'>, { kanji: string; hiragana: string }>> = {
  'する': {
    masu:            { kanji: 'します',           hiragana: 'します' },
    masen:           { kanji: 'しません',          hiragana: 'しません' },
    mashita:         { kanji: 'しました',          hiragana: 'しました' },
    masendeshita:    { kanji: 'しませんでした',     hiragana: 'しませんでした' },
    te:              { kanji: 'して',             hiragana: 'して' },
    ta:              { kanji: 'した',             hiragana: 'した' },
    teimasu:         { kanji: 'しています',        hiragana: 'しています' },
    teimasen:        { kanji: 'していません',       hiragana: 'していません' },
    teimashita:      { kanji: 'していました',       hiragana: 'していました' },
    teimasendeshita: { kanji: 'していませんでした',  hiragana: 'していませんでした' },
    nai:             { kanji: 'しない',            hiragana: 'しない' },
    nakatta:         { kanji: 'しなかった',        hiragana: 'しなかった' },
  },
  'くる': {
    masu:            { kanji: '来ます',           hiragana: 'きます' },
    masen:           { kanji: '来ません',          hiragana: 'きません' },
    mashita:         { kanji: '来ました',          hiragana: 'きました' },
    masendeshita:    { kanji: '来ませんでした',     hiragana: 'きませんでした' },
    te:              { kanji: '来て',             hiragana: 'きて' },
    ta:              { kanji: '来た',             hiragana: 'きた' },
    teimasu:         { kanji: '来ています',        hiragana: 'きています' },
    teimasen:        { kanji: '来ていません',       hiragana: 'きていません' },
    teimashita:      { kanji: '来ていました',       hiragana: 'きていました' },
    teimasendeshita: { kanji: '来ていませんでした',  hiragana: 'きていませんでした' },
    nai:             { kanji: '来ない',           hiragana: 'こない' },
    nakatta:         { kanji: '来なかった',        hiragana: 'こなかった' },
  },
};

export function conjugate(verb: Verb, tab: VerbTab, form: VerbForm): ConjugatedForm {
  if (form === 'diccionario') {
    return { kanjiStem: verb.kanji, kanjiEnding: '', hiraganaStem: verb.hiragana, hiraganaEnding: '' };
  }

  if (tab === 'irregulares') {
    const f = IRREGULAR_FORMS[verb.hiragana]?.[form];
    if (f) return { kanjiStem: '', kanjiEnding: f.kanji, hiraganaStem: '', hiraganaEnding: f.hiragana };
  }

  const kanjiStem = verb.kanji.slice(0, -1);
  const hiraganaStem = verb.hiragana.slice(0, -1);

  if (tab === 'grupo2') {
    const ending = ICHIDAN_ENDINGS[form];
    return { kanjiStem, kanjiEnding: ending, hiraganaStem, hiraganaEnding: ending };
  }

  // Godan
  const lastKana = verb.hiragana.slice(-1);
  const row = GODAN_ROWS[lastKana] ?? GODAN_ROWS['る'];
  const teEnding = TE_EXCEPTIONS[verb.hiragana] ?? row.teEnding;
  let ending: string;
  switch (form) {
    case 'masu': ending = row.masuRow + 'ます'; break;
    case 'masen': ending = row.masuRow + 'ません'; break;
    case 'mashita': ending = row.masuRow + 'ました'; break;
    case 'masendeshita': ending = row.masuRow + 'ませんでした'; break;
    case 'nai': ending = row.naiRow + 'ない'; break;
    case 'nakatta': ending = row.naiRow + 'なかった'; break;
    case 'te': ending = teEnding; break;
    case 'ta': ending = teToTa(teEnding); break;
    case 'teimasu': ending = teEnding + 'います'; break;
    case 'teimasen': ending = teEnding + 'いません'; break;
    case 'teimashita': ending = teEnding + 'いました'; break;
    case 'teimasendeshita': ending = teEnding + 'いませんでした'; break;
  }
  return { kanjiStem, kanjiEnding: ending, hiraganaStem, hiraganaEnding: ending };
}

// Misma cuenta que hace `conjugate()` para Godan, pero parametrizada por una
// fila arbitraria del silabario — así se puede generar la conjugación "como si"
// el verbo perteneciera a otra fila, para armar distractores.
function endingForRow(row: { masuRow: string; naiRow: string; teEnding: string }, form: VerbForm): string {
  switch (form) {
    case 'masu': return row.masuRow + 'ます';
    case 'masen': return row.masuRow + 'ません';
    case 'mashita': return row.masuRow + 'ました';
    case 'masendeshita': return row.masuRow + 'ませんでした';
    case 'nai': return row.naiRow + 'ない';
    case 'nakatta': return row.naiRow + 'なかった';
    case 'te': return row.teEnding;
    case 'ta': return teToTa(row.teEnding);
    case 'teimasu': return row.teEnding + 'います';
    case 'teimasen': return row.teEnding + 'いません';
    case 'teimashita': return row.teEnding + 'いました';
    case 'teimasendeshita': return row.teEnding + 'いませんでした';
    default: return '';
  }
}

// Distractores plausibles del MISMO verbo (no formas de otro verbo) para el
// ejercicio "elegí la conjugación correcta" — errores reales de conjugación:
// - Godan: la misma raíz conjugada como si fuera de OTRA fila del silabario
//   (ej. のる tratado como fila く en vez de fila る → "のいて" en vez de "のって").
// - Ichidan: la confusión clásica de tratarlo como si fuera Godan terminado
//   en る (conservar el る del diccionario y agregarle una fila Godan, ej.
//   "食べります" en vez de "食べます" — el error más común de principiantes).
// Irregulares no entra acá (son solo する/来る, se resuelve aparte).
export function getConjugationDistractors(verb: Verb, tab: VerbTab, form: VerbForm, count: number): ConjugatedForm[] {
  const kanjiStem = verb.kanji.slice(0, -1);
  const hiraganaStem = verb.hiragana.slice(0, -1);

  if (tab === 'grupo1') {
    const correctKey = GODAN_ROWS[verb.hiragana.slice(-1)] ? verb.hiragana.slice(-1) : 'る';
    const correctEnding = endingForRow(GODAN_ROWS[correctKey], form);
    const seen = new Set([correctEnding]);
    const endings: string[] = [];
    for (const key of shuffle(Object.keys(GODAN_ROWS).filter(k => k !== correctKey))) {
      const ending = endingForRow(GODAN_ROWS[key], form);
      if (!seen.has(ending)) { seen.add(ending); endings.push(ending); }
      if (endings.length >= count) break;
    }
    return endings.map(ending => ({ kanjiStem, kanjiEnding: ending, hiraganaStem, hiraganaEnding: ending }));
  }

  if (tab === 'grupo2') {
    const wrongRows = shuffle(Object.keys(GODAN_ROWS)).slice(0, count);
    return wrongRows.map(key => {
      const ending = endingForRow(GODAN_ROWS[key], form);
      return { kanjiStem, kanjiEnding: ending, hiraganaStem, hiraganaEnding: ending };
    });
  }

  return [];
}

// ── Significado en español según la forma ──────────────────────────────────
// ます y て no cambian el significado glosado (la distinción es de registro/uso,
// no de sentido) — solo ています (gerundio) y ない (negación) lo alteran.

// Gerundios irregulares del español que aparecen en verbsData.ts. La mayoría son
// verbos -ir con cambio de raíz (pedir→pidiendo, dormir→durmiendo) o -er/-ar
// totalmente irregulares (ir→yendo, ser→siendo) o con inserción de "y"
// (caer→cayendo, leer→leyendo).
const GERUND_IRREGULAR: Record<string, string> = {
  caer: 'cayendo', leer: 'leyendo', creer: 'creyendo',
  decir: 'diciendo', elegir: 'eligiendo', derretir: 'derritiendo',
  dormir: 'durmiendo', morir: 'muriendo', pedir: 'pidiendo',
  poder: 'pudiendo', reír: 'riendo', sentir: 'sintiendo',
  seguir: 'siguiendo', vestir: 'vistiendo', venir: 'viniendo',
  ir: 'yendo', ser: 'siendo',
};

function regularGerund(infinitive: string): string {
  if (infinitive.endsWith('ar')) return infinitive.slice(0, -2) + 'ando';
  if (infinitive.endsWith('er') || infinitive.endsWith('ir')) return infinitive.slice(0, -2) + 'iendo';
  return infinitive;
}

// Gerundio de un verbo reflexivo: se calcula el gerundio del infinitivo sin "se"
// (para respetar irregularidades de raíz) y se reengancha el pronombre con el
// acento que corresponde ("ando"/"iendo" → "ándose"/"iéndose").
function attachReflexive(gerund: string): string {
  if (gerund.endsWith('ando')) return gerund.slice(0, -4) + 'ándose';
  if (gerund.endsWith('iendo')) return gerund.slice(0, -5) + 'iéndose';
  return gerund + 'se';
}

function gerundOfWord(word: string): string {
  const lower = word.toLowerCase();
  const isReflexive = lower.endsWith('arse') || lower.endsWith('erse') || lower.endsWith('irse');
  const infinitive = isReflexive ? lower.slice(0, -2) : lower;
  const gerund = GERUND_IRREGULAR[infinitive] ?? regularGerund(infinitive);
  return isReflexive ? attachReflexive(gerund) : gerund;
}

// ── Metadata de grupos para el home y las cards de cada grupo ───────────────
export interface FormGroup {
  id: string
  title: string
  jp: string
  romaji: string
  description: string
  colorClass: string
  forms: VerbForm[]
}

export const FORM_GROUPS: FormGroup[] = [
  {
    id: 'basica',
    title: 'Diccionario',
    jp: '辞書形',
    romaji: 'jisho-kei',
    description: 'La forma neutra, la que aparece en el diccionario.',
    colorClass: 'bg-amber-100 text-amber-700',
    forms: ['diccionario'],
  },
  {
    id: 'cortes',
    title: 'Cortés',
    jp: 'ます',
    romaji: 'masu',
    description: 'Presente y pasado, afirmativo y negativo, en registro formal.',
    colorClass: 'bg-indigo-100 text-indigo-700',
    forms: ['masu', 'masen', 'mashita', 'masendeshita'],
  },
  {
    id: 'negativo',
    title: 'Negativo',
    jp: 'ない',
    romaji: 'nai',
    description: 'Negación informal, presente y pasado.',
    colorClass: 'bg-rose-100 text-rose-700',
    forms: ['nai', 'nakatta'],
  },
  {
    id: 'te-ta',
    title: 'Forma て・た',
    jp: 'て・た',
    romaji: 'te / ta',
    description: 'Conectar oraciones (て) y el pasado informal (た).',
    colorClass: 'bg-accent-soft text-accent',
    forms: ['te', 'ta'],
  },
  {
    id: 'progresivo',
    title: 'Progresivo',
    jp: 'ている',
    romaji: 'te iru',
    description: 'Acción en curso o estado resultante, en las cuatro variantes.',
    colorClass: 'bg-sky-100 text-sky-700',
    forms: ['teimasu', 'teimasen', 'teimashita', 'teimasendeshita'],
  },
]

export const ALL_FORMS: VerbForm[] = FORM_GROUPS.flatMap((g) => g.forms)

// Categoría semántica de cada forma para la card del menú — más fina que
// FORM_GROUPS (て y た comparten grupo pero cumplen roles distintos: una
// conecta oraciones, la otra es el pasado informal en sí).
export const FORM_TAG: Record<VerbForm, { label: string; className: string }> = {
  diccionario:     { label: 'Básica',     className: 'bg-amber-100 text-amber-700' },
  nai:             { label: 'Negativo',   className: 'bg-rose-100 text-rose-700' },
  nakatta:         { label: 'Negativo',   className: 'bg-rose-100 text-rose-700' },
  masu:            { label: 'Cortés',     className: 'bg-indigo-100 text-indigo-700' },
  masen:           { label: 'Cortés',     className: 'bg-indigo-100 text-indigo-700' },
  mashita:         { label: 'Cortés',     className: 'bg-indigo-100 text-indigo-700' },
  masendeshita:    { label: 'Cortés',     className: 'bg-indigo-100 text-indigo-700' },
  te:              { label: 'Conexión',   className: 'bg-accent-soft text-accent' },
  ta:              { label: 'Informal',   className: 'bg-slate-100 text-slate-600' },
  teimasu:         { label: 'Progresivo', className: 'bg-sky-100 text-sky-700' },
  teimasen:        { label: 'Progresivo', className: 'bg-sky-100 text-sky-700' },
  teimashita:      { label: 'Progresivo', className: 'bg-sky-100 text-sky-700' },
  teimasendeshita: { label: 'Progresivo', className: 'bg-sky-100 text-sky-700' },
}

export const FORM_LABELS: Record<VerbForm, { title: string; jp: string }> = {
  diccionario:    { title: 'Diccionario',                        jp: '辞書形' },
  nai:            { title: 'Negativo presente',                  jp: 'ない形' },
  nakatta:        { title: 'Negativo pasado',                    jp: 'なかった形' },
  masu:           { title: 'Cortés presente',                    jp: 'ます形' },
  masen:          { title: 'Cortés presente negativo',           jp: 'ません形' },
  mashita:        { title: 'Cortés pasado',                      jp: 'ました形' },
  masendeshita:   { title: 'Cortés pasado negativo',             jp: 'ませんでした形' },
  te:             { title: 'Forma て',                           jp: 'て形' },
  ta:             { title: 'Pasado informal',                    jp: 'た形' },
  teimasu:        { title: 'Progresivo presente',                jp: 'ています形' },
  teimasen:       { title: 'Progresivo presente negativo',       jp: 'ていません形' },
  teimashita:     { title: 'Progresivo pasado',                  jp: 'ていました形' },
  teimasendeshita:{ title: 'Progresivo pasado negativo',         jp: 'ていませんでした形' },
};

// Para qué se usa cada forma — lo que le da sentido a la conjugación en vez
// de mostrar solo el resultado (qué frase arma, con qué se conecta).
export const FORM_USAGE: Record<VerbForm, string> = {
  diccionario:      'Forma neutra/informal. Es la que aparece en el diccionario y en 〜と思う, 〜前に.',
  nai:              'Negación informal del presente: "no como".',
  nakatta:          'Negación informal del pasado: "no comí".',
  masu:             'Forma cortés del presente, para hablar con desconocidos o en formal.',
  masen:            'Negación cortés del presente.',
  mashita:          'Pasado cortés.',
  masendeshita:     'Negación cortés del pasado.',
  te:               'Conecta ideas: 〜てください (pedir), 〜てもいい (permiso), 〜ている (progresivo).',
  ta:               'Pasado informal. Base de 〜たことがある (experiencia) y 〜たり (enumerar).',
  teimasu:          'Acción en curso o estado resultante: "está haciendo" / "está hecho".',
  teimasen:         'Negación de la acción en curso o del estado.',
  teimashita:       'Acción en curso en el pasado: "estaba haciendo".',
  teimasendeshita:  'Negación de la acción en curso en el pasado.',
}

// Texto corto de la regla que produjo la conjugación (ej. "く→いて"), para
// mostrar "el patrón" junto a la respuesta en vez de solo la respuesta sola.
export function getRule(verb: Verb, tab: VerbTab, form: VerbForm): string {
  if (form === 'diccionario') return '';

  if (tab === 'irregulares') return `irregular: ${verb.hiragana}`;

  if (tab === 'grupo2') return `-る → ${ICHIDAN_ENDINGS[form]}`;

  // Godan (grupo1)
  const lastKana = verb.hiragana.slice(-1);
  const row = GODAN_ROWS[lastKana] ?? GODAN_ROWS['る'];
  const teEnding = TE_EXCEPTIONS[verb.hiragana] ?? row.teEnding;

  switch (form) {
    case 'te': return `${lastKana} → ${teEnding}`;
    case 'ta': return `${lastKana} → ${teToTa(teEnding)}`;
    case 'nai': return `${lastKana} → ${row.naiRow}ない`;
    case 'nakatta': return `${lastKana} → ${row.naiRow}なかった`;
    case 'masu': return `${lastKana} → ${row.masuRow}ます`;
    case 'masen': return `${lastKana} → ${row.masuRow}ません`;
    case 'mashita': return `${lastKana} → ${row.masuRow}ました`;
    case 'masendeshita': return `${lastKana} → ${row.masuRow}ませんでした`;
    case 'teimasu': return `${lastKana} → ${teEnding} + います`;
    case 'teimasen': return `${lastKana} → ${teEnding} + いません`;
    case 'teimashita': return `${lastKana} → ${teEnding} + いました`;
    case 'teimasendeshita': return `${lastKana} → ${teEnding} + いませんでした`;
    default: return '';
  }
}

// Aplica la transformación solo a la primera palabra de cada alternativa
// ("poder ver" → "pudiendo ver"), separando por " / " sin romper paréntesis
// que ya contengan una barra sin espacios (ej. "caer (lluvia/nieve)").
function mapFirstWordPerAlternative(meaning: string, transform: (word: string) => string): string {
  return meaning.split(' / ').map(alt => {
    const spaceIdx = alt.indexOf(' ');
    if (spaceIdx === -1) return transform(alt);
    return transform(alt.slice(0, spaceIdx)) + alt.slice(spaceIdx);
  }).join(' / ');
}

// El pasado no cambia el significado glosado — sin sujeto, el español no tiene
// forma de marcar tiempo en un infinitivo o gerundio, así que cada forma usa la
// misma transformación que su par en presente/pasado (solo importan negación y
// aspecto progresivo, no el tiempo).
const NEGATIVE_FORMS = new Set<VerbForm>(['nai', 'nakatta', 'masen', 'masendeshita', 'teimasen', 'teimasendeshita']);
const PROGRESSIVE_FORMS = new Set<VerbForm>(['teimasu', 'teimashita', 'teimasen', 'teimasendeshita']);

export function conjugateMeaning(meaning: string, form: VerbForm): string {
  const isNegative = NEGATIVE_FORMS.has(form);
  const isProgressive = PROGRESSIVE_FORMS.has(form);
  if (!isNegative && !isProgressive) return meaning;
  return mapFirstWordPerAlternative(meaning, w => {
    const base = isProgressive ? gerundOfWord(w) : w;
    return isNegative ? 'no ' + base : base;
  });
}
