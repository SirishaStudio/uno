---
name: isCardPlayable drawn-card logic
description: How the drawn-card playability check must be structured in GamePage
---

When a player draws a card, the server sets `drawnCardId` and `canPlayDrawnCard`. The client's `isCardPlayable()` must handle this correctly:

**Correct logic (as fixed):**
```ts
if (game.drawnCardId) {
  if (card.id !== game.drawnCardId) return false;   // not the drawn card
  if (!game.canPlayDrawnCard) return false;          // drawn card doesn't match
}
```

**Bug that was there:** `if (!game.canPlayDrawnCard && game.drawnCardId === card.id) return true;` — backwards: returned true (playable) when the card was NOT playable.

**Why:** `canPlayDrawnCard=false` means the drawn card does NOT match current color/value. Returning true allowed illegal plays that the server would reject with an error toast.
