import { Group, Connection, Orientation, Card } from './connectCardToGroup';

interface ConnectGroupsArgs {
  group1: {
    group: Group;
    connection: Connection;
  };
  group2: {
    group: Group;
    connection: Connection;
  };
  orientation: Orientation;
}

function getGroupsByConnectionOrder({
  group1,
  group2,
  orientation,
}: ConnectGroupsArgs) {
  // currently we are comparing the number from currentGroup connection to the cardToConnect
  // then we decide which group is lesser
  // then we can use that to decide which is the smaller/largerGroup
  // move that logic here
  // here we will determine "getHigherConnectingNumberGroup"
  const group1NumToCompare =
    group1.connection.card.uprightFor === orientation
      ? group1.connection.card.lowNum
      : group1.connection.card.lowNum.split('').toReversed().join('');
  const group2NumToCompare =
    group2.connection.card.uprightFor === orientation
      ? group2.connection.card.lowNum
      : group2.connection.card.lowNum.split('').toReversed().join('');

  const group1IsGreater =
    parseInt(group1NumToCompare, 10) > parseInt(group2NumToCompare, 10);

  // higherConnectingNumber = "right side" for horizontal, (left side in data)
  // higher connectingNumber = "bottom" for vertical
  return {
    groupConnectFrom: group1IsGreater ? group2 : group1,
    groupConnectTo: group1IsGreater ? group1 : group2,
  };
}

export function connectGroups({
  group1,
  group2,
  orientation,
}: ConnectGroupsArgs) {
  if (
    group1.group.cards[group1.connection.x]?.[group1.connection.y]?.id !==
      group1.connection.card.id ||
    group2.group.cards[group2.connection.x]?.[group2.connection.y]?.id !==
      group2.connection.card.id
  ) {
    throw new Error('The connecting card details are not correct');
  }

  const { groupConnectFrom, groupConnectTo } = getGroupsByConnectionOrder({
    group1,
    group2,
    orientation,
  });

  const newGroupNum = Math.min(group1.group.number, group2.group.number);

  let relativeFromGroupXCoord = orientation === 'horizontal' ? 1 : 0;
  let relativeToGroupYCoord = orientation === 'vertical' ? 1 : 0;

  const temporaryCombinedGroup: Record<
    string,
    Record<string, Card | undefined>
  > = {};
  // go through all of the fromGroup, add it into the combined group
  const fromGroupYShift = 0 - groupConnectFrom.connection.y;
  const fromGroupXShift =
    relativeFromGroupXCoord - groupConnectFrom.connection.x;
  const yCoords = new Set<number>();

  for (const [x, column] of Object.entries(groupConnectFrom.group.cards)) {
    for (const [y, card] of column.entries()) {
      if (!card) continue;
      if (!temporaryCombinedGroup[parseInt(x, 10) + fromGroupXShift]) {
        temporaryCombinedGroup[parseInt(x, 10) + fromGroupXShift] = {};
      }
      const offsetY = y + fromGroupYShift;
      yCoords.add(offsetY);
      temporaryCombinedGroup[parseInt(x, 10) + fromGroupXShift]![offsetY] =
        card;
    }
  }

  const toGroupYShift = relativeToGroupYCoord - groupConnectTo.connection.y;
  const toGroupXShift = 0 - groupConnectTo.connection.x;
  for (const [x, column] of Object.entries(groupConnectTo.group.cards)) {
    for (const [y, card] of column.entries()) {
      if (!card) continue;
      if (!temporaryCombinedGroup[parseInt(x, 10) + toGroupXShift]) {
        temporaryCombinedGroup[parseInt(x, 10) + toGroupXShift] = {};
      }
      const offsetY = y + toGroupYShift;
      yCoords.add(offsetY);
      temporaryCombinedGroup[parseInt(x, 10) + toGroupXShift]![offsetY] = card;
    }
  }

  // normalize the insides
  const nonNormalizedXs = Object.keys(temporaryCombinedGroup);
  let xOffset = 0;
  nonNormalizedXs.forEach((xCoord) => {
    const parsedX = parseInt(xCoord, 10);
    if (parsedX < xOffset) xOffset = parsedX;
  });
  xOffset = xOffset * -1;

  // get the height of the new group
  const newGroupHeight = yCoords.size;
  let yOffset = 0;
  yCoords.forEach((yCoord) => {
    if (yCoord < yOffset) yOffset = yCoord;
  });
  yOffset = yOffset * -1;

  // loop over the temporary combined group now using the xOffset to create a new group
  const newGroup: Group = {
    number: newGroupNum,
    cards: {},
  };
  for (const oldX of Object.keys(temporaryCombinedGroup)) {
    const newX = parseInt(oldX, 10) + xOffset;
    if (!newGroup.cards[newX]) {
      newGroup.cards[newX] = [];
    }
    for (let y = 0; y < newGroupHeight; y++) {
      const oldY = y - yOffset;
      newGroup.cards[newX].push(temporaryCombinedGroup[oldX]?.[oldY] || null);
    }
  }

  // // from the horizontal perspective, they are connecting numbers ascending left to right
  // // but the data is stored from the vertical perspective so it will be from right to left
  // // the lower number will be the FROM group and the higher number will be the TO group
  // // TO group connection point will be at relative 0,0 with the FROM group connection point next to it horizontally, at 1,0

  return newGroup;
}
