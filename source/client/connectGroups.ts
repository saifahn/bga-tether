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
  const group1NumToCompare =
    group1.connection.card.uprightFor === orientation
      ? group1.connection.card.lowNum
      : group1.connection.card.lowNum.split('').toReversed().join('');
  const group2NumToCompare =
    group2.connection.card.uprightFor === orientation
      ? group2.connection.card.lowNum
      : group2.connection.card.lowNum.split('').toReversed().join('');

  const group1ConnectionIsGreaterNum =
    parseInt(group1NumToCompare, 10) > parseInt(group2NumToCompare, 10);

  // higher connecting number = "to the right" for horizontal, (left side in data)
  // higher connecting number = "above" for vertical
  if (orientation === 'horizontal') {
    return {
      groupFrom: group1ConnectionIsGreaterNum ? group2 : group1,
      groupTo: group1ConnectionIsGreaterNum ? group1 : group2,
    };
  } else {
    return {
      groupFrom: group1ConnectionIsGreaterNum ? group1 : group2,
      groupTo: group1ConnectionIsGreaterNum ? group2 : group1,
    };
  }
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

  // The FROM group is the group that has the card with a lesser number at the
  // connection point
  const { groupFrom, groupTo } = getGroupsByConnectionOrder({
    group1,
    group2,
    orientation,
  });

  // We will first connect the two groups at a relative position of 0,0 and 0,1
  // for a vertical connection and 0,0 and 1,0 for a horizontal connection.
  // We will then fill in the rest of each group around this relative position
  // and then adjust the values accordingly so that the "top left" value is 0,0.
  let relativeToY = orientation === 'vertical' ? 1 : 0;
  // The data is always represented from the vertical perspective, so although
  // we expect the FROM group to have a lower coordinate value, when connecting
  // for the horizontal perspective the FROM group/lesser number will have a
  // greater coordinate value from the vertical perspective.
  let relativeFromX = orientation === 'horizontal' ? 1 : 0;

  const temporaryCombinedGroup: Record<string, Record<string, Card>> = {};
  const rows = new Set<number>();

  const fromGroupYShift = 0 - groupFrom.connection.y;
  const fromGroupXShift = relativeFromX - groupFrom.connection.x;

  for (const [x, column] of Object.entries(groupFrom.group.cards)) {
    for (const [y, card] of column.entries()) {
      if (!card) continue;
      if (!temporaryCombinedGroup[parseInt(x, 10) + fromGroupXShift]) {
        temporaryCombinedGroup[parseInt(x, 10) + fromGroupXShift] = {};
      }
      const offsetY = y + fromGroupYShift;
      rows.add(offsetY);
      temporaryCombinedGroup[parseInt(x, 10) + fromGroupXShift]![offsetY] =
        card;
    }
  }

  const toGroupYShift = relativeToY - groupTo.connection.y;
  const toGroupXShift = 0 - groupTo.connection.x;
  for (const [x, column] of Object.entries(groupTo.group.cards)) {
    for (const [y, card] of column.entries()) {
      if (!card) continue;
      if (!temporaryCombinedGroup[parseInt(x, 10) + toGroupXShift]) {
        temporaryCombinedGroup[parseInt(x, 10) + toGroupXShift] = {};
      }
      const offsetY = y + toGroupYShift;
      rows.add(offsetY);
      temporaryCombinedGroup[parseInt(x, 10) + toGroupXShift]![offsetY] = card;
    }
  }

  // adjust the coordinates to start from 0,0
  const nonNormalizedXs = Object.keys(temporaryCombinedGroup);
  let xOffset = 0;
  nonNormalizedXs.forEach((xCoord) => {
    const parsedX = parseInt(xCoord, 10);
    if (parsedX < xOffset) xOffset = parsedX;
  });
  xOffset = xOffset * -1;

  // get the height of the new group
  const newGroupHeight = rows.size;
  let yOffset = 0;
  rows.forEach((rowNum) => {
    if (rowNum < yOffset) yOffset = rowNum;
  });
  yOffset = yOffset * -1;

  // loop over the temporary combined group now using the xOffset to create a new group
  const newGroup: Group = {
    id: group1.group.id,
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

  return newGroup;
}
