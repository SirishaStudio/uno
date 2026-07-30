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
  lg: "w-[4.5rem] h-[6.75rem] text-3xl",
  xl: "w-24 h-36 text-4xl md:w-28 md:h-40 md:text-5xl",
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
  const interactive = !!onClick;
  return (
    <div className={`card-scene shrink-0 ${sizeMap[size]} ${className}`}>
      <button
        type="button"
        onClick={onClick}
        disabled={!interactive || disabled}
        data-color={card.color}
        className={`uno-card w-full h-full ${interactive ? "is-interactive" : ""} ${
          selected ? "is-selected" : ""
        } ${disabled ? "opacity-35 saturate-50" : ""}`}
        aria-label={`${card.color} ${label(card)}`}
      >
        <span className="pt-1 tracking-tight text-white/95 [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]">
          {label(card)}
        </span>
      </button>
    </div>
  );
}

export function CardBack({ size = "md", className = "" }: { size?: keyof typeof sizeMap; className?: string }) {
  return (
    <div className={`card-scene shrink-0 ${sizeMap[size]} ${className}`}>
      <div className="uno-card-back w-full h-full" />
    </div>
  );
}
