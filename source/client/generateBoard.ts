interface Group {
  vertical?: {
    [cardNum: string]: {
      id: string;
      number: string;
      flipped: boolean;
    };
  };
  horizontal?: {
    [cardNum: string]: {
      id: string;
      number: string;
      flipped: boolean;
    };
  };
}

export function generateGroup(group: Group) {
  const verticalCards = group.vertical && Object.values(group.vertical);
  const horizontalCards = group.horizontal && Object.values(group.horizontal);
  if (verticalCards) {
    // sort the cards
    // return them in an two dimensional array
    // starting to think we should store the flipped numbers in the db so we don't have to
    // perform the calculations/reversing everywhere in the code - we should just look at the flipped boolean
    return verticalCards
      .sort((a, b) => parseInt(a.number) - parseInt(b.number))
      .map((card) => [{ ...card, uprightFor: 'vertical' }]);
  }

  if (horizontalCards) {
    return horizontalCards
      .sort((a, b) => parseInt(a.number) - parseInt(b.number))
      .map((card) => ({ ...card, uprightFor: 'horizontal' }));
  }

  // so let's start simple with the two card tests
  // vertical group
  // it might be best to return groups with the orientation as the key rather than the card number
  // but l;et's start like this
  return [];
}
