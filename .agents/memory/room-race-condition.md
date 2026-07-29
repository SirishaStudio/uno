---
name: Room create/join race condition
description: Server emits ROOM_STATE before the ack; client must register listener first
---

In roomHandlers.ts, `broadcastState(io, code)` is always called BEFORE `ack?.({ ok: true })`. Over the same TCP connection, ROOM_STATE arrives at the client before the ack callback fires. The old code added the one-shot ROOM_STATE listener only after the ack resolved → event was missed → 5-second timeout.

**Fix applied:** In `RoomContext.tsx` `createRoom` and `joinRoom`, the one-shot ROOM_STATE listener is now registered BEFORE emitting the socket event. The emitAck promise runs in parallel; if it fails, the listener and timeout are cleaned up.

**Why:** Socket.io events and acks travel over the same ordered TCP stream. Register listeners before sending to avoid missed events.

**How to apply:** Any socket flow where server emits event + then sends ack → always register the event listener before calling emit on the client side.
