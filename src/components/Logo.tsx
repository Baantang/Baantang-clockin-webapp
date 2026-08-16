export default function Logo({ size = 44 }: { size?: number }) {
  return (
    <div
      className="rounded-2xl flex items-center justify-center font-bold text-white shrink-0"
      style={{
        width: size,
        height: size,
        background: "#FFA726",
        fontSize: size * 0.42,
        letterSpacing: "-0.02em",
      }}
      aria-hidden="true"
    >
      BT
    </div>
  );
}
