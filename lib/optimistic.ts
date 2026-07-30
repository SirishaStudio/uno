import { Card, CardColor, Player, PublicGameState } from "./types";

function stepIndex(players: Player[], idx: number, direction: 1 | -1): number {
  const n = players.length;
  if (n === 0) return idx;
  let i = idx;
  let guard = 0;
  do {
    i = ((i + direction) % n + n) % n;
    guard++;
  } while (!players[i]?.connected && guard <= n);
  return i;
}

/** Predicts the result of playing `card`. Mirrors gameEngine.playCard's turn
 * math closely enough for instant feedback; the server's next broadcast is
 * always the source of truth and silently replaces this prediction. */
export function predictPlayCard(
  pub: PublicGameState,
  hand: Card[],
  playerId: string,
  card: Card,
  chosenColor?: CardColor
): { state: PublicGameState; hand: Card[] } {
  const players = pub.players.map((p) => ({ ...p }));
  const selfIdx = players.findIndex((p) => p.id === playerId);
  if (selfIdx === -1) return { state: pub, hand };

  const newHand = hand.filter((c) => c.id !== card.id);
  const newColor = card.color === "wild" ? chosenColor ?? pub.currentColor : card.color;

  let direction = pub.direction;
  if (card.kind === "reverse") direction = direction === 1 ? -1 : 1;

  const connectedCount = players.filter((p) => p.connected).length;
  const twoPlayer = connectedCount === 2;

  let steps = 1;
  if (card.kind === "skip") steps = 2;
  else if (card.kind === "reverse") steps = twoPlayer ? 2 : 1;
  else if (card.kind === "draw2" || card.kind === "wild4") steps = 2;

  let hitIdx: number | null = null;
  if (card.kind === "draw2" || card.kind === "wild4") {
    hitIdx = stepIndex(players, selfIdx, direction);
  }

  let nextIdx = selfIdx;
  for (let i = 0; i < steps; i++) nextIdx = stepIndex(players, nextIdx, direction);

  players[selfIdx] = {
    ...players[selfIdx],
    handCount: newHand.length,
    saidUno: newHand.length === 1 ? false : players[selfIdx].saidUno,
  };

  let drawPileCount = pub.drawPileCount;
  if (hitIdx !== null && players[hitIdx]) {
    const dealt = card.kind === "wild4" ? 4 : 2;
    drawPileCount = Math.max(0, drawPileCount - dealt);
    players[hitIdx] = { ...players[hitIdx], handCount: players[hitIdx].handCount + dealt };
  }

  const roundOver = newHand.length === 0;

  const state: PublicGameState = {
    ...pub,
    players,
    direction,
    currentColor: newColor ?? pub.currentColor,
    discardTop: card,
    drawPileCount,
    currentPlayerId: roundOver ? pub.currentPlayerId : players[nextIdx]?.id ?? pub.currentPlayerId,
    hasDrawnThisTurn: false,
    turnDeadline: null,
    vulnerableToUnoCallout:
      newHand.length === 1
        ? [...pub.vulnerableToUnoCallout.filter((id) => id !== playerId), playerId]
        : pub.vulnerableToUnoCallout.filter((id) => id !== playerId),
  };

  return { state, hand: newHand };
}

/** Draw prediction can't know the drawn card's identity (private to the
 * server), so it only locks the UI instantly rather than mutating the hand. */
export function predictDrawCard(pub: PublicGameState): PublicGameState {
  return {
    ...pub,
    hasDrawnThisTurn: true,
    drawPileCount: Math.max(0, pub.drawPileCount - 1),
    turnDeadline: null,
  };
}
