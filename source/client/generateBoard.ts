interface Group {
  [cardNum: string]: {
    id: string;
    number: string;
    flipped: boolean;
    orientation: 'vertical' | 'horizontal';
  };
}

export function generateGroup(group: Group) {
  // output a matrix of cards? then we can use grid for each group
  // let's add a test here
  if (Object.keys(group).length === 0) return [];
}
