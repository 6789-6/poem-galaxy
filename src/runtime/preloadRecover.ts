const KEY = 'poem-galaxy-preload-retry';

type VitePreloadError = Event & { payload?: unknown };

window.addEventListener('vite:preloadError', (event: Event) => {
  event.preventDefault();
  const current = window.location.href;
  const retried = sessionStorage.getItem(KEY);

  if (retried !== current) {
    sessionStorage.setItem(KEY, current);
    window.location.reload();
    return;
  }

  sessionStorage.removeItem(KEY);
  console.warn('[poem-galaxy] stale vite chunk detected; reload already attempted once', (event as VitePreloadError).payload);
});

window.addEventListener('pageshow', () => {
  sessionStorage.removeItem(KEY);
});
