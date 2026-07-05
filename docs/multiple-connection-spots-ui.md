# Design note: letting the player choose among multiple valid connection spots

## Status

Planned. The server-side groundwork already exists; this documents what the
client needs when we build it.

## Problem

A played card can often legally connect to more than one card in the current
group (its shown number ±1 may match several cards, and a merge may be
possible at several pairs). Today the client auto-picks the *first* match its
scan finds (`getConnection` in `source/client/getConnection.ts`), so the
player never chooses — even though different connection points produce
different layouts, and layout determines group width/height, which is exactly
what scores.

## What the server already supports

Since ADR 0001, every submitted move carries an **explicit connection**
(`connection: {cardId, x, y}`), and the server validates that the claimed
connection is *any* rules-valid one — it does not insist on the first-match
scan result. So a UI that lets the player pick among valid spots requires
**no server changes**: it only needs to put the chosen connection into the
move it already sends.

## Client sketch

1. When a card is selected to play, compute *all* valid connections instead
   of the first: iterate the current group exactly like `getConnection` but
   collect every match (a `getConnections` variant).
2. If there is exactly one, behave as today.
3. If there are several, highlight each candidate cell and ask the player to
   click one; the click supplies the `connection` for the recorded
   `placeCard` move (same flow for merge connection pairs).
4. Local rendering keeps using `connectCardToGroup` with the chosen
   connection, which already accepts an arbitrary connection argument.

## Open questions

- Should candidates that lead to identical layouts be collapsed?
- Merge moves have two connection choices (one per group); the UI needs an
  interaction for choosing the pair, or can enumerate valid pairs.
