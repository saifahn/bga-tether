import { getConnection } from './getConnection';
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { Card, Group } from './connectCardToGroup';

test('getConnection should return an error when a card cannot be connected to a group', () => {
  const group: Group = {
    number: 2,
    cards: {
      0: [
        { id: '1', lowNum: '01', uprightFor: 'vertical' },
        { id: '2', lowNum: '02', uprightFor: 'vertical' },
      ],
      1: [null, { id: '19', lowNum: '19', uprightFor: 'horizontal' }],
    },
  };
  const card: Card = {
    id: '67',
    lowNum: '67',
    uprightFor: 'vertical',
  };
  // getConnection(card, group);
  assert.throws(() => getConnection(card, group));
});

test('getConnection should return the correct coordinates', () => {
  const group: Group = {
    number: 2,
    cards: {
      0: [
        { id: '1', lowNum: '01', uprightFor: 'vertical' },
        { id: '2', lowNum: '02', uprightFor: 'vertical' },
      ],
      1: [null, { id: '19', lowNum: '19', uprightFor: 'horizontal' }],
    },
  };
  const card: Card = {
    id: '29',
    lowNum: '29',
    uprightFor: 'horizontal',
  };
  const result = getConnection(card, group);
  assert.equal(result, { x: 1, y: 1 });
});

test.run();
