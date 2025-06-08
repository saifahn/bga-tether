import { Card, Group, Orientation } from './connectCardToGroup';
import { getConnectingNumbers } from './getConnectingNumbers';

/**
 * Finds the connection in the given group that will connect with the given card.
 */
export function getConnection(
  card: Card,
  group: Group,
  orientation: Orientation
) {
  const numToConnect =
    card.uprightFor === orientation
      ? card.lowNum
      : card.lowNum.split('').toReversed().join('');
  const possibleNumbers = getConnectingNumbers(numToConnect);
  // iterate through each column and row
  for (const x in group.cards) {
    for (let y = 0; y < group.cards[x]!.length; y++) {
      const card = group.cards[x]![y]!;
      if (card === null) {
        continue;
      }

      const uprightNum =
        card.uprightFor === orientation
          ? card.lowNum
          : card.lowNum.split('').toReversed().join('');
      if (possibleNumbers.includes(uprightNum)) {
        return { card, x: parseInt(x, 10), y };
      }
    }
  }
  throw new Error('the card is not a valid option to connect to the group');
}
