type Orientation = 'vertical' | 'horizontal';

interface Card {
  id: string;
  lowNum: string;
  uprightFor: Orientation;
}

export interface Group {
  number: number;
  cards: {
    [x: number]: (null | Card)[];
  };
}

function getNewGroupNumber() {
  // TODO: actual implementation
  return 5;
}

// TODO: calculation for more than one card
export function createNewGroup(
  orientation: Orientation,
  ...cards: Card[]
): Group {
  const group = {
    number: getNewGroupNumber(),
    cards: {},
  };
  if (cards.length === 1) {
    group.cards[0] = cards[0];
  } else {
    // orientation and then calculate how to put the cards in order
  }

  return group;
}

export function getConnectingCardNums(cardNum: string) {
  // start with the number
  let belowNum = String(parseInt(cardNum) - 1);
  if (belowNum.length < 2) belowNum = '0' + belowNum;
  let aboveNum = String(parseInt(cardNum) + 1);
  if (aboveNum.length < 2) aboveNum = '0' + aboveNum;

  return [belowNum, aboveNum];
}

interface ConnectingCardLocation {
  group: Group;
  card: Card;
  connection: {
    card: Card;
    rowIndex: number;
    columnIndex: number;
  };
  orientation: Orientation;
}

// TODO: for more complex groups
export function connectCardToGroup({
  group,
  card,
  connection,
  orientation,
}: ConnectingCardLocation) {
  if (orientation === 'vertical') {
    // TODO: compare based on horizontal/vertical orientation
    // if the number of the card we are adding is greater than the card we are connecting to, it will go at the end of the group
    const connectAtEnd =
      parseInt(card.lowNum) > parseInt(connection.card.lowNum);

    for (let i = 0; i < Object.keys(group.cards).length; i++) {
      const itemToAdd = i === connection.columnIndex ? card : null;
      if (connectAtEnd) {
        group.cards[i].splice(connection.rowIndex + 1, 0, itemToAdd);
      } else {
        group.cards[i].splice(connection.rowIndex, 0, itemToAdd);
      }
    }
  }
}
