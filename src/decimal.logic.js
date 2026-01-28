const SMALL = [
  "zero","one","two","three","four","five","six","seven","eight","nine",
  "ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"
];
const TENS = ["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];

function intToWords(n) {
  n = Math.abs(Math.trunc(n));
  if (n < 20) return SMALL[n];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const r = n % 10;
    return r ? `${TENS[t]}-${SMALL[r]}` : TENS[t];
  }
  const h = Math.floor(n / 100);
  const rem = n % 100;
  return rem ? `${SMALL[h]} hundred ${intToWords(rem)}` : `${SMALL[h]} hundred`;
}

function fractionWordsFromDigits(digits) {
  if (!digits || Number(digits) === 0) return '';
  let s = digits;
  if (s.endsWith('00')) s = s.slice(0, 1);
  else if (s.endsWith('0')) s = s.slice(0, 2);
  const denomMap = { 1: 'tenth', 2: 'hundredth', 3: 'thousandth' };
  const denom = denomMap[s.length] || `${Math.pow(10, s.length)}th`;
  const denomPlural = denom + 's';
  const numer = parseInt(s, 10);
  const numerWords = intToWords(numer).replace(/\s+/g, '-');
  return `${numerWords}-${denomPlural}`;
}

function parseSmallNumberWords(wordStr) {
  if (!wordStr) return null;
  const w = wordStr.trim().toLowerCase();
  for (let i = 0; i < SMALL.length; i++) if (SMALL[i] === w) return i;
  if (w.includes('-')) {
    const parts = w.split('-');
    if (parts.length === 2) {
      const tens = TENS.indexOf(parts[0]);
      const unit = SMALL.indexOf(parts[1]);
      if (tens >= 2 && unit >= 0) return tens * 10 + unit;
    }
  } else {
    const tens = TENS.indexOf(w);
    if (tens >= 2) return tens * 10;
  }
  const sp = w.split(/\s+/);
  if (sp.length === 2) {
    const a = parseSmallNumberWords(sp[0]);
    const b = parseSmallNumberWords(sp[1]);
    if (a !== null && b !== null) return a + b;
  }
  return null;
}

function buildEasySpelledPhrase(value) {
  const whole = Math.trunc(value);
  const fracNum = Math.round((value - whole) * 1000);
  const wholeWord = intToWords(whole);
  if (fracNum === 0) return wholeWord.toLowerCase().replace(/\s+/g, '-');
  let fracStr = String(fracNum).padStart(3, '0');
  if (fracStr.endsWith('00')) fracStr = fracStr.slice(0, 1);
  else if (fracStr.endsWith('0')) fracStr = fracStr.slice(0, 2);
  const fracWords = fractionWordsFromDigits(fracStr);
  return `${wholeWord.toLowerCase().replace(/\s+/g, '-')}-and-${fracWords}`;
}

function buildEasyMixedPhrase(whole, frac) {
  const wholeValue = typeof whole === 'number' ? whole : (Math.floor(Math.random() * 80) + 20);
  const fracValue = typeof frac === 'number' ? frac : Math.floor(Math.random() * 100);
  const wholeWord = buildEasySpelledPhrase(wholeValue);
  const fracStr = String(fracValue).padStart(2, '0');
  return `${wholeWord}.${fracStr}`;
}

function buildMixedWholePart(whole, style = 'word-digit') {
  const wholeWord = intToWords(whole).toLowerCase().replace(/[\s-]+/g, '');
  const tensDigit = Math.floor(whole / 10);
  const ones = whole % 10;
  if (style === 'digits') return String(whole);
  if (style === 'word') return wholeWord;
  if (style === 'digit-word') {
    if (ones === 0) return String(whole);
    return `${tensDigit}${SMALL[ones]}`;
  }
  if (ones > 0) {
    const tensWord = intToWords(tensDigit * 10).toLowerCase().replace(/[\s-]+/g, '');
    return `${tensWord}${ones}`;
  }
  return wholeWord;
}

function buildHundredthsPhrase(value, style = 'word-and-digit') {
  const n = Math.max(0, Math.min(99, value));
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  if (style === 'digits') return `${n}hundredths`;
  if (style === 'word') {
    const word = intToWords(n).toLowerCase().replace(/[\s-]+/g, '');
    return `${word}hundredths`;
  }
  if (style === 'word-digit') {
    if (ones === 0) return `${SMALL[tens]}hundredths`;
    return `${SMALL[tens]}${ones}hundredths`;
  }
  if (n >= 10) {
    if (ones === 0) return `${SMALL[tens]}hundredths`;
    return `${SMALL[tens]}and${ones}hundredths`;
  }
  const word = intToWords(n).toLowerCase().replace(/[\s-]+/g, '');
  return `${word}hundredths`;
}

function buildThousandthsPhrase(value, style = 'word-and-digit') {
  const n = Math.max(0, Math.min(999, value));
  if (style === 'digits') return `${n}thousandths`;
  const word = intToWords(n).toLowerCase().replace(/[\s-]+/g, '');
  if (style === 'word') return `${word}thousandths`;
  const hundreds = Math.floor(n / 100);
  const tens = Math.floor((n % 100) / 10);
  const ones = n % 10;
  if (style === 'word-digit-word' && hundreds > 0) {
    const head = SMALL[hundreds];
    const tail = ones > 0 ? SMALL[ones] : '';
    const core = tail ? `${head}${tens}${tail}` : `${head}${tens}`;
    return `${core}thousandths`;
  }
  if (style === 'word-digit' && n >= 10) {
    if (ones === 0) return `${SMALL[tens]}thousandths`;
    return `${SMALL[tens]}${ones}thousandths`;
  }
  if (style === 'digit-word' && n >= 10) {
    if (ones === 0) return `${tens}${SMALL[tens]}thousandths`;
    return `${tens}${SMALL[ones]}thousandths`;
  }
  if (n >= 10) {
    if (ones === 0) return `${SMALL[tens]}thousandths`;
    return `${SMALL[tens]}and${ones}thousandths`;
  }
  return `${word}thousandths`;
}

function parseThousandthsMixed(part) {
  if (!part) return null;
  const cleaned = part.toLowerCase().replace(/thousandths?$/, '');
  if (!cleaned) return null;
  const digits = cleaned.replace(/[^0-9]/g, '');
  const letters = cleaned.replace(/[^a-z\-]/g, '').replace(/and/g, '');
  if (digits && letters) {
    const numDigits = parseInt(digits, 10);
    const wordVal = parseSmallNumberWords(letters);
    if (wordVal !== null) {
      if (digits.length === 2 && wordVal < 10) return wordVal * 100 + numDigits;
      if (digits.length === 1 && wordVal < 10) return wordVal * 10 + numDigits;
      return parseInt(`${numDigits}${wordVal}`, 10);
    }
  }
  if (digits) return parseInt(digits, 10);
  return parseSmallNumberWords(letters);
}

function parseWordDigitWord(cleaned) {
  if (!cleaned) return null;
  let headWord = null;
  let tailWord = null;
  for (const w of SMALL.slice(1)) {
    if (cleaned.startsWith(w)) {
      headWord = w;
      break;
    }
  }
  for (const w of SMALL.slice(1)) {
    if (cleaned.endsWith(w)) {
      tailWord = w;
      break;
    }
  }
  if (!headWord || !tailWord) return null;
  const middle = cleaned.slice(headWord.length, cleaned.length - tailWord.length);
  if (!/^\d+$/.test(middle)) return null;
  const hundreds = SMALL.indexOf(headWord);
  const ones = SMALL.indexOf(tailWord);
  const tens = parseInt(middle, 10);
  if (hundreds < 0 || ones < 0 || tens < 0 || tens > 9) return null;
  return hundreds * 100 + tens * 10 + ones;
}

function parseMixedWholePart(part) {
  if (!part) return null;
  const cleaned = part.toLowerCase();
  const digits = cleaned.replace(/[^0-9]/g, '');
  const letters = cleaned.replace(/[^a-z\-]/g, '').replace(/and/g, '');
  const wordVal = letters ? parseSmallNumberWords(letters) : null;
  if (digits) {
    const numDigits = parseInt(digits, 10);
    if (wordVal !== null) {
      if (digits.length === 1 && wordVal < 10) {
        return wordVal * 10 + numDigits;
      }
      if (wordVal >= 20 && wordVal % 10 === 0 && digits.length === 1) {
        return wordVal + numDigits;
      }
      return parseInt(`${wordVal}${digits}`, 10);
    }
    return numDigits;
  }
  return wordVal;
}

function parseHundredthsMixed(part) {
  if (!part) return null;
  const cleaned = part.toLowerCase().replace(/hundredths?$/, '');
  const digits = cleaned.replace(/[^0-9]/g, '');
  const letters = cleaned.replace(/[^a-z\-]/g, '').replace(/and/g, '');
  const wordVal = letters ? parseSmallNumberWords(letters) : null;
  if (digits) {
    const numDigits = parseInt(digits, 10);
    if (wordVal !== null) {
      if (digits.length === 1 && wordVal < 10) {
        return wordVal * 10 + numDigits;
      }
      if (wordVal >= 20 && wordVal % 10 === 0 && digits.length === 1) {
        return wordVal + numDigits;
      }
      return parseInt(`${wordVal}${digits}`, 10);
    }
    return numDigits;
  }
  return wordVal;
}

function parseEasyRowPhrase(phrase) {
  if (!phrase) return null;
  if (phrase.includes('-and-')) return parseEasySpelledPhrase(phrase);
  if (phrase.includes('&')) {
    const [wholePart, fracPart] = phrase.split('&');
    const whole = parseMixedWholePart(wholePart);
    if (whole === null) return null;
    const fracText = fracPart || '';
    if (fracText.includes('thousandth')) {
      const fracClean = fracText.toLowerCase().replace(/thousandths?$/, '');
      const frac = parseThousandthsMixed(fracText) ?? parseWordDigitWord(fracClean);
      if (frac === null || frac < 0 || frac > 999) return null;
      return Number((whole + frac / 1000).toFixed(6));
    }
    const frac = parseHundredthsMixed(fracText);
    if (frac === null || frac < 0 || frac > 99) return null;
    return Number((whole + frac / 100).toFixed(6));
  }
  return parseEasyMixedPhrase(phrase);
}

function parseEasyMixedPhrase(phrase) {
  if (!phrase) return null;
  const cleaned = phrase.toLowerCase().replace(/[^a-z0-9\.\-]/g, '');
  const parts = cleaned.split('.');
  if (parts.length !== 2) return null;
  const wholePart = parts[0].replace(/[^a-z\-]/g, '');
  const fracPart = parts[1].replace(/[^0-9]/g, '');
  if (!wholePart || !fracPart) return null;
  const whole = parseSmallNumberWords(wholePart);
  if (whole === null) return null;
  const denom = Math.pow(10, fracPart.length);
  return Number((whole + Number(fracPart) / denom).toFixed(6));
}

function parseEasySpelledPhrase(phrase) {
  if (!phrase) return null;
  const trimmed = phrase.trim().toLowerCase().replace(/^-+/, '').replace(/-+$/, '');
  if (trimmed.includes('-and-')) {
    const [wholePart, fracPart] = trimmed.split('-and-');
    const whole = parseSmallNumberWords(wholePart);
    if (whole === null) return null;
    let denomFactor = null;
    let numerWords = null;
    if (fracPart.endsWith('thousandths')) { denomFactor = 1000; numerWords = fracPart.slice(0, -'thousandths'.length); }
    else if (fracPart.endsWith('hundredths')) { denomFactor = 100; numerWords = fracPart.slice(0, -'hundredths'.length); }
    else if (fracPart.endsWith('tenths')) { denomFactor = 10; numerWords = fracPart.slice(0, -'tenths'.length); }
    else if (fracPart.endsWith('thousandth')) { denomFactor = 1000; numerWords = fracPart.slice(0, -'thousandth'.length); }
    else if (fracPart.endsWith('hundredth')) { denomFactor = 100; numerWords = fracPart.slice(0, -'hundredth'.length); }
    else if (fracPart.endsWith('tenth')) { denomFactor = 10; numerWords = fracPart.slice(0, -'tenth'.length); }
    else return null;
    numerWords = numerWords.replace(/-+$/, '').replace(/^-+/, '').trim();
    const numer = parseSmallNumberWords(numerWords);
    if (numer === null) return null;
    return Number((whole + numer / denomFactor).toFixed(6));
  }
  const whole = parseSmallNumberWords(trimmed);
  if (whole === null) return null;
  return Number(whole.toFixed(6));
}

export {
  buildEasySpelledPhrase,
  buildEasyMixedPhrase,
  buildMixedWholePart,
  buildHundredthsPhrase,
  buildThousandthsPhrase,
  parseEasyRowPhrase
};
