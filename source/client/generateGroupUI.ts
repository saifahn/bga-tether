import { Group } from './connectCardToGroup';

interface BoardCard {
  id: string;
  lowNum: string;
  lowUprightForV: boolean;
}

export type GroupUI = (BoardCard | null)[][];

export interface BoardUI {
  [groupNum: string]: GroupUI;
}

export function generateGroupUI(group: Group) {
  const numCols = Object.keys(group.cards).length;
  const numRows = group.cards[0]?.length;
  if (!numRows) {
    throw new Error(`somehow there are no rows in group: ${group.id}`);
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
