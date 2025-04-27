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

export function connectCardToGroup({
  group,
  card,
  orientation,
}: {
  group: Group;
  card: Card;
  orientation: Orientation;
}) {
  if (orientation === 'vertical') {
    // check where the current card would go
    // look for +1/-1 on parseInt of the card, but also filling in the 0 if necessary
    // put it directly after that card if greater
    // put it directly before that card if less
  }
}
