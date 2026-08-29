/**
 * Geometric backdrop for the Live Wall — the MIS Night background artwork:
 * three oversized triangles in the four-tone greyscale, bleeding off-canvas.
 */

export const WALL_BG = "/assets/misnight/mis_bg.svg";

export const WALL_PALETTE = {
  ground: "#000000",
  shade: "#1c1c1c",
  mid: "#272727",
  edge: "#363636",
} as const;

export default function WallBackdrop() {
  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      style={{
        backgroundColor: WALL_PALETTE.ground,
        backgroundImage: `url(${WALL_BG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      aria-hidden
    />
  );
}
