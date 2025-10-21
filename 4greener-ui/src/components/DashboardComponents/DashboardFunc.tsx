export function heatColor(v: number, dark: boolean) {
  const t = Math.max(0, Math.min(1, v));
  const base = dark ? 230 : 210;
  const lightness = dark ? 35 - t * 20 : 85 - t * 35;
  return `hsl(${base}, 90%, ${lightness}%)`;
}