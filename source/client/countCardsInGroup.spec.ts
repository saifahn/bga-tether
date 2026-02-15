import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { countCardsInGroup } from './countCardsInGroup';
import { Group } from './connectCardToGroup';

const test = suite('countCardsInGroup');

test('counts 0 cards in empty group', () => {
  const group: Group = {
    id: '1',
    cards: {},
  };
  assert.is(countCardsInGroup(group), 0);
});

test('counts 1 card in single card group', () => {
  const group: Group = {
    id: '1',
    cards: {
      0: [{ id: '1', lowNum: '01', uprightFor: 'vertical' }],
    },
  };
  assert.is(countCardsInGroup(group), 1);
});

test('counts 2 cards in simple vertical column', () => {
  const group: Group = {
    id: '2',
    cards: {
      0: [
        { id: '2', lowNum: '02', uprightFor: 'vertical' },
        { id: '1', lowNum: '01', uprightFor: 'vertical' },
      ],
    },
  };
  assert.is(countCardsInGroup(group), 2);
});

test('counts 3 cards in simple horizontal row', () => {
  const group: Group = {
    id: '3',
    cards: {
      0: [{ id: '1', lowNum: '01', uprightFor: 'horizontal' }],
      1: [{ id: '2', lowNum: '02', uprightFor: 'horizontal' }],
      2: [{ id: '3', lowNum: '03', uprightFor: 'horizontal' }],
    },
  };
  assert.is(countCardsInGroup(group), 3);
});

test('counts 4 cards in mixed orientation group', () => {
  // Vertical view:
  // 51
  // 50 40
  //    39
  const group: Group = {
    id: '2',
    cards: {
      0: [
        { id: '15', lowNum: '15', uprightFor: 'horizontal' },
        { id: '05', lowNum: '05', uprightFor: 'horizontal' },
        null,
      ],
      1: [
        null,
        { id: '04', lowNum: '04', uprightFor: 'horizontal' },
        { id: '39', lowNum: '39', uprightFor: 'vertical' },
      ],
    },
  };
  assert.is(countCardsInGroup(group), 4);
});

test('counts 6 cards (first scoring threshold)', () => {
  const group: Group = {
    id: '100',
    cards: {
      0: [
        { id: '58', lowNum: '58', uprightFor: 'vertical' },
        { id: '57', lowNum: '57', uprightFor: 'vertical' },
        null,
      ],
      1: [
        null,
        { id: '47', lowNum: '47', uprightFor: 'vertical' },
        null,
      ],
      2: [
        null,
        { id: '37', lowNum: '37', uprightFor: 'vertical' },
        { id: '36', lowNum: '36', uprightFor: 'vertical' },
      ],
      3: [
        null,
        null,
        { id: '26', lowNum: '26', uprightFor: 'vertical' },
      ],
    },
  };
  assert.is(countCardsInGroup(group), 6);
});

test('counts 10 cards (second scoring threshold)', () => {
  const group: Group = {
    id: '50',
    cards: {
      0: [
        { id: '34', lowNum: '34', uprightFor: 'vertical' },
        { id: '33', lowNum: '33', uprightFor: 'vertical' },
        null,
        null,
      ],
      1: [
        null,
        { id: '23', lowNum: '23', uprightFor: 'vertical' },
        { id: '22', lowNum: '22', uprightFor: 'vertical' },
        null,
      ],
      2: [
        null,
        { id: '13', lowNum: '13', uprightFor: 'vertical' },
        { id: '12', lowNum: '12', uprightFor: 'vertical' },
        { id: '11', lowNum: '11', uprightFor: 'vertical' },
      ],
      3: [
        null,
        { id: '03', lowNum: '03', uprightFor: 'vertical' },
        null,
        { id: '01', lowNum: '01', uprightFor: 'vertical' },
      ],
      4: [
        null,
        { id: '29', lowNum: '29', uprightFor: 'horizontal' },
        null,
        null,
      ],
    },
  };
  assert.is(countCardsInGroup(group), 10);
});

test('counts 14 cards (third scoring threshold)', () => {
  const group: Group = {
    id: '75',
    cards: {
      0: [
        { id: '23', lowNum: '23', uprightFor: 'vertical' },
        { id: '22', lowNum: '22', uprightFor: 'vertical' },
        { id: '12', lowNum: '12', uprightFor: 'horizontal' },
        { id: '02', lowNum: '02', uprightFor: 'horizontal' },
      ],
      1: [
        { id: '33', lowNum: '33', uprightFor: 'vertical' },
        { id: '23', lowNum: '23', uprightFor: 'horizontal' },
        { id: '13', lowNum: '13', uprightFor: 'horizontal' },
        { id: '03', lowNum: '03', uprightFor: 'horizontal' },
      ],
      2: [
        { id: '34', lowNum: '34', uprightFor: 'horizontal' },
        { id: '24', lowNum: '24', uprightFor: 'horizontal' },
        { id: '14', lowNum: '14', uprightFor: 'horizontal' },
        { id: '04', lowNum: '04', uprightFor: 'horizontal' },
      ],
      3: [
        { id: '35', lowNum: '35', uprightFor: 'horizontal' },
        { id: '25', lowNum: '25', uprightFor: 'horizontal' },
        null,
        null,
      ],
    },
  };
  assert.is(countCardsInGroup(group), 14);
});

test('ignores null cards in sparse grid with mixed orientations', () => {
  const group: Group = {
    id: '2',
    cards: {
      0: [null, { id: '3', lowNum: '03', uprightFor: 'horizontal' }],
      1: [
        { id: '12', lowNum: '12', uprightFor: 'horizontal' },
        { id: '2', lowNum: '02', uprightFor: 'horizontal' },
      ],
      2: [null, { id: '4', lowNum: '04', uprightFor: 'horizontal' }],
    },
  };
  assert.is(countCardsInGroup(group), 4);
});

test.run();
