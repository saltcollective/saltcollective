function escapeCell(value: string | number | null | undefined): string {
  const s = value == null ? '' : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

export function toCsv(header: string[], rows: (string | number | null | undefined)[][]): string {
  return [header, ...rows].map((row) => row.map(escapeCell).join(',')).join('\r\n') + '\r\n';
}
