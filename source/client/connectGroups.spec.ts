import { Group } from './connectCardToGroup';
import { connectGroups } from './connectGroups';
import { test } from 'uvu';
import * as assert from 'uvu/assert';

// TODO: table-driven tests?
test('should successfully connect two aligned groups vertically', () => {
  const group1: Group = {
    number: 1,
    cards: {
      0: [
        { id: '1', lowNum: '01', uprightFor: 'vertical' },
        { id: '2', lowNum: '02', uprightFor: 'vertical' },
      ],
    },
  };
  const group2: Group = {
    number: 2,
    cards: {
      0: [
        { id: '3', lowNum: '03', uprightFor: 'vertical' },
        { id: '4', lowNum: '04', uprightFor: 'vertical' },
      ],
    },
  };

  const result = connectGroups({
    smallerGroup: {
      group: group1,
      connection: {
        card: { id: '2', lowNum: '02', uprightFor: 'vertical' },
        x: 0,
        y: 1,
      },
    },
    largerGroup: {
      group: group2,
      connection: {
        card: { id: '3', lowNum: '03', uprightFor: 'vertical' },
        x: 0,
        y: 0,
      },
    },
    orientation: 'vertical',
  });

  assert.equal(result, {
    number: 1,
    cards: {
      0: [
        { id: '1', lowNum: '01', uprightFor: 'vertical' },
        { id: '2', lowNum: '02', uprightFor: 'vertical' },
        { id: '3', lowNum: '03', uprightFor: 'vertical' },
        { id: '4', lowNum: '04', uprightFor: 'vertical' },
      ],
    },
  });
});

test('should successfully connect two groups vertically with an offset that creates a wider new group', () => {
  const group1: Group = {
    number: 1,
    cards: {
      0: [null, { id: '38', lowNum: '38', uprightFor: 'vertical' }],
      1: [
        {
          id: '27',
          lowNum: '27',
          uprightFor: 'vertical',
        },
        {
          id: '28',
          lowNum: '28',
          uprightFor: 'vertical',
        },
      ],
      2: [
        {
          id: '17',
          lowNum: '17',
          uprightFor: 'vertical',
        },
        null,
      ],
    },
  };
  const group2: Group = {
    number: 2,
    cards: {
      0: [
        { id: '29', lowNum: '29', uprightFor: 'vertical' },
        { id: '03', lowNum: '03', uprightFor: 'horizontal' },
      ],
    },
  };

  const result = connectGroups({
    smallerGroup: {
      group: group1,
      connection: {
        card: { id: '28', lowNum: '28', uprightFor: 'vertical' },
        x: 1,
        y: 1,
      },
    },
    largerGroup: {
      group: group2,
      connection: {
        card: { id: '29', lowNum: '29', uprightFor: 'vertical' },
        x: 0,
        y: 0,
      },
    },
    orientation: 'vertical',
  });

  assert.equal(result, {
    number: 1,
    cards: {
      0: [null, { id: '38', lowNum: '38', uprightFor: 'vertical' }, null, null],
      1: [
        {
          id: '27',
          lowNum: '27',
          uprightFor: 'vertical',
        },
        {
          id: '28',
          lowNum: '28',
          uprightFor: 'vertical',
        },
        { id: '29', lowNum: '29', uprightFor: 'vertical' },
        { id: '03', lowNum: '03', uprightFor: 'horizontal' },
      ],
      2: [
        {
          id: '17',
          lowNum: '17',
          uprightFor: 'vertical',
        },
        null,
        null,
        null,
      ],
    },
  });
});

test('should connect two groups of different columns vertically successfully with negative offset', () => {
  const group1: Group = {
    number: 1,
    cards: {
      0: [
        null,
        { id: '57', lowNum: '57', uprightFor: 'vertical' },
        { id: '58', lowNum: '58', uprightFor: 'vertical' },
      ],
      1: [
        null,
        {
          id: '47',
          lowNum: '47',
          uprightFor: 'vertical',
        },
        null,
      ],
      2: [
        {
          id: '36',
          lowNum: '36',
          uprightFor: 'vertical',
        },
        {
          id: '37',
          lowNum: '37',
          uprightFor: 'vertical',
        },
        null,
      ],
    },
  };
  const group2: Group = {
    number: 2,
    cards: {
      0: [{ id: '69', lowNum: '69', uprightFor: 'vertical' }, null],
      1: [
        { id: '59', lowNum: '59', uprightFor: 'vertical' },
        { id: '60', lowNum: '60', uprightFor: 'vertical' },
      ],
    },
  };

  const result = connectGroups({
    smallerGroup: {
      group: group1,
      connection: {
        card: { id: '58', lowNum: '58', uprightFor: 'vertical' },
        x: 0,
        y: 2,
      },
    },
    largerGroup: {
      group: group2,
      connection: {
        card: { id: '59', lowNum: '59', uprightFor: 'vertical' },
        x: 1,
        y: 0,
      },
    },
    orientation: 'vertical',
  });

  assert.equal(result, {
    number: 1,
    cards: {
      0: [
        null,
        null,
        null,
        { id: '69', lowNum: '69', uprightFor: 'vertical' },
        null,
      ],
      1: [
        null,
        { id: '57', lowNum: '57', uprightFor: 'vertical' },
        { id: '58', lowNum: '58', uprightFor: 'vertical' },
        { id: '59', lowNum: '59', uprightFor: 'vertical' },
        { id: '60', lowNum: '60', uprightFor: 'vertical' },
      ],
      2: [
        null,
        {
          id: '47',
          lowNum: '47',
          uprightFor: 'vertical',
        },
        null,
        null,
        null,
      ],
      3: [
        {
          id: '36',
          lowNum: '36',
          uprightFor: 'vertical',
        },
        {
          id: '37',
          lowNum: '37',
          uprightFor: 'vertical',
        },
        null,
        null,
        null,
      ],
    },
  });
});

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
    smallerGroup: {
      group: group1,
      connection: {
        card: { id: '58', lowNum: '58', uprightFor: 'horizontal' },
        x: 0,
        y: 0,
      },
    },
    largerGroup: {
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
    smallerGroup: {
      group: group1,
      connection: {
        card: { id: '58', lowNum: '58', uprightFor: 'horizontal' },
        x: 0,
        y: 0,
      },
    },
    largerGroup: {
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

test.run();
