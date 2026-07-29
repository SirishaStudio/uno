import { Card as CardType } from "@/lib/types";

function label(card: CardType): string {
  if (card.kind === "number") return String(card.value);
  if (card.kind === "skip") return "SKIP";
  if (card.kind === "reverse") return "REV";
  if (card.kind === "draw2") return "+2";
  if (card.kind === "wild") return "WILD";
  return "+4";
}

const sizeMap = {
  sm: "w-11 h-16 text-lg",
  md: "w-16 h-24 text-2xl",
  lg: "w-20 h-28 text-3xl",
  xl: "w-24 h-36 text-4xl",
} as const;

export function UnoCard({
  card,
  size = "md",
  onClick,
  disabled,
  selected,
  className = "",
}: {
  card: CardType;
  size?: keyof typeof sizeMap;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick || disabled}
      data-color={card.color}
      className={`uno-card shrink-0 ${sizeMap[size]} ${
        disabled ? "opacity-35 saturate-50" : onClick ? "active:scale-95 hover:-translate-y-1.5" : ""
      } ${selected ? "-translate-y-3 ring-2 ring-white/70" : ""} transition-transform duration-150 ${className}`}
      aria-label={`${card.color} ${label(card)}`}
    >
      <span className="pt-1 tracking-tight text-white/95">{label(card)}</span>
    </button>
  );
}

export function CardBack({ size = "md", className = "" }: { size?: keyof typeof sizeMap; className?: string }) {
  return <div className={`uno-card-back shrink-0 ${sizeMap[size]} ${className}`} />;
}
