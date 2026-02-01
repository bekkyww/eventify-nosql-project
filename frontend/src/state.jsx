export function money(n) {
  const x = Number(n || 0);
  return x.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
