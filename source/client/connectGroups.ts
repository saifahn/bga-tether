import { Group, Connection, Orientation, Card } from './connectCardToGroup';

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

  // flipped because of horizontal
  const rightGroupXOffset =
    largerGroup.connection.x - smallerGroup.connection.x + 1;

  const newGroupHeight = Math.max(
    numRowsLeftGroup + leftGroupYOffset,
    numRowsRightGroup + rightGroupYOffset
  );

  const newCards: Record<number, (Card | null)[]> = {};

  for (let x = 0; x < numColsLeftGroup; x++) {
    if (!newCards[x]) {
      newCards[x] = [];
    }
    // work down the column - if the card should go there, add it, otherwise null
    for (let y = 0; y < newGroupHeight; y++) {
      newCards[x]![y] =
        largerGroup.group.cards[x]?.[y - leftGroupYOffset] ?? null;
    }
  }
  for (let x = 0; x < numColsRightGroup; x++) {
    const xRightGroup = x + rightGroupXOffset;
    if (!newCards[xRightGroup]) {
      newCards[xRightGroup] = [];
    }
    for (let y = 0; y < newGroupHeight; y++) {
      // don't replace a card that already exists there with a null
      if (newCards[xRightGroup][y]) continue;
      newCards[xRightGroup][y] =
        smallerGroup.group.cards[x]?.[y - rightGroupYOffset] ?? null;
    }
  }

  return {
    number: newGroupNum,
    cards: newCards,
  };
}
