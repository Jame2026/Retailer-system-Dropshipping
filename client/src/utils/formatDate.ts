export function formatDate(dateString?: string | Date | null): string {
  if (!dateString) return '—';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTimeRemaining(targetDate?: string | Date | null): {
  isExpired: boolean;
  formatted: string;
  totalSeconds: number;
} {
  if (!targetDate) return { isExpired: true, formatted: 'Expired', totalSeconds: 0 };
  const target = new Date(targetDate).getTime();
  const now = Date.now();
  const diffMs = target - now;

  if (diffMs <= 0) {
    return { isExpired: true, formatted: '00:00:00 (Ready)', totalSeconds: 0 };
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return {
    isExpired: false,
    formatted,
    totalSeconds: Math.floor(diffMs / 1000),
  };
}
