export function formatCountdown(target: Date, now: Date): string {
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return 'Можно открыть';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);
  return `${days}д ${hours}ч ${mins}м ${secs}с`;
}

export function getContentTypeName(type: number): string {
  const map: Record<number, string> = { 0: 'Текстовая', 1: 'Ссылочная', 2: 'Файловая' };
  return map[type] ?? 'Неизвестный';
}
