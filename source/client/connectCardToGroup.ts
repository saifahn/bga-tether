export type Orientation = 'vertical' | 'horizontal';

export interface Card {
  id: string;
  lowNum: string;
  uprightFor: Orientation;
}

export interface Group {
  id: string;
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
  const cardNumShown =
    card.uprightFor === orientation
      ? parseInt(card.lowNum)
      : parseInt(card.lowNum.split('').reverse().join(''));
  const connectionCardNumShown =
    connection.card.uprightFor === orientation
      ? parseInt(connection.card.lowNum)
      : parseInt(connection.card.lowNum.split('').reverse().join(''));

  const numCols = Object.keys(group.cards).length;

  if (group.cards[connection.x]?.[connection.y]?.id !== connection.card.id) {
    throw new Error('The connecting card details are not correct');
  }

  if (orientation === 'vertical') {
    for (let i = 0; i < numCols; i++) {
      // i is equal to x when we are in the right column/x coordinate
      // in that column, we'll add the card, but for each other column we also
      // need to add a null to balance the rows
      if (!group.cards[i]) {
        throw new Error(
          "something has gone wrong - cards for the column don't exist for some reason"
        );
      }
      const itemToAdd = i === connection.x ? card : null;
      const connectAfter = cardNumShown > connectionCardNumShown;
      // We want to replace a null if it is present where we are inserting
      // the new card - it is an empty space that we can fill.
      const itemAdjacentToConnectionIndex =
        group.cards[i]![connectAfter ? connection.y + 1 : connection.y - 1];

      if (itemAdjacentToConnectionIndex === null) {
        group.cards[i]![connectAfter ? connection.y + 1 : connection.y - 1] =
          itemToAdd;
      } else if (itemAdjacentToConnectionIndex === undefined) {
        if (connectAfter) {
          group.cards[i]?.push(itemToAdd);
        } else {
          group.cards[i]?.unshift(itemToAdd);
        }
      }
    }
    return;
  }

  const numRows = group.cards[0]!.length;

  // the data will represent the vertical player's view, so we need to flip
  // everything when calculating for connecting horizontally
  const connectAfter = connectionCardNumShown > cardNumShown;

  if (connectAfter) {
    // if the place where we want to add the card is a null, the column already
    // exists and can be replaced with the card we want

    if (group.cards[connection.x + 1]?.[connection.y] === null) {
      group.cards[connection.x + 1]![connection.y] = card;
      return;
    }
    group.cards[numCols] = [];
    for (let i = 0; i < numRows; i++) {
      // i is equal to y when we are in the correct row to add the card
      const itemToAdd = i === connection.y ? card : null;
      group.cards[numCols].push(itemToAdd);
    }
    return;
  }

  if (group.cards[connection.x - 1]?.[connection.y] === null) {
    group.cards[connection.x - 1]![connection.y] === card;
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
