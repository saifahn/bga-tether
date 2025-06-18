import { Group } from './connectCardToGroup';
import { connectGroups } from './connectGroups';
import { test } from 'uvu';
import * as assert from 'uvu/assert';

// TODO: table-driven tests?
// #region vertical connect
// test('should successfully connect two aligned groups vertically', () => {
//   const group1: Group = {
//     number: 1,
//     cards: {
//       0: [
//         { id: '1', lowNum: '01', uprightFor: 'vertical' },
//         { id: '2', lowNum: '02', uprightFor: 'vertical' },
//       ],
//     },
//   };
//   const group2: Group = {
//     number: 2,
//     cards: {
//       0: [
//         { id: '3', lowNum: '03', uprightFor: 'vertical' },
//         { id: '4', lowNum: '04', uprightFor: 'vertical' },
//       ],
//     },
//   };

//   const result = connectGroups({
//     smallerGroup: {
//       group: group1,
//       connection: {
//         card: { id: '2', lowNum: '02', uprightFor: 'vertical' },
//         x: 0,
//         y: 1,
//       },
//     },
//     largerGroup: {
//       group: group2,
//       connection: {
//         card: { id: '3', lowNum: '03', uprightFor: 'vertical' },
//         x: 0,
//         y: 0,
//       },
//     },
//     orientation: 'vertical',
//   });

//   assert.equal(result, {
//     number: 1,
//     cards: {
//       0: [
//         { id: '1', lowNum: '01', uprightFor: 'vertical' },
//         { id: '2', lowNum: '02', uprightFor: 'vertical' },
//         { id: '3', lowNum: '03', uprightFor: 'vertical' },
//         { id: '4', lowNum: '04', uprightFor: 'vertical' },
//       ],
//     },
//   });
// });

// test('should successfully connect two groups vertically with an offset that creates a wider new group', () => {
//   const group1: Group = {
//     number: 1,
//     cards: {
//       0: [null, { id: '38', lowNum: '38', uprightFor: 'vertical' }],
//       1: [
//         {
//           id: '27',
//           lowNum: '27',
//           uprightFor: 'vertical',
//         },
//         {
//           id: '28',
//           lowNum: '28',
//           uprightFor: 'vertical',
//         },
//       ],
//       2: [
//         {
//           id: '17',
//           lowNum: '17',
//           uprightFor: 'vertical',
//         },
//         null,
//       ],
//     },
//   };
//   const group2: Group = {
//     number: 2,
//     cards: {
//       0: [
//         { id: '29', lowNum: '29', uprightFor: 'vertical' },
//         { id: '03', lowNum: '03', uprightFor: 'horizontal' },
//       ],
//     },
//   };

//   const result = connectGroups({
//     smallerGroup: {
//       group: group1,
//       connection: {
//         card: { id: '28', lowNum: '28', uprightFor: 'vertical' },
//         x: 1,
//         y: 1,
//       },
//     },
//     largerGroup: {
//       group: group2,
//       connection: {
//         card: { id: '29', lowNum: '29', uprightFor: 'vertical' },
//         x: 0,
//         y: 0,
//       },
//     },
//     orientation: 'vertical',
//   });

//   assert.equal(result, {
//     number: 1,
//     cards: {
//       0: [null, { id: '38', lowNum: '38', uprightFor: 'vertical' }, null, null],
//       1: [
//         {
//           id: '27',
//           lowNum: '27',
//           uprightFor: 'vertical',
//         },
//         {
//           id: '28',
//           lowNum: '28',
//           uprightFor: 'vertical',
//         },
//         { id: '29', lowNum: '29', uprightFor: 'vertical' },
//         { id: '03', lowNum: '03', uprightFor: 'horizontal' },
//       ],
//       2: [
//         {
//           id: '17',
//           lowNum: '17',
//           uprightFor: 'vertical',
//         },
//         null,
//         null,
//         null,
//       ],
//     },
//   });
// });

// test('should connect two groups of different columns vertically successfully with negative offset', () => {
//   const group1: Group = {
//     number: 1,
//     cards: {
//       0: [
//         null,
//         { id: '57', lowNum: '57', uprightFor: 'vertical' },
//         { id: '58', lowNum: '58', uprightFor: 'vertical' },
//       ],
//       1: [
//         null,
//         {
//           id: '47',
//           lowNum: '47',
//           uprightFor: 'vertical',
//         },
//         null,
//       ],
//       2: [
//         {
//           id: '36',
//           lowNum: '36',
//           uprightFor: 'vertical',
//         },
//         {
//           id: '37',
//           lowNum: '37',
//           uprightFor: 'vertical',
//         },
//         null,
//       ],
//     },
//   };
//   const group2: Group = {
//     number: 2,
//     cards: {
//       0: [{ id: '69', lowNum: '69', uprightFor: 'vertical' }, null],
//       1: [
//         { id: '59', lowNum: '59', uprightFor: 'vertical' },
//         { id: '60', lowNum: '60', uprightFor: 'vertical' },
//       ],
//     },
//   };

//   const result = connectGroups({
//     smallerGroup: {
//       group: group1,
//       connection: {
//         card: { id: '58', lowNum: '58', uprightFor: 'vertical' },
//         x: 0,
//         y: 2,
//       },
//     },
//     largerGroup: {
//       group: group2,
//       connection: {
//         card: { id: '59', lowNum: '59', uprightFor: 'vertical' },
//         x: 1,
//         y: 0,
//       },
//     },
//     orientation: 'vertical',
//   });

//   assert.equal(result, {
//     number: 1,
//     cards: {
//       0: [
//         null,
//         null,
//         null,
//         { id: '69', lowNum: '69', uprightFor: 'vertical' },
//         null,
//       ],
//       1: [
//         null,
//         { id: '57', lowNum: '57', uprightFor: 'vertical' },
//         { id: '58', lowNum: '58', uprightFor: 'vertical' },
//         { id: '59', lowNum: '59', uprightFor: 'vertical' },
//         { id: '60', lowNum: '60', uprightFor: 'vertical' },
//       ],
//       2: [
//         null,
//         {
//           id: '47',
//           lowNum: '47',
//           uprightFor: 'vertical',
//         },
//         null,
//         null,
//         null,
//       ],
//       3: [
//         {
//           id: '36',
//           lowNum: '36',
//           uprightFor: 'vertical',
//         },
//         {
//           id: '37',
//           lowNum: '37',
//           uprightFor: 'vertical',
//         },
//         null,
//         null,
//         null,
//       ],
//     },
//   });
// });
// #endregion

// #region horizontal connect
test('should connect two simple groups horizontally successfully', () => {
  const group1: Group = {
    number: 1,
    cards: {
      0: [{ id: '58', lowNum: '58', uprightFor: 'horizontal' }],
      1: [{ id: '57', lowNum: '57', uprightFor: 'horizontal' }],
    },
  };
  const group2: Group = {
    number: 2,
    cards: {
      0: [{ id: '6', lowNum: '06', uprightFor: 'vertical' }],
      1: [{ id: '59', lowNum: '59', uprightFor: 'horizontal' }],
    },
  };

  const result = connectGroups({
    group1: {
      group: group1,
      connection: {
        card: { id: '58', lowNum: '58', uprightFor: 'horizontal' },
        x: 0,
        y: 0,
      },
    },
    group2: {
      group: group2,
      connection: {
        card: { id: '59', lowNum: '59', uprightFor: 'horizontal' },
        x: 1,
        y: 0,
      },
    },
    orientation: 'horizontal',
  });

  assert.equal(result, {
    number: 1,
    cards: {
      0: [{ id: '6', lowNum: '06', uprightFor: 'vertical' }],
      1: [{ id: '59', lowNum: '59', uprightFor: 'horizontal' }],
      2: [{ id: '58', lowNum: '58', uprightFor: 'horizontal' }],
      3: [{ id: '57', lowNum: '57', uprightFor: 'horizontal' }],
    },
  });
});

test('should successfully connect two groups horizontally that are somewhat complex', () => {
  const group1: Group = {
    number: 1,
    cards: {
      0: [
        {
          id: '58',
          lowNum: '58',
          uprightFor: 'horizontal',
        },
        {
          id: '68',
          lowNum: '68',
          uprightFor: 'horizontal',
        },
      ],
      1: [
        {
          id: '57',
          lowNum: '57',
          uprightFor: 'horizontal',
        },
        null,
      ],
    },
  };
  const group2: Group = {
    number: 2,
    cards: {
      0: [
        {
          id: '5',
          lowNum: '05',
          uprightFor: 'vertical',
        },
        null,
      ],
      1: [
        {
          id: '49',
          lowNum: '49',
          uprightFor: 'horizontal',
        },
        {
          id: '59',
          lowNum: '59',
          uprightFor: 'horizontal',
        },
      ],
    },
  };
  const res = connectGroups({
    group1: {
      group: group1,
      connection: {
        card: { id: '58', lowNum: '58', uprightFor: 'horizontal' },
        x: 0,
        y: 0,
      },
    },
    group2: {
      group: group2,
      connection: {
        card: { id: '59', lowNum: '59', uprightFor: 'horizontal' },
        x: 1,
        y: 1,
      },
    },
    orientation: 'horizontal',
  });

  assert.equal(res, {
    number: 1,
    cards: {
      0: [
        {
          id: '5',
          lowNum: '05',
          uprightFor: 'vertical',
        },
        null,
        null,
      ],
      1: [
        {
          id: '49',
          lowNum: '49',
          uprightFor: 'horizontal',
        },
        {
          id: '59',
          lowNum: '59',
          uprightFor: 'horizontal',
        },
        null,
      ],
      2: [
        null,
        {
          id: '58',
          lowNum: '58',
          uprightFor: 'horizontal',
        },
        {
          id: '68',
          lowNum: '68',
          uprightFor: 'horizontal',
        },
      ],
      3: [
        null,
        {
          id: '57',
          lowNum: '57',
          uprightFor: 'horizontal',
        },
        null,
      ],
    },
  });
});

test('can connect groups where cards replace null/blank spaces, with the second group extending further than the end of the first group', () => {
  const connectLesser: Group = {
    number: 3,
    cards: {
      0: [
        { id: '28', lowNum: '28', uprightFor: 'horizontal' },
        { id: '38', lowNum: '38', uprightFor: 'horizontal' },
      ],
      1: [{ id: '27', lowNum: '27', uprightFor: 'horizontal' }, null],
      2: [
        { id: '26', lowNum: '26', uprightFor: 'horizontal' },
        { id: '36', lowNum: '36', uprightFor: 'horizontal' },
      ],
    },
  };
  const connectGreater: Group = {
    number: 2,
    cards: {
      0: [
        {
          id: '37',
          lowNum: '37',
          uprightFor: 'horizontal',
        },
        {
          id: '47',
          lowNum: '47',
          uprightFor: 'horizontal',
        },
      ],
      1: [
        null,
        {
          id: '46',
          lowNum: '46',
          uprightFor: 'horizontal',
        },
      ],
      2: [
        null,
        {
          id: '45',
          lowNum: '45',
          uprightFor: 'horizontal',
        },
      ],
    },
  };

  const result = connectGroups({
    group1: {
      group: connectLesser,
      connection: {
        card: {
          id: '36',
          lowNum: '36',
          uprightFor: 'horizontal',
        },
        x: 2,
        y: 1,
      },
    },
    group2: {
      group: connectGreater,
      connection: {
        card: {
          id: '37',
          lowNum: '37',
          uprightFor: 'horizontal',
        },
        x: 0,
        y: 0,
      },
    },
    orientation: 'horizontal',
  });

  assert.equal(result, {
    number: 2,
    cards: {
      0: [
        { id: '28', lowNum: '28', uprightFor: 'horizontal' },
        {
          id: '38',
          lowNum: '38',
          uprightFor: 'horizontal',
        },
        null,
      ],
      1: [
        { id: '27', lowNum: '27', uprightFor: 'horizontal' },
        { id: '37', lowNum: '37', uprightFor: 'horizontal' },
        { id: '47', lowNum: '47', uprightFor: 'horizontal' },
      ],
      2: [
        { id: '26', lowNum: '26', uprightFor: 'horizontal' },
        { id: '36', lowNum: '36', uprightFor: 'horizontal' },
        { id: '46', lowNum: '46', uprightFor: 'horizontal' },
      ],
      3: [null, null, { id: '45', lowNum: '45', uprightFor: 'horizontal' }],
    },
  });
});

test("can connect two groups horizontally, replacing blank spaces, extending a new starting column from the vertical player's perspective (new column from the horizontal perspective)", () => {
  const connectGreater: Group = {
    number: 3,
    cards: {
      0: [
        { id: '29', lowNum: '29', uprightFor: 'horizontal' },
        { id: '39', lowNum: '39', uprightFor: 'horizontal' },
      ],
      1: [{ id: '28', lowNum: '28', uprightFor: 'horizontal' }, null],
      2: [
        { id: '27', lowNum: '27', uprightFor: 'horizontal' },
        { id: '37', lowNum: '37', uprightFor: 'horizontal' },
      ],
    },
  };
  const connectLesser: Group = {
    number: 2,
    cards: {
      0: [
        null,
        {
          id: '05',
          lowNum: '05',
          uprightFor: 'vertical',
        },
      ],
      1: [
        null,
        {
          id: '49',
          lowNum: '49',
          uprightFor: 'horizontal',
        },
      ],
      2: [
        {
          id: '38',
          lowNum: '38',
          uprightFor: 'horizontal',
        },
        {
          id: '48',
          lowNum: '48',
          uprightFor: 'horizontal',
        },
      ],
    },
  };

  const result = connectGroups({
    group1: {
      group: connectGreater,
      connection: {
        card: {
          id: '39',
          lowNum: '39',
          uprightFor: 'horizontal',
        },
        x: 0,
        y: 1,
      },
    },
    group2: {
      group: connectLesser,
      connection: {
        card: {
          id: '38',
          lowNum: '38',
          uprightFor: 'horizontal',
        },
        x: 2,
        y: 0,
      },
    },
    orientation: 'horizontal',
  });

  assert.equal(result, {
    number: 2,
    cards: {
      0: [
        null,
        null,
        {
          id: '05',
          lowNum: '05',
          uprightFor: 'vertical',
        },
      ],
      1: [
        { id: '29', lowNum: '29', uprightFor: 'horizontal' },
        { id: '39', lowNum: '39', uprightFor: 'horizontal' },
        { id: '49', lowNum: '49', uprightFor: 'horizontal' },
      ],
      2: [
        { id: '28', lowNum: '28', uprightFor: 'horizontal' },
        {
          id: '38',
          lowNum: '38',
          uprightFor: 'horizontal',
        },
        { id: '48', lowNum: '48', uprightFor: 'horizontal' },
      ],
      3: [
        { id: '27', lowNum: '27', uprightFor: 'horizontal' },
        { id: '37', lowNum: '37', uprightFor: 'horizontal' },
        null,
      ],
    },
  });
});
// #endregion

test.run();
