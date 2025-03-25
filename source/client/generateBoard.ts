export interface BoardCard {
  id: string; // cardId
  number: string; // upright number
  uprightFor: 'vertical' | 'horizontal';
}

type Space = BoardCard | null;

export interface Group {
  vertical: {
    // currently, cardNum is also the upright number, not the played number
    // TODO: might need to change this?
    [cardNum: string]: {
      id: string;
      number: string;
      upright: boolean;
    };
  };
  horizontal: {
    [cardNum: string]: {
      id: string;
      number: string;
      upright: boolean;
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
        const { upright, ...rest } = card;
        return [
          {
            ...rest,
            uprightFor: upright ? 'vertical' : 'horizontal',
          },
        ];
      });
  }

  if (horizontalCards) {
    return [
      horizontalCards
        .sort((a, b) => parseInt(a.number) - parseInt(b.number))
        .map((card) => {
          const { upright, ...rest } = card;
          return {
            ...rest,
            uprightFor: upright ? 'horizontal' : 'vertical',
          };
        }),
    ];
  }

  // so let's start simple with the two card tests
  // vertical group
  // it might be best to return groups with the orientation as the key rather than the card number
  // but let's start like this
  return [];
}
