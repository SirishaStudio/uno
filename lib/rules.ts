import { Card, CardColor } from "./types";

export function canPlayCard(card: Card, topColor: CardColor, top: Card): boolean {
  if (card.color === "wild") return true;
  if (card.color === topColor) return true;
  if (top.kind === "number" && card.kind === "number") return card.value === top.value;
  if (top.kind !== "number" && card.kind === top.kind) return true;
  return false;
}
