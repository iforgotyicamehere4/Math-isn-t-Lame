import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Enhanced script loader hook that properly waits for scripts to load
 * and provides loading state tracking
 */
export default function useScriptOnce(src, key) {
  const loadedRef = useRef(false);
  const loadingRef = useRef(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadScript = useCallback(() => {
    if (!src || !key) {
      return Promise.reject(new Error('Invalid src or key'));
    }

    // Check if already loaded
    const existing = document.querySelector(`script[data-script-key="${key}"]`);
    if (existing) {
      const domLoaded = existing.dataset.loaded === 'true';
      // Check if already loaded successfully
      if (loadedRef.current || domLoaded) {
        loadedRef.current = true;
        loadingRef.current = false;
        setIsLoaded(true);
        setIsLoading(false);
        return Promise.resolve(existing);
      }
      // If still loading, wait for it
      if (loadingRef.current) {
        return new Promise((resolve, reject) => {
          const checkLoaded = setInterval(() => {
            if (loadedRef.current) {
              clearInterval(checkLoaded);
              resolve(existing);
            } else if (document.querySelector(`script[data-script-key="${key}"]`) === null) {
              clearInterval(checkLoaded);
              reject(new Error('Script was removed'));
            }
          }, 100);
          // Timeout after 30 seconds
          setTimeout(() => {
            clearInterval(checkLoaded);
            reject(new Error('Script load timeout'));
          }, 30000);
        });
      }
    }

    // Remove existing script if present
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }

    loadingRef.current = true;
    loadedRef.current = false;
    setIsLoading(true);
    setIsLoaded(false);

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = false; // Load synchronously to ensure order
      script.dataset.scriptKey = key;

      script.onload = () => {
        loadedRef.current = true;
        loadingRef.current = false;
        setIsLoaded(true);
        setIsLoading(false);
        script.dataset.loaded = 'true';
        console.log(`[useScriptOnce] Loaded: ${src}`);
        resolve(script);
      };

      script.onerror = () => {
        loadedRef.current = false;
        loadingRef.current = false;
        setIsLoaded(false);
        setIsLoading(false);
        console.error(`[useScriptOnce] Failed to load: ${src}`);
        reject(new Error(`Failed to load script: ${src}`));
      };

      document.body.appendChild(script);
    });
  }, [src, key]);

  useEffect(() => {
    const cleanup = () => {
      // Mark as not loaded so it can be reloaded on remount
      loadedRef.current = false;
      loadingRef.current = false;
      setIsLoaded(false);
      setIsLoading(false);
    };

    return cleanup;
  }, []);

  return { loadScript, isLoaded, isLoading };
}

/**
 * Hook for loading multiple scripts in sequence
 */
export function useScriptsOnce(scripts) {
  const loadedRef = useRef({});
  const [loadedMap, setLoadedMap] = useState({});

  useEffect(() => {
    if (!Array.isArray(scripts)) return;

    const loadAll = async () => {
      for (const { src, key } of scripts) {
        if (!src || !key) continue;
        
        // Skip if already loaded
        if (loadedRef.current[key]) continue;

        const existing = document.querySelector(`script[data-script-key="${key}"]`);
        if (existing) {
          loadedRef.current[key] = true;
          setLoadedMap((prev) => ({ ...prev, [key]: true }));
          continue;
        }

        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = src;
          script.async = false;
          script.dataset.scriptKey = key;

          script.onload = () => {
            loadedRef.current[key] = true;
            setLoadedMap((prev) => ({ ...prev, [key]: true }));
            console.log(`[useScriptsOnce] Loaded: ${src}`);
            resolve(script);
          };

          script.onerror = () => {
            console.error(`[useScriptsOnce] Failed to load: ${src}`);
            reject(new Error(`Failed to load script: ${src}`));
          };

          document.body.appendChild(script);
        });
      }
    };

    loadAll().catch((err) => {
      console.error('[useScriptsOnce] Error loading scripts:', err.message);
    });
  }, [scripts]);

  return loadedMap;
}
