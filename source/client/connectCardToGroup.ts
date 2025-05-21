export type Orientation = 'vertical' | 'horizontal';

export interface Card {
  id: string;
  lowNum: string;
  uprightFor: Orientation;
}

export interface Group {
  number: number; // incremental number to keep track of the groups
  cards: {
    [x: number]: (null | Card)[];
  };
}

export interface Connection {
  card: Card;
  x: number;
  y: number;
}

interface ConnectingCardLocation {
  group: Group;
  card: Card;
  connection: Connection;
  orientation: Orientation;
}

export function connectCardToGroup({
  group,
  card,
  connection,
  orientation,
}: ConnectingCardLocation) {
  // if the number of the card we are adding is greater than the card we are connecting to, it will go at the end of the row or column
  // TODO: needs to actually calculate based on uprightFor value
  const connectAtEnd = parseInt(card.lowNum) > parseInt(connection.card.lowNum);
  const numCols = Object.keys(group.cards).length;

  if (group.cards[connection.y]?.[connection.x]?.id !== connection.card.id) {
    throw new Error('The connecting card details are not correct');
  }

  if (orientation === 'vertical') {
    for (let i = 0; i < numCols; i++) {
      const itemToAdd = i === connection.y ? card : null;
      if (connectAtEnd) {
        group.cards[i]?.splice(connection.x + 1, 0, itemToAdd);
      } else {
        group.cards[i]?.splice(connection.x, 0, itemToAdd);
      }
    }
    return;
  }

  const numRows = group.cards[0]!.length;

  if (connectAtEnd) {
    group.cards[numCols] = [];
    for (let i = 0; i < numRows; i++) {
      const itemToAdd = i === connection.x ? card : null;
      group.cards[numCols].push(itemToAdd);
    }
    return;
  }
  // if adding at the beginning of the row, we need to shift all the other columns to the right
  for (let i = numCols; i >= 0; i--) {
    if (i === 0) {
      group.cards[0] = [];
      for (let i = 0; i < numRows; i++) {
        const itemToAdd = i === connection.x ? card : null;
        group.cards[0].push(itemToAdd);
      }
      continue;
    }
    group.cards[i] = group.cards[i - 1]!;
  }
}
