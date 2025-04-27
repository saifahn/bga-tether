type Orientation = 'vertical' | 'horizontal';

interface Card {
  id: string;
  lowNum: string;
  uprightFor: Orientation;
}

export interface Group {
  number: number;
  [x: number]: (null | Card)[];
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
  };
  if (cards.length === 1) {
    group[0] = cards[0];
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

// TODO: for more complex groups
export function connectCardToGroup({
  group,
  card,
  connectingCard,
  orientation,
}: {
  group: Group;
  card: Card;
  connectingCard: Card;
  orientation: Orientation;
}) {
  if (orientation === 'vertical') {
    // find the connecting card
    const connectingCardPosition = group[0].findIndex(
      (c) => c?.id === connectingCard.id
    );
    if (connectingCardPosition === -1) {
      throw new Error('Connecting card not found in group');
    }
    const cardNumIsGreater =
      parseInt(card.lowNum) > parseInt(connectingCard.lowNum);
    if (cardNumIsGreater) {
      // FIXME: should we make a new array/object?
      group[0].splice(connectingCardPosition + 1, 0, card);
    } else {
      group[0].splice(connectingCardPosition, 0, card);
    }
  }
}
