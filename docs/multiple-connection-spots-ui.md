# Design note: letting the player choose among multiple valid connection spots

## Status

Decided (issue #34): build **Option A — highlight & click**. Ghost previews
(Option C) are the preferred long-term direction, out of scope for this issue.

## Problem

A played card can often legally connect to more than one card in the current
group (its shown number ±1 may match several cards, and a merge may be
possible at several pairs). Today the client auto-picks the *first* match its
scan finds (`getConnection` in `source/client/getConnection.ts`), so the
player never chooses — even though different connection points produce
different layouts, and layout determines group width/height, which is exactly
what scores.

Two client call sites auto-pick:

- `placeCard` — playing a card from hand/adrift onto the current group; the
  connection is entirely auto-picked.
- `mergeGroups` — the other-group side is the player's click, but the
  current-group side is auto-picked.

Note: a group cannot contain two cards showing the same number (each shown
number belongs to exactly one physical card), so for a given number the
candidates are at most the card showing N−1 and the card showing N+1 — both
can coexist in one group only when the opponent's cross-orientation rows bend
the group around. Ambiguity is therefore rare but real, and at most **two**
candidates exist per choice.

## What the server already supports

Since ADR 0001, every submitted move carries an **explicit connection**
(`connection: {cardId, x, y}`), and the server validates that the claimed
connection is *any* rules-valid one — it does not insist on the first-match
scan result. So a UI that lets the player pick among valid spots requires
**no server changes**: it only needs to put the chosen connection into the
move it already sends.

## Options considered

Interactive mockups: [`docs/mockups/connection-choice-mockups.html`](./mockups/connection-choice-mockups.html)
(open the file in a browser; all three demos use the board from issue #34,
where the two merge choices produce a 4-wide vs 3-wide group).

- **A. Highlight & click a card** *(chosen for issue #34)* — when more than
  one valid connection exists, every candidate card pulses as selectable and
  the player clicks one. Reuses the existing selectable-card interaction that
  merges already use; smallest change.
- **B. Confirmation dialog** — modal listing the choices with resulting
  dimensions. Explicit but interrupts board flow; rejected.
- **C. Ghost previews** — dashed ghosts of the incoming card/group rendered
  at each valid landing spot; the player clicks the ghost. Clearest (the
  resulting shape, and therefore the score, is visible before committing).
  **Preferred future direction — potentially for *all* connections, not just
  ambiguous ones** — but requires the board to render ghost/empty cells, a
  bigger rendering change than issue #34 warrants.

## Behaviour (Option A)

1. When a card is selected to play, compute *all* valid connections instead
   of the first: iterate the current group exactly like `getConnection` but
   collect every match (a `getConnections` variant).
2. If there is exactly one, behave as today — no extra prompt.
3. If there are several, highlight each candidate card and prompt the player
   to click one; the click supplies the `connection` for the recorded
   `placeCard` move (same flow for the current-group side of a merge).
4. Local rendering keeps using `connectCardToGroup` with the chosen
   connection, which already accepts an arbitrary connection argument.

## Decisions

- **Dedupe by landing cell.** Valid connections are grouped by the cell the
  played card would land in; the player is only prompted when there is more
  than one distinct landing cell. Two connections that place the card in the
  same cell (e.g. a 21 played between a 20 and a 22 one cell apart) are one
  choice — any of their connections may be sent, all are rules-valid.
- **Merge ambiguity resolves with a second highlight step.** Clicking a card
  in the other group fixes that side; if the merge then has more than one
  distinct result (the current group contains candidates that produce
  different layouts), the candidate cards in the current group are
  highlighted and the player clicks one to commit. When only one result
  exists, the merge commits on the first click exactly as today.
- **Physical validity is part of this issue, on both sides.** A connection
  that matches numerically can still be impossible: `connectCardToGroup`
  silently drops (vertical) or mislays (horizontal) a card whose landing
  cell is occupied, and `connectGroups` overwrites cards when the two groups
  overlap — in both the TS and PHP implementations. In scope for #34:
  - Client: `getConnections` never offers a candidate whose landing cell is
    occupied; a merge landing that overlaps is never highlighted.
  - Server: `MoveValidator` rejects a `placeCard` whose landing cell is
    occupied and a `mergeGroups` whose groups would overlap, instead of
    corrupting the board.
- **The choosing state keeps the existing "Restart turn" escape hatch**; no
  new cancel machinery.

## Implementation sketch (issue #34)

1. `source/client/getConnections.ts` — enumerate all valid connections for a
   card against a group (same scan as `getConnection`, collecting matches),
   compute each candidate's landing cell, drop occupied ones, dedupe by
   landing cell. Unit tests alongside (`getConnections.spec.ts`).
2. `source/client/tethergame.ts` — new client state
   (`choosingConnectionSpot`): entered from `handleChooseCardToPlay`
   (placeCard) or `handleConnectGroup` (merge, current-group side) when
   `getConnections` returns >1 candidate; highlights candidate cards in the
   current group; the click supplies the explicit connection for the recorded
   move. Exactly one candidate short-circuits to today's behaviour.
3. Merge overlap check — during `connectGroups` overlay (TS + PHP), detect a
   cell written twice and treat that candidate as invalid (client: not
   offered; server: rejected).
4. `modules/php/BoardLogic.php` / `MoveValidator.php` — reject occupied
   landing cells for `placeCard` and overlapping merges, with PHPUnit tests
   (run via Docker `composer:2` image).
5. `getConnection.ts` becomes a thin wrapper over `getConnections` (or is
   removed) so the two scans cannot drift apart.
