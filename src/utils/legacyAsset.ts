export function legacyAsset(srcPath: string): string {
  const normalized = srcPath.trim();
  if (normalized.startsWith('src/assets/')) {
    return `/${normalized.replace(/^src\//, '')}`;
  }
  if (normalized.startsWith('/')) {
    return normalized;
  }
  return normalized;
}
