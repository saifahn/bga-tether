type Orientation = 'vertical' | 'horizontal';

interface Card {
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

function getNewGroupNumber() {
  // TODO: actual implementation
  return 5;
}

// TODO: calculation for more than one card
export function createNewGroup(
  orientation: Orientation,
  ...cards: Card[]
): Group {
  const group: Group = {
    number: getNewGroupNumber(),
    cards: {},
  };
  if (cards.length === 1) {
    group.cards[0] = [cards[0]!];
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
  const newGroupNum = Math.min(
    smallerGroup.group.number,
    largerGroup.group.number
  );

  if (orientation === 'vertical') {
    let numberOfColumnsAboveGroup = Object.keys(
      smallerGroup.group.cards
    ).length;
    let numberOfColumnsBelowGroup = Object.keys(largerGroup.group.cards).length;
    const numberOfRowsAboveGroup = smallerGroup.group.cards[0]?.length ?? 0;
    const numberOfRowsBelowGroup = largerGroup.group.cards[0]?.length ?? 0;

    // if we have a negative offset, we can make a positive offset on the other group instead
    // this will make it easier to reason about and generate the new group
    let belowGroupOffset = smallerGroup.connection.x - largerGroup.connection.x;
    const aboveGroupOffset = belowGroupOffset < 0 ? belowGroupOffset * -1 : 0;
    belowGroupOffset = belowGroupOffset < 0 ? 0 : belowGroupOffset;

    const newGroupWidth = Math.max(
      numberOfColumnsAboveGroup + aboveGroupOffset,
      numberOfColumnsBelowGroup + belowGroupOffset
    );
    let newCards: Record<number, (Card | null)[]> = {};

    for (let i = 0; i < newGroupWidth; i++) {
      const upperGroupCards =
        smallerGroup.group.cards[i - aboveGroupOffset] ??
        new Array(numberOfRowsAboveGroup).fill(null);
      newCards[i] = upperGroupCards;

      const lowerGroupCards =
        largerGroup.group.cards[i - belowGroupOffset] ??
        new Array(numberOfRowsBelowGroup).fill(null);
      newCards[i] = newCards[i]!.concat(lowerGroupCards);
      continue;
    }

    return {
      number: newGroupNum,
      cards: newCards,
    };
  }

  // for horizontal groups, everything is actually flipped
  // so the group with the higher number will be on the left side
  const numColsLeftGroup = Object.keys(largerGroup.group.cards).length;
  const numColsRightGroup = Object.keys(smallerGroup.group.cards).length;
  const numRowsLeftGroup = largerGroup.group.cards[0]?.length ?? 0;
  const numRowsRightGroup = smallerGroup.group.cards[0]?.length ?? 0;

  // TODO: normalized in relation to the connection point
  // yOffsetRelativeToConnection - a bit long, we can make this a bit more parse-able later
  // a negative offset means the left group is positioned higher than the right group
  let leftGroupYOffset = smallerGroup.connection.y - largerGroup.connection.y;
  const rightGroupYOffset = leftGroupYOffset < 0 ? leftGroupYOffset * -1 : 0;
  leftGroupYOffset = leftGroupYOffset < 0 ? 0 : leftGroupYOffset;

  const newGroupHeight = Math.max(
    numRowsLeftGroup + leftGroupYOffset,
    numRowsRightGroup + rightGroupYOffset
  );

  const newCards: Record<number, (Card | null)[]> = {};

  for (let x = 0; x < numColsLeftGroup; x++) {
    // work down the column - if the card should go there, add it, otherwise null
    if (!newCards[x]) {
      newCards[x] = [];
    }
    for (let y = 0; y < newGroupHeight; y++) {
      newCards[x]![y] =
        largerGroup.group.cards[x]?.[y - leftGroupYOffset] ?? null;
    }
  }
  for (let x = 0; x < numColsRightGroup; x++) {
    const xRightGroup = x + numColsLeftGroup;
    if (!newCards[xRightGroup]) {
      newCards[xRightGroup] = [];
    }
    for (let y = 0; y < newGroupHeight; y++) {
      newCards[xRightGroup][y] =
        smallerGroup.group.cards[x]?.[y - rightGroupYOffset] ?? null;
    }
  }

  return {
    number: newGroupNum,
    cards: newCards,
  };
}

interface BoardCard {
  id: string;
  lowNum: string;
  lowUprightForV: boolean;
}

export type GroupUI = (BoardCard | null)[][];

export interface BoardUI {
  [groupNum: string]: GroupUI;
}

export function genGroupUI(group: Group) {
  const numCols = Object.keys(group.cards).length;
  const numRows = group.cards[0]?.length;
  if (!numRows) {
    throw new Error(`somehow there are no rows in group: ${group.number}`);
  }
  const boardSpaces: GroupUI = [];

  for (let x = 0; x < numCols; x++) {
    boardSpaces[x] = [];
    for (let y = 0; y < numRows; y++) {
      const card = group.cards[x]?.[y];
      if (card === null) {
        boardSpaces[x]![y] = null;
      } else {
        if (!card) {
          throw new Error(
            `card was missing while creating the group: ${card}, at (${x},${y})`
          );
        }
        boardSpaces[x]![y] = {
          id: card.id,
          lowNum: card.lowNum,
          lowUprightForV: card.uprightFor === 'vertical',
        };
      }
    }
  }
  return boardSpaces;
}
