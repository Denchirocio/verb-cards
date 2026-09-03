/**
 * Convertidor de Hiragana/Katakana a Romaji
 * Convierte texto en hiragana o katakana a su representación en romaji
 */

const hiraganaToRomajiMap: Record<string, string> = {
  // Vocales
  'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
  'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o',
  
  // K
  'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
  'カ': 'ka', 'キ': 'ki', 'ク': 'ku', 'ケ': 'ke', 'コ': 'ko',
  'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo',
  'キャ': 'kya', 'キュ': 'kyu', 'キョ': 'kyo',
  'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
  'ガ': 'ga', 'ギ': 'gi', 'グ': 'gu', 'ゲ': 'ge', 'ゴ': 'go',
  'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎょ': 'gyo',
  'ギャ': 'gya', 'ギュ': 'gyu', 'ギョ': 'gyo',
  
  // S
  'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
  'サ': 'sa', 'シ': 'shi', 'ス': 'su', 'セ': 'se', 'ソ': 'so',
  'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho',
  'シャ': 'sha', 'シュ': 'shu', 'ショ': 'sho',
  'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
  'ザ': 'za', 'ジ': 'ji', 'ズ': 'zu', 'ゼ': 'ze', 'ゾ': 'zo',
  'じゃ': 'ja', 'じゅ': 'ju', 'じょ': 'jo',
  'ジャ': 'ja', 'ジュ': 'ju', 'ジョ': 'jo',
  
  // T
  'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
  'タ': 'ta', 'チ': 'chi', 'ツ': 'tsu', 'テ': 'te', 'ト': 'to',
  'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho',
  'チャ': 'cha', 'チュ': 'chu', 'チョ': 'cho',
  'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
  'ダ': 'da', 'ヂ': 'ji', 'ヅ': 'zu', 'デ': 'de', 'ド': 'do',
  
  // N
  'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
  'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no',
  'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo',
  'ニャ': 'nya', 'ニュ': 'nyu', 'ニョ': 'nyo',
  
  // H
  'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
  'ハ': 'ha', 'ヒ': 'hi', 'フ': 'fu', 'ヘ': 'he', 'ホ': 'ho',
  'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo',
  'ヒャ': 'hya', 'ヒュ': 'hyu', 'ヒョ': 'hyo',
  'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
  'バ': 'ba', 'ビ': 'bi', 'ブ': 'bu', 'ベ': 'be', 'ボ': 'bo',
  'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo',
  'ビャ': 'bya', 'ビュ': 'byu', 'ビョ': 'byo',
  'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
  'パ': 'pa', 'ピ': 'pi', 'プ': 'pu', 'ペ': 'pe', 'ポ': 'po',
  'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo',
  'ピャ': 'pya', 'ピュ': 'pyu', 'ピョ': 'pyo',
  
  // M
  'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
  'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo',
  'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',
  'ミャ': 'mya', 'ミュ': 'myu', 'ミョ': 'myo',
  
  // Y
  'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
  'ヤ': 'ya', 'ユ': 'yu', 'ヨ': 'yo',
  
  // R
  'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
  'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro',
  'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',
  'リャ': 'rya', 'リュ': 'ryu', 'リョ': 'ryo',
  
  // W
  'わ': 'wa', 'ゐ': 'wi', 'ゑ': 'we', 'を': 'wo', 'ん': 'n',
  'ワ': 'wa', 'ヰ': 'wi', 'ヱ': 'we', 'ヲ': 'wo', 'ン': 'n',
  
  // Vocales largas en katakana
  'ー': '',
  
  // Pequeña tsu (っ) - duplica consonante siguiente
  'っ': '',
  'ッ': '',
};

/**
 * Convierte texto en hiragana/katakana a romaji
 */
export function hiraganaToRomaji(hiragana: string): string {
  let romaji = '';
  let i = 0;
  let lastVowel = '';
  
  while (i < hiragana.length) {
    // Manejar vocal larga en katakana (ー)
    if (hiragana[i] === 'ー' && lastVowel) {
      romaji += lastVowel;
      i++;
      continue;
    }
    
    // Intentar primero combinaciones de 2 caracteres (como きゃ)
    if (i + 1 < hiragana.length) {
      const twoChar = hiragana.substring(i, i + 2);
      if (hiraganaToRomajiMap[twoChar]) {
        const converted = hiraganaToRomajiMap[twoChar];
        romaji += converted;
        // Guardar la última vocal para vocales largas
        lastVowel = converted[converted.length - 1];
        i += 2;
        continue;
      }
    }
    
    // Manejar pequeña tsu (っ/ッ) - duplica la consonante siguiente
    if ((hiragana[i] === 'っ' || hiragana[i] === 'ッ') && i + 1 < hiragana.length) {
      const nextChar = hiragana[i + 1];
      const nextRomaji = hiraganaToRomajiMap[nextChar];
      if (nextRomaji) {
        romaji += nextRomaji[0]; // Duplica la primera consonante
      }
      i++;
      continue;
    }
    
    // Convertir caracter individual
    const oneChar = hiragana[i];
    if (hiraganaToRomajiMap[oneChar] !== undefined) {
      const converted = hiraganaToRomajiMap[oneChar];
      romaji += converted;
      // Guardar la última vocal para vocales largas
      if (converted && 'aiueo'.includes(converted[converted.length - 1])) {
        lastVowel = converted[converted.length - 1];
      }
    } else {
      // Si no encuentra conversión, mantener el caracter original
      romaji += oneChar;
      lastVowel = '';
    }
    i++;
  }
  
  return romaji;
}
