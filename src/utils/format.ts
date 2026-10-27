export const formatTime = (iso: string | null): string => {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString([], { day: '2-digit', month: 'short' });
};

export const formatDateLong = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString([], { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleString([], {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatMoney = (n: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(n);

export const todayLabel = (): string =>
  new Date().toLocaleDateString([], {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
