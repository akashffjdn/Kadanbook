/**
 * Produce a stable, pleasant avatar color from a name string.
 * Picks from a curated palette of warm, distinguishable hues that work on dark + light backgrounds.
 */
const PALETTE = [
  '#FF6B6B', // coral
  '#FFA94D', // amber
  '#FFD43B', // sunflower
  '#69DB7C', // mint
  '#4DABF7', // sky
  '#9775FA', // lavender
  '#F783AC', // pink
  '#63E6BE', // teal
  '#FFB876', // peach
  '#A5D8FF', // baby blue
  '#FF8787', // rose
  '#B197FC', // periwinkle
];

const hash = (str: string): number => {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
};

export const colorFromName = (name: string): string => {
  if (!name) return PALETTE[0]!;
  return PALETTE[hash(name) % PALETTE.length]!;
};

export const initialsFromName = (name: string): string => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
};
