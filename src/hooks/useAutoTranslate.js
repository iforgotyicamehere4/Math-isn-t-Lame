import { useEffect, useMemo, useState } from 'react';

const CACHE_KEY = 'mathpop_translate_cache_v1';

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeCache(cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore storage failures
  }
}

function detectLanguage() {
  if (typeof navigator === 'undefined') return 'en';
  const lang = (navigator.languages && navigator.languages[0]) || navigator.language || 'en';
  if (!lang) return 'en';
  return String(lang).toLowerCase();
}

async function translateText(text, targetLang) {
  const url = new URL('https://translate.googleapis.com/translate_a/single');
  url.searchParams.set('client', 'gtx');
  url.searchParams.set('sl', 'en');
  url.searchParams.set('tl', targetLang);
  url.searchParams.set('dt', 't');
  url.searchParams.set('q', text);

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`translate_failed_${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data) || !Array.isArray(data[0])) throw new Error('invalid_translate_payload');
  return data[0].map((chunk) => (Array.isArray(chunk) ? chunk[0] : '')).join('').trim() || text;
}

export default function useAutoTranslate(stringsByKey, enabled = true) {
  const [language] = useState(() => detectLanguage());
  const [translatedState, setTranslatedState] = useState(stringsByKey);
  const [isTranslating, setIsTranslating] = useState(false);

  const input = useMemo(() => stringsByKey || {}, [stringsByKey]);
  const inputHash = useMemo(() => JSON.stringify(input), [input]);
  const baseLang = language.split('-')[0];
  const targetLang = baseLang || 'en';
  const translated = !enabled || targetLang === 'en' ? input : translatedState;

  useEffect(() => {
    if (!enabled || targetLang === 'en') return undefined;

    let cancelled = false;
    const cache = readCache();

    const run = async () => {
      setIsTranslating(true);
      const next = { ...input };
      const entries = Object.entries(input);
      for (let i = 0; i < entries.length; i += 1) {
        const [key, value] = entries[i];
        if (!value) continue;
        const cacheKey = `${targetLang}|${value}`;
        if (cache[cacheKey]) {
          next[key] = cache[cacheKey];
          continue;
        }
        try {
          const out = await translateText(value, targetLang);
          cache[cacheKey] = out;
          next[key] = out;
        } catch {
          next[key] = value;
        }
      }
      if (cancelled) return;
      writeCache(cache);
      setTranslatedState(next);
      setIsTranslating(false);
    };

    run().catch(() => {
      if (!cancelled) {
        setTranslatedState(input);
        setIsTranslating(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [enabled, input, inputHash, targetLang]);

  return { translated, language: targetLang, isTranslating };
}
