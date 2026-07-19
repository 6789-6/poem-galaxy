export function dataUrl(path: string, origin = window.location.origin, base = import.meta.env.BASE_URL) {
  const normalized = path.replace(/^\/+/, '');
  return new URL(base.replace(/\/?$/, '/') + 'data/' + normalized, origin).toString();
}
