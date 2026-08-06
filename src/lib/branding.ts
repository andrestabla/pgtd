"use client";

// Aplicación del acento de marca en vivo: deriva los tonos deep/fill del
// hex elegido y sobreescribe las variables CSS del tema. null restaura el
// tema Algoritmo T.

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h =
    max === r ? ((g - b) / d + (g < b ? 6 : 0)) :
    max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s * 100, l * 100];
}

const hsl = (h: number, s: number, l: number) =>
  `hsl(${h.toFixed(0)} ${clamp(s, 0, 100).toFixed(0)}% ${clamp(l, 0, 100).toFixed(0)}%)`;

const VARS = ["--cyan", "--cyan-deep", "--cyan-fill", "--cyan-wash"] as const;

export function applyAccent(accent: string | null) {
  const root = document.documentElement;
  if (!accent) {
    for (const v of VARS) root.style.removeProperty(v);
    return;
  }
  const [h, s, l] = hexToHsl(accent);
  root.style.setProperty("--cyan", accent);
  root.style.setProperty("--cyan-deep", hsl(h, s, l - 14));
  root.style.setProperty("--cyan-fill", hsl(h, clamp(s, 40, 90), l + 22));
  root.style.setProperty("--cyan-wash", hsl(h, clamp(s, 30, 60), 96));
}
