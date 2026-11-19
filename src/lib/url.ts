/**
 * Safely validates external URLs for rendering and saving.
 * Allows https:// (and optionally mailto:) only; blocks javascript:, data:, vbscript:, etc.
 */
export function safeHref(
  rawUrl?: string | null,
  options: { allowMailto?: boolean } = {}
): string | undefined {
  if (!rawUrl || typeof rawUrl !== 'string') return undefined;
  const trimmed = rawUrl.trim();
  if (!trimmed) return undefined;

  const lower = trimmed.toLowerCase();
  if (lower.startsWith('https://')) {
    return trimmed;
  }
  if (options.allowMailto && lower.startsWith('mailto:')) {
    return trimmed;
  }
  return undefined;
}

export function isValidUrlInput(
  rawUrl: string,
  options: { allowMailto?: boolean; allowEmpty?: boolean } = {}
): boolean {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) {
    return Boolean(options.allowEmpty);
  }
  return Boolean(safeHref(trimmed, { allowMailto: options.allowMailto }));
}
