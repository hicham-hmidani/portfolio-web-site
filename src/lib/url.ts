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

/**
 * Safely validates local static asset paths (/assets/...) or https:// URLs
 * for downloadable/viewable certificates and document assets.
 */
export function safeAssetHref(rawUrl?: string | null): string | undefined {
  if (!rawUrl || typeof rawUrl !== 'string') return undefined;
  const trimmed = rawUrl.trim();
  if (!trimmed) return undefined;

  if (trimmed.startsWith('/assets/') && !trimmed.includes('..') && !trimmed.includes('\\')) {
    return trimmed;
  }

  return safeHref(trimmed);
}

export function isValidUrlInput(
  rawUrl: string,
  options: { allowMailto?: boolean; allowEmpty?: boolean; allowLocalAsset?: boolean } = {}
): boolean {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) {
    return Boolean(options.allowEmpty);
  }
  if (options.allowLocalAsset) {
    return (
      Boolean(safeAssetHref(trimmed)) ||
      Boolean(options.allowMailto && safeHref(trimmed, { allowMailto: true }))
    );
  }
  return Boolean(safeHref(trimmed, { allowMailto: options.allowMailto }));
}
