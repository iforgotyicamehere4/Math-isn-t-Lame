import { useEffect } from 'react';

export default function useScriptOnce(src, key) {
  useEffect(() => {
    if (!src || !key) return;
    const existing = document.querySelector(`script[data-script-key="${key}"]`);
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset.scriptKey = key;
    document.body.appendChild(script);
  }, [src, key]);
}
