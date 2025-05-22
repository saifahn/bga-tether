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

  const cardNumShown =
    card.uprightFor === orientation
      ? parseInt(card.lowNum)
      : parseInt(card.lowNum.split('').reverse().join(''));
  const connectionCardNumShown =
    card.uprightFor === orientation
      ? parseInt(connection.card.lowNum)
      : parseInt(connection.card.lowNum.split('').reverse().join(''));

  const numCols = Object.keys(group.cards).length;

  if (group.cards[connection.x]?.[connection.y]?.id !== connection.card.id) {
    throw new Error('The connecting card details are not correct');
  }

  if (orientation === 'vertical') {
    for (let i = 0; i < numCols; i++) {
      // i is equal to x when we are in the right column/x coordinate
      const itemToAdd = i === connection.x ? card : null;
      const connectAtEnd = cardNumShown > connectionCardNumShown;
      if (connectAtEnd) {
        group.cards[i]?.splice(connection.y + 1, 0, itemToAdd);
      } else {
        group.cards[i]?.splice(connection.y, 0, itemToAdd);
      }
    }
    return;
  }

  const numRows = group.cards[0]!.length;

  // the data will represent the vertical player's view, so we need to flip
  // everything when calculating for connecting horizontally
  const connectAtEnd = connectionCardNumShown > cardNumShown;

  if (connectAtEnd) {
    group.cards[numCols] = [];
    for (let i = 0; i < numRows; i++) {
      // i is equal to y when we are in the correct row to add the card
      const itemToAdd = i === connection.y ? card : null;
      group.cards[numCols].push(itemToAdd);
    }
    return;
  }
  // if adding at the beginning of the row, we need to shift all the other columns to the right
  for (let i = numCols; i >= 0; i--) {
    if (i === 0) {
      group.cards[0] = [];
      for (let i = 0; i < numRows; i++) {
        const itemToAdd = i === connection.y ? card : null;
        group.cards[0].push(itemToAdd);
      }
      continue;
    }
    group.cards[i] = group.cards[i - 1]!;
  }
}
