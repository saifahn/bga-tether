import { Card, Group } from './connectCardToGroup';
import { getConnectingNumbers } from './getConnectingNumbers';

export function getConnection(card: Card, group: Group) {
  const numToConnect =
    card.uprightFor === 'vertical'
      ? card.lowNum
      : card.lowNum.split('').toReversed().join('');
  const possibleNumbers = getConnectingNumbers(numToConnect);
  // iterate through each column and row
  for (const x in group.cards) {
    for (let y = 0; y < group.cards[x]!.length; y++) {
      const card = group.cards[x]![y]!;
      const uprightNum =
        card.uprightFor === 'vertical'
          ? card.lowNum
          : card.lowNum.split('').toReversed().join('');
      if (possibleNumbers.includes(uprightNum)) {
        return { x: parseInt(x, 10), y };
      }
    }
  }
  // TODO: handle case where it is not present
}
