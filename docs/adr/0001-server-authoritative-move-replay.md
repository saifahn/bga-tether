# ADR 0001: Server-authoritative move replay

Date: 2026-07-05
Status: Accepted

## Context

Move legality was originally computed only on the client (for velocity of
implementation — see issue #26). `actConnectAstronauts` accepted the entire
client-computed successor board state and wrote it to the database unchecked,
so a crafted HTTP request could produce any board whatsoever.

Three remedies were considered:

1. **Validate the submitted successor state**: diff the DB state against the
   client's state and check the diff is a legal move. Least client churn, but
   "is this a legal successor?" is harder to get right than recomputing, and
   subtle illegal states can slip through the diff logic.
2. **Server recomputes from a minimal move description** (chosen): the client
   sends an ordered move list (`startGroup` / `placeCard` / `mergeGroups`);
   the server replays it with PHP ports of the client rule functions and
   writes the state *it* computed. Illegal states become unrepresentable.
3. **Hybrid**: send both and compare — belt-and-braces but permanent
   duplication.

## Decision

The server is authoritative. `MoveValidator::replayConnectMoves` replays the
submitted move list against DB state using `BoardLogic` (PHP ports of
`getConnectingNumbers` / `getConnection` / `connectCardToGroup` /
`connectGroups`), and any violation throws a `BgaUserException`, failing the
action atomically. `actSetAdrift` is validated the same way.

Each move names its **explicit connection** (card id + coordinates), and the
server accepts **any rules-valid connection**, not just the one the current
client UI auto-derives (first-match scan). This deliberately keeps the rules
independent of a client implementation detail and permits a future UI where
the player chooses among multiple valid connection spots
(see docs/multiple-connection-spots-ui.md).

## Consequences

- The client's rule code remains, for optimistic local rendering only; the
  shared JSON fixtures in `tests/fixtures/moves/` are run by both the uvu
  specs (`source/client/fixtures.spec.ts`) and PHPUnit
  (`tests/Unit/BoardLogicTest.php`) so the two implementations cannot drift
  silently.
- The PHP port is deliberately stricter in two spots the TS code mishandles
  silently: placing onto an occupied cell and overlapping group merges are
  rejected (fixture cases marked `phpOnly`).
- Server and client may legitimately compute different layouts for the "same"
  cards if a client ever submits a different valid connection than it renders
  locally; the server's layout is the truth and the client re-syncs from
  notifications/refresh.
