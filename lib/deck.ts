import { Card, CardColor, GameMode } from "./types";

const COLORS: CardColor[] = ["red", "yellow", "green", "blue"];

let counter = 0;
function nextId(): string {
  counter += 1;
  return `c${Date.now().toString(36)}${counter.toString(36)}`;
}

function numberCard(color: CardColor, value: number): Card {
  return { id: nextId(), color, kind: "number", value };
}
function actionCard(color: CardColor, kind: "skip" | "reverse" | "draw2"): Card {
  return { id: nextId(), color, kind };
}
function wildCard(kind: "wild" | "wild4"): Card {
  return { id: nextId(), color: "wild", kind };
}

/**
 * Builds a deck. In "normal" mode this is the standard 108-card UNO deck.
 * In "wild" mode, extra wild / wild-draw-four cards are mixed in based on
 * a host-tunable intensity (0-3), replacing some higher number cards so the
 * deck size stays reasonable rather than becoming fully chaotic.
 */
export function buildDeck(mode: GameMode, wildIntensity: number): Card[] {
  const cards: Card[] = [];

  for (const color of COLORS) {
    cards.push(numberCard(color, 0));
    for (let v = 1; v <= 9; v++) {
      cards.push(numberCard(color, v));
      cards.push(numberCard(color, v));
    }
    cards.push(actionCard(color, "skip"));
    cards.push(actionCard(color, "skip"));
    cards.push(actionCard(color, "reverse"));
    cards.push(actionCard(color, "reverse"));
    cards.push(actionCard(color, "draw2"));
    cards.push(actionCard(color, "draw2"));
  }

  for (let i = 0; i < 4; i++) cards.push(wildCard("wild"));
  for (let i = 0; i < 4; i++) cards.push(wildCard("wild4"));

  if (mode === "wild" && wildIntensity > 0) {
    // Each intensity step adds 4 wild + 4 wild4, removing an equal number
    // of high-value number cards (8s and 9s) so the pile doesn't balloon.
    const extraPerStep = 4;
    const clampedIntensity = Math.min(3, Math.max(1, wildIntensity));

    for (let step = 0; step < clampedIntensity; step++) {
      for (let i = 0; i < extraPerStep; i++) cards.push(wildCard("wild"));
      for (let i = 0; i < extraPerStep; i++) cards.push(wildCard("wild4"));

      let removed = 0;
      for (let idx = cards.length - 1; idx >= 0 && removed < extraPerStep * 2; idx--) {
        const c = cards[idx];
        if (c.kind === "number" && (c.value === 8 || c.value === 9)) {
          cards.splice(idx, 1);
          removed++;
        }
      }
    }
  }

  return shuffle(cards);
}

export function shuffle<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function cardPoints(card: Card): number {
  if (card.kind === "number") return card.value ?? 0;
  if (card.kind === "skip" || card.kind === "reverse" || card.kind === "draw2") return 20;
  return 50; // wild, wild4
}
