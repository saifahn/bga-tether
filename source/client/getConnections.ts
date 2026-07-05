import { Card, Connection, Group, Orientation } from './connectCardToGroup';
import { getConnectingNumbers } from './getConnectingNumbers';

function shownNum(card: Card, orientation: Orientation): string {
  return card.uprightFor === orientation
    ? card.lowNum
    : card.lowNum.split('').toReversed().join('');
}

/**
 * Finds every card in the group whose shown number connects to the given
 * card's shown number, in scan order. Unlike getConnection, collects every
 * match instead of returning only the first.
 */
export function findMatchingConnections(
  card: Card,
  group: Group,
  orientation: Orientation
): Connection[] {
  const possibleNumbers = getConnectingNumbers(shownNum(card, orientation));
  const matches: Connection[] = [];

  for (const x in group.cards) {
    for (let y = 0; y < group.cards[x]!.length; y++) {
      const groupCard = group.cards[x]![y]!;
      if (groupCard === null) {
        continue;
      }
      if (possibleNumbers.includes(shownNum(groupCard, orientation))) {
        matches.push({ card: groupCard, x: parseInt(x, 10), y });
      }
    }
  }

  return matches;
}

/**
 * The grid cell the given card would land in for the given connection, i.e.
 * directly on the far side of the connection card (see CONTEXT.md's
 * "Landing Cell" definition). Mirrors the placement math in
 * connectCardToGroup without mutating anything.
 */
export function getLandingCell(
  card: Card,
  connection: Connection,
  orientation: Orientation
): { x: number; y: number } {
  const cardNumShown = parseInt(shownNum(card, orientation), 10);
  const connectionCardNumShown = parseInt(
    shownNum(connection.card, orientation),
    10
  );
  const connectAfter = connectionCardNumShown > cardNumShown;

  if (orientation === 'vertical') {
    return {
      x: connection.x,
      y: connectAfter ? connection.y + 1 : connection.y - 1,
    };
  }
  return {
    x: connectAfter ? connection.x + 1 : connection.x - 1,
    y: connection.y,
  };
}

function isLandingCellOccupied(
  group: Group,
  landingCell: { x: number; y: number }
): boolean {
  return !!group.cards[landingCell.x]?.[landingCell.y];
}

export interface ConnectionCandidate {
  connection: Connection;
  landingCell: { x: number; y: number };
}

/**
 * Enumerates every valid, physically possible connection for the given card
 * against the group: every matching card (getConnection would only return
 * the first), with any candidate whose landing cell is already occupied
 * dropped, and the rest deduped by landing cell (see the "Dedupe by landing
 * cell" decision in docs/multiple-connection-spots-ui.md).
 */
export function getConnections(
  card: Card,
  group: Group,
  orientation: Orientation
): ConnectionCandidate[] {
  const matches = findMatchingConnections(card, group, orientation);

  const candidates: ConnectionCandidate[] = [];
  const seenLandingCells = new Set<string>();

  for (const connection of matches) {
    const landingCell = getLandingCell(card, connection, orientation);
    if (isLandingCellOccupied(group, landingCell)) {
      continue;
    }
    const key = `${landingCell.x},${landingCell.y}`;
    if (seenLandingCells.has(key)) {
      continue;
    }
    seenLandingCells.add(key);
    candidates.push({ connection, landingCell });
  }

  return candidates;
}
