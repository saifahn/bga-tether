import { connectCardToGroup, Group } from './connectCardToGroup';
import { test } from 'uvu';
import * as assert from 'uvu/assert';

// #region vertical connections
test('should extend columns correctly when connecting a card vertically at the end', () => {
  const group: Group = {
    id: '2',
    cards: {
      0: [
        { id: '2', lowNum: '02', uprightFor: 'vertical' },
        { id: '1', lowNum: '01', uprightFor: 'vertical' },
      ],
      1: [{ id: '19', lowNum: '19', uprightFor: 'horizontal' }, null],
    },
  };
  connectCardToGroup({
    group,
    card: {
      id: '3',
      lowNum: '03',
      uprightFor: 'vertical',
    },
    orientation: 'vertical',
    connection: {
      card: {
        id: '2',
        lowNum: '02',
        uprightFor: 'vertical',
      },
      x: 0,
      y: 0,
    },
  });

  assert.equal(group, {
    id: '2',
    cards: {
      0: [
        { id: '3', lowNum: '03', uprightFor: 'vertical' },
        { id: '2', lowNum: '02', uprightFor: 'vertical' },
        { id: '1', lowNum: '01', uprightFor: 'vertical' },
      ],
      1: [null, { id: '19', lowNum: '19', uprightFor: 'horizontal' }, null],
    },
  });
});

test('should extend columns correctly when connecting a card vertically at the beginning', () => {
  const group: Group = {
    id: '2',
    cards: {
      0: [
        { id: '3', lowNum: '03', uprightFor: 'vertical' },
        { id: '2', lowNum: '02', uprightFor: 'vertical' },
      ],
      1: [{ id: '29', lowNum: '29', uprightFor: 'horizontal' }, null],
    },
  };
  connectCardToGroup({
    group,
    card: {
      id: '1',
      lowNum: '01',
      uprightFor: 'vertical',
    },
    orientation: 'vertical',
    connection: {
      card: {
        id: '2',
        lowNum: '02',
        uprightFor: 'vertical',
      },
      x: 0,
      y: 1,
    },
  });
  assert.equal(group, {
    id: '2',
    cards: {
      0: [
        { id: '3', lowNum: '03', uprightFor: 'vertical' },
        { id: '2', lowNum: '02', uprightFor: 'vertical' },
        { id: '1', lowNum: '01', uprightFor: 'vertical' },
      ],
      1: [{ id: '29', lowNum: '29', uprightFor: 'horizontal' }, null, null],
    },
  });
});

test('can connect a card of a different orientation vertically to a group of mixed orientations, with the card replacing a blank space (null)', () => {
  // for vertical:
  // 51
  // 50 40
  //    39
  const group: Group = {
    id: '2',
    cards: {
      0: [
        {
          id: '15',
          lowNum: '15',
          uprightFor: 'horizontal',
        },
        {
          id: '05',
          lowNum: '05',
          uprightFor: 'horizontal',
        },
        null,
      ],
      1: [
        null,
        { id: '04', lowNum: '04', uprightFor: 'horizontal' },
        { id: '39', lowNum: '39', uprightFor: 'vertical' },
      ],
    },
  };

  connectCardToGroup({
    group,
    card: {
      id: '49',
      lowNum: '49',
      uprightFor: 'vertical',
    },
    orientation: 'vertical',
    connection: {
      card: {
        id: '05',
        lowNum: '05',
        uprightFor: 'horizontal',
      },
      x: 0,
      y: 1,
    },
  });

  assert.equal(group, {
    id: '2',
    cards: {
      0: [
        {
          id: '15',
          lowNum: '15',
          uprightFor: 'horizontal',
        },
        {
          id: '05',
          lowNum: '05',
          uprightFor: 'horizontal',
        },
        {
          id: '49',
          lowNum: '49',
          uprightFor: 'vertical',
        },
      ],
      1: [
        null,
        { id: '04', lowNum: '04', uprightFor: 'horizontal' },
        { id: '39', lowNum: '39', uprightFor: 'vertical' },
      ],
    },
  });
});
// #endregion

// #region horizontal connection
test('should extend rows correctly when connecting a card horizontally at the beginning', () => {
  // data is always represented from the vertical player's perspective
  const group: Group = {
    id: '2',
    cards: {
      0: [{ id: '3', lowNum: '03', uprightFor: 'horizontal' }, null],
      1: [
        { id: '2', lowNum: '02', uprightFor: 'horizontal' },
        { id: '12', lowNum: '12', uprightFor: 'horizontal' },
      ],
    },
  };
  connectCardToGroup({
    group,
    card: {
      id: '1',
      lowNum: '01',
      uprightFor: 'horizontal',
    },
    orientation: 'horizontal',
    connection: {
      card: {
        id: '2',
        lowNum: '02',
        uprightFor: 'horizontal',
      },
      y: 0,
      x: 1,
    },
  });
  assert.equal(group, {
    id: '2',
    cards: {
      0: [{ id: '3', lowNum: '03', uprightFor: 'horizontal' }, null],
      1: [
        { id: '2', lowNum: '02', uprightFor: 'horizontal' },
        { id: '12', lowNum: '12', uprightFor: 'horizontal' },
      ],
      2: [{ id: '1', lowNum: '01', uprightFor: 'horizontal' }, null],
    },
  });
});

test('should extend rows correctly when connecting a card horizontally at the end', () => {
  // horizontal player view:
  // 12
  // 02 03
  //
  // vertical player view:
  // 30 20
  //    21
  const group: Group = {
    id: '2',
    cards: {
      0: [{ id: '3', lowNum: '03', uprightFor: 'horizontal' }, null],
      1: [
        { id: '2', lowNum: '02', uprightFor: 'horizontal' },
        { id: '12', lowNum: '12', uprightFor: 'horizontal' },
      ],
    },
  };
  connectCardToGroup({
    group,
    card: {
      id: '4',
      lowNum: '04',
      uprightFor: 'horizontal',
    },
    orientation: 'horizontal',
    connection: {
      card: {
        id: '3',
        lowNum: '03',
        uprightFor: 'horizontal',
      },
      x: 0,
      y: 0,
    },
  });
  assert.equal(group, {
    id: '2',
    cards: {
      0: [{ id: '4', lowNum: '04', uprightFor: 'horizontal' }, null],
      1: [{ id: '3', lowNum: '03', uprightFor: 'horizontal' }, null],
      2: [
        { id: '2', lowNum: '02', uprightFor: 'horizontal' },
        { id: '12', lowNum: '12', uprightFor: 'horizontal' },
      ],
    },
  });
});

test('can connect a card of a different orientation horizontally to a group of mixed orientations, with the card replacing a blank space (null)', () => {
  // for vertical:
  // 17 07
  //    08 97

  // for horizontal:
  // 79 80
  //    70 71
  const group: Group = {
    id: '2',
    cards: {
      0: [{ id: '17', lowNum: '17', uprightFor: 'vertical' }, null],
      1: [
        { id: '07', lowNum: '07', uprightFor: 'vertical' },
        { id: '08', lowNum: '08', uprightFor: 'vertical' },
      ],
      2: [null, { id: '79', lowNum: '79', uprightFor: 'horizontal' }],
    },
  };

  connectCardToGroup({
    group,
    card: {
      id: '69',
      lowNum: '69',
      uprightFor: 'horizontal',
    },
    orientation: 'horizontal',
    connection: {
      card: {
        id: '07',
        lowNum: '07',
        uprightFor: 'vertical',
      },
      x: 1,
      y: 0,
    },
  });

  assert.equal(group, {
    id: '2',
    cards: {
      0: [{ id: '17', lowNum: '17', uprightFor: 'vertical' }, null],
      1: [
        { id: '07', lowNum: '07', uprightFor: 'vertical' },
        { id: '08', lowNum: '08', uprightFor: 'vertical' },
      ],
      2: [
        { id: '69', lowNum: '69', uprightFor: 'horizontal' },
        { id: '79', lowNum: '79', uprightFor: 'horizontal' },
      ],
    },
  });
});

test('can connect a card horizontally and fill in blank spaces correctly', () => {
  // for vertical:
  // 20
  // 21
  // 22
  // 23

  // for horizontal:
  // 32
  // 22
  // 12
  // 02
  const group: Group = {
    id: '2',
    cards: {
      0: [
        { id: '02', lowNum: '02', uprightFor: 'horizontal' },
        { id: '12', lowNum: '12', uprightFor: 'horizontal' },
        { id: '22', lowNum: '22', uprightFor: 'vertical' },
        { id: '23', lowNum: '23', uprightFor: 'vertical' },
      ],
    },
  };

  connectCardToGroup({
    group,
    card: {
      id: '33',
      lowNum: '33',
      uprightFor: 'vertical',
    },
    orientation: 'horizontal',
    connection: {
      card: {
        id: '23',
        lowNum: '23',
        uprightFor: 'vertical',
      },
      x: 0,
      y: 3,
    },
  });

  assert.equal(group, {
    id: '2',
    cards: {
      0: [null, null, null, { id: '33', lowNum: '33', uprightFor: 'vertical' }],
      1: [
        { id: '02', lowNum: '02', uprightFor: 'horizontal' },
        { id: '12', lowNum: '12', uprightFor: 'horizontal' },
        { id: '22', lowNum: '22', uprightFor: 'vertical' },
        { id: '23', lowNum: '23', uprightFor: 'vertical' },
      ],
    },
  });
});

test('can connect a card that fills in a blank space (null), and the card is connected at an earlier x coordinate in the data representation (to the right for the horizontal perspective)', () => {
  const group: Group = {
    id: '2',
    cards: {
      0: [
        null,
        null,
        { id: '33', lowNum: '33', uprightFor: 'vertical' },
        { id: '34', lowNum: '34', uprightFor: 'vertical' },
      ],
      1: [null, null, { id: '23', lowNum: '23', uprightFor: 'vertical' }, null],
      2: [
        { id: '11', lowNum: '11', uprightFor: 'vertical' },
        { id: '12', lowNum: '12', uprightFor: 'vertical' },
        { id: '13', lowNum: '13', uprightFor: 'vertical' },
        null,
      ],
      3: [
        { id: '01', lowNum: '01', uprightFor: 'vertical' },
        { id: '02', lowNum: '02', uprightFor: 'vertical' },
        { id: '03', lowNum: '03', uprightFor: 'vertical' },
        null,
      ],
    },
  };

  connectCardToGroup({
    group,
    card: {
      id: '22',
      lowNum: '22',
      uprightFor: 'vertical',
    },
    orientation: 'horizontal',
    connection: {
      card: {
        id: '12',
        lowNum: '12',
        uprightFor: 'vertical',
      },
      x: 2,
      y: 1,
    },
  });

  assert.equal(group, {
    id: '2',
    cards: {
      0: [
        null,
        null,
        { id: '33', lowNum: '33', uprightFor: 'vertical' },
        { id: '34', lowNum: '34', uprightFor: 'vertical' },
      ],
      1: [
        null,
        { id: '22', lowNum: '22', uprightFor: 'vertical' },
        { id: '23', lowNum: '23', uprightFor: 'vertical' },
        null,
      ],
      2: [
        { id: '11', lowNum: '11', uprightFor: 'vertical' },
        { id: '12', lowNum: '12', uprightFor: 'vertical' },
        { id: '13', lowNum: '13', uprightFor: 'vertical' },
        null,
      ],
      3: [
        { id: '01', lowNum: '01', uprightFor: 'vertical' },
        { id: '02', lowNum: '02', uprightFor: 'vertical' },
        { id: '03', lowNum: '03', uprightFor: 'vertical' },
        null,
      ],
    },
  });
});
// #endregion

test.run();
