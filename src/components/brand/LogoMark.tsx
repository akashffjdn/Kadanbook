import Svg, { Defs, G, LinearGradient, Line, Rect, Stop } from 'react-native-svg';

/**
 * KadanBook brand mark — the shopkeeper's tally.
 *
 * Concept:
 *  - Four vertical strokes + one diagonal slash = "5", the universal Indian
 *    shopkeeper's tally for marking kadan (debts) in a ledger.
 *  - Every chai-shop / kirana owner already reads this glyph instantly.
 *  - Geometric, scale-stable from 16px → 1024px, no cultural-language barrier.
 *  - Warm orange gradient matches the AMOLED brand palette.
 *
 * Why not a "K" letter? A K-in-rounded-square is the generic fintech-starter
 * look — Klarna, Kuda, Kraken, Klook all own that space. The tally mark says
 * what the product *does* in one glyph, and it's culturally rooted without
 * being language-specific.
 */
export type LogoMarkProps = {
  size?: number;
  /** Override the gradient with a single brand color (e.g. monochrome contexts) */
  color?: string;
  /** Color of the tally strokes */
  foreground?: string;
  /** Corner radius as a fraction of size (default 0.26 — iOS continuous-corner feel) */
  radiusRatio?: number;
  /** Hide the gradient tile and render strokes only (for headers on solid backgrounds) */
  bare?: boolean;
};

export function LogoMark({
  size = 96,
  color,
  foreground = '#FFFFFF',
  radiusRatio = 0.26,
  bare = false,
}: LogoMarkProps) {
  const rx = 100 * radiusRatio;
  const useGradient = !color;
  const tileFill = useGradient ? 'url(#kb-brand)' : color;

  // Tally geometry on a 100×100 canvas — four verticals + diagonal cross
  // Optical-centered: tally occupies x:22→78, y:24→76 (56×52 box, slight asymmetry
  // pulls the diagonal anchor down-left for natural handwriting feel).
  const stroke = 8;
  const top = 26;
  const bot = 70;
  const xs = [28, 42, 56, 70];

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="kb-brand" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FF6B00" />
          <Stop offset="1" stopColor="#FF8C38" />
        </LinearGradient>
      </Defs>

      {!bare ? (
        <Rect x={0} y={0} width={100} height={100} rx={rx} ry={rx} fill={tileFill} />
      ) : null}

      <G stroke={foreground} strokeWidth={stroke} strokeLinecap="round">
        {xs.map((x) => (
          <Line key={x} x1={x} y1={top} x2={x} y2={bot} />
        ))}
        {/* Diagonal slash — anchored slightly outside the verticals for visual weight */}
        <Line x1={22} y1={70} x2={78} y2={26} />
      </G>
    </Svg>
  );
}
