import { getConnections, findMatchingConnections } from './getConnections';
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { Card, Group } from './connectCardToGroup';

test('getConnections returns a single candidate when only one match exists', () => {
  const group: Group = {
    id: '2',
    cards: {
      0: [
        { id: '2', lowNum: '02', uprightFor: 'vertical' },
        { id: '1', lowNum: '01', uprightFor: 'vertical' },
      ],
    },
  };
  const card: Card = { id: '3', lowNum: '03', uprightFor: 'vertical' };

  const result = getConnections(card, group, 'vertical');
  assert.equal(result, [
    {
      connection: {
        card: { id: '2', lowNum: '02', uprightFor: 'vertical' },
        x: 0,
        y: 0,
      },
      landingCell: { x: 0, y: -1 },
    },
  ]);
});

test('getConnections returns a distinct candidate for each landing cell when the group has been bent so both neighbours are present', () => {
  // column 0 holds 22, column 1 holds 20 (bridged elsewhere by the
  // opponent's cross-orientation cards) - a played 21 can attach after the
  // 22 or before the 20, landing in two different cells.
  const group: Group = {
    id: '5',
    cards: {
      0: [{ id: '22', lowNum: '22', uprightFor: 'vertical' }],
      1: [{ id: '20', lowNum: '20', uprightFor: 'vertical' }],
    },
  };
  const card: Card = { id: '21', lowNum: '21', uprightFor: 'vertical' };

  const result = getConnections(card, group, 'vertical');
  assert.is(result.length, 2);
  assert.equal(
    result.map((c) => c.landingCell),
    [
      { x: 0, y: 1 },
      { x: 1, y: -1 },
    ]
  );
});

test('getConnections dedupes two matches that would land in the same cell', () => {
  // a 21 played between a 20 and a 22 one cell apart in the same column:
  // both connections resolve to the same empty landing cell, so there is
  // really only one choice.
  const group: Group = {
    id: '5',
    cards: {
      0: [
        { id: '22', lowNum: '22', uprightFor: 'vertical' },
        null,
        { id: '20', lowNum: '20', uprightFor: 'vertical' },
      ],
    },
  };
  const card: Card = { id: '21', lowNum: '21', uprightFor: 'vertical' };

  const result = getConnections(card, group, 'vertical');
  assert.is(result.length, 1);
  assert.equal(result[0]!.landingCell, { x: 0, y: 1 });
});

test('getConnections drops a candidate whose landing cell is already occupied', () => {
  const group: Group = {
    id: '3',
    cards: {
      0: [
        { id: '1', lowNum: '01', uprightFor: 'vertical' },
        { id: '2', lowNum: '02', uprightFor: 'vertical' },
      ],
    },
  };
  const card: Card = { id: '3', lowNum: '03', uprightFor: 'vertical' };

  const result = getConnections(card, group, 'vertical');
  assert.equal(result, []);
});

test('findMatchingConnections collects every matching card, unlike getConnection', () => {
  const group: Group = {
    id: '5',
    cards: {
      0: [{ id: '22', lowNum: '22', uprightFor: 'vertical' }],
      1: [{ id: '20', lowNum: '20', uprightFor: 'vertical' }],
    },
  };
  const card: Card = { id: '21', lowNum: '21', uprightFor: 'vertical' };

  const result = findMatchingConnections(card, group, 'vertical');
  assert.equal(result, [
    { card: { id: '22', lowNum: '22', uprightFor: 'vertical' }, x: 0, y: 0 },
    { card: { id: '20', lowNum: '20', uprightFor: 'vertical' }, x: 1, y: 0 },
  ]);
});

test.run();
