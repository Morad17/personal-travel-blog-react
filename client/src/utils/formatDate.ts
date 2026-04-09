export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

export function formatDateShort(dateString: string): string {
  return formatDate(dateString, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatYear(dateString: string): string {
  return new Date(dateString).getFullYear().toString();
}

export function formatDateUK(dateString: string): string {
  const d = new Date(dateString);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
