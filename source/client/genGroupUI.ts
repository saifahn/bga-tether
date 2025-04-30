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

interface Connection {
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
        group.cards[i].splice(connection.x + 1, 0, itemToAdd);
      } else {
        group.cards[i].splice(connection.x, 0, itemToAdd);
      }
    }
    return;
  }

  const numRows = group.cards[0].length;

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
    group.cards[i] = group.cards[i - 1];
  }
}

interface ConnectGroupsArgs {
  smallerGroup: {
    group: Group;
    connection: Connection;
  };
  largerGroup: {
    group: Group;
    connection: Connection;
  };
  orientation: Orientation;
}

export function connectGroups({
  smallerGroup,
  largerGroup,
  orientation,
}: ConnectGroupsArgs) {
  // take the first group
  // take the second group
  if (orientation === 'vertical') {
    if (
      smallerGroup.group.cards[smallerGroup.connection.x]?.[
        smallerGroup.connection.y
      ]?.id !== smallerGroup.connection.card.id ||
      largerGroup.group.cards[largerGroup.connection.x]?.[
        largerGroup.connection.y
      ]?.id !== largerGroup.connection.card.id
    ) {
      throw new Error('The connecting card details are not correct');
    }
    // TODO: needs to actually calculate based on uprightFor value
    const finalGroupNum = Math.min(
      smallerGroup.group.number,
      largerGroup.group.number
    );
    const numberOfColumnsAboveGroup = Object.keys(
      smallerGroup.group.cards
    ).length;
    const numberOfColumnsBelowGroup = Object.keys(
      largerGroup.group.cards
    ).length;
    const numberOfRowsAboveGroup = smallerGroup.group.cards[0].length;
    const numberOfRowsBelowGroup = largerGroup.group.cards[0].length;
    // get offset of the below group
    // TODO: handle case where offset is negative
    const offset = smallerGroup.connection.x - largerGroup.connection.x;

    // TODO: need to get number of rows of both groups to fill in nulls both on top and bottom
    // TODO: this actually needs to be calculated after shifting if necessary
    const finalGroupWidth = Math.max(
      numberOfColumnsAboveGroup,
      numberOfColumnsBelowGroup
    );
    let newCards = {};

    for (let i = 0; i < finalGroupWidth; i++) {
      newCards[i] = smallerGroup.group.cards[i];

      const lowerGroupCards = largerGroup.group.cards[i - offset]
        ? largerGroup.group.cards[i - offset]
        : new Array(numberOfRowsBelowGroup).fill(null);

      newCards[i] = newCards[i].concat(lowerGroupCards);
      continue;
    }

    return {
      number: finalGroupNum,
      cards: newCards,
    };
  }
}
