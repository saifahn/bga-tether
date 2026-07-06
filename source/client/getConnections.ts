import {
  Card,
  Connection,
  Group,
  Orientation,
  getLandingCell,
  shownNum,
} from './connectCardToGroup';
import { getConnectingNumbers } from './getConnectingNumbers';

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
