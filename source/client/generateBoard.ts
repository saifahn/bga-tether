export interface BoardCard {
  id: string; // cardId
  number: string; // upright number
  uprightFor: 'vertical' | 'horizontal';
}

type Space = BoardCard | null;

export interface Group {
  vertical: {
    // TODO: might make the key the id instead of the number
    [cardNum: string]: {
      id: string;
      number: string;
      uprightFor: 'vertical' | 'horizontal';
    };
  };
  horizontal: {
    [cardNum: string]: {
      id: string;
      number: string;
      uprightFor: 'vertical' | 'horizontal';
    };
  };
}

export type GroupUI = Space[][];

export interface BoardUI {
  [groupNum: string]: GroupUI;
}

export function generateGroupUI(group: Group): GroupUI {
  const verticalCards = group.vertical && Object.values(group.vertical);
  const horizontalCards = group.horizontal && Object.values(group.horizontal);
  if (verticalCards) {
    return verticalCards
      .sort((a, b) => parseInt(a.number) - parseInt(b.number))
      .map((card) => {
        return [{ ...card }];
      });
  }

  if (horizontalCards) {
    return [
      horizontalCards
        .sort((a, b) => parseInt(a.number) - parseInt(b.number))
        .map((card) => ({ ...card })),
    ];
  }

  // so let's start simple with the two card tests
  // vertical group
  // it might be best to return groups with the orientation as the key rather than the card number
  // but let's start like this
  return [];
}
