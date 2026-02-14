import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { countCardsInGroup } from './countCardsInGroup';
import { Group, Card } from './connectCardToGroup';

const test = suite('countCardsInGroup');

// Helper function to create a mock card
function createCard(id: string, lowNum: string): Card {
  return {
    id,
    lowNum,
    uprightFor: 'vertical',
  };
}

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
      0: [createCard('1', '01')],
    },
  };
  assert.is(countCardsInGroup(group), 1);
});

test('counts 5 cards in group', () => {
  const group: Group = {
    id: '1',
    cards: {
      0: [createCard('1', '01'), createCard('2', '12')],
      1: [createCard('3', '23'), createCard('4', '34')],
      2: [createCard('5', '45')],
    },
  };
  assert.is(countCardsInGroup(group), 5);
});

test('counts 6 cards (first scoring threshold)', () => {
  const group: Group = {
    id: '1',
    cards: {
      0: [createCard('1', '01'), createCard('2', '12')],
      1: [createCard('3', '23'), createCard('4', '34')],
      2: [createCard('5', '45'), createCard('6', '56')],
    },
  };
  assert.is(countCardsInGroup(group), 6);
});

test('counts 10 cards (second scoring threshold)', () => {
  const group: Group = {
    id: '1',
    cards: {
      0: [createCard('1', '01'), createCard('2', '12'), createCard('3', '23')],
      1: [createCard('4', '34'), createCard('5', '45'), createCard('6', '56')],
      2: [createCard('7', '67'), createCard('8', '78')],
      3: [createCard('9', '89'), createCard('10', '90')],
    },
  };
  assert.is(countCardsInGroup(group), 10);
});

test('counts 14 cards (third scoring threshold)', () => {
  const group: Group = {
    id: '1',
    cards: {
      0: [createCard('1', '01'), createCard('2', '12'), createCard('3', '23'), createCard('4', '34')],
      1: [createCard('5', '45'), createCard('6', '56'), createCard('7', '67'), createCard('8', '78')],
      2: [createCard('9', '89'), createCard('10', '90'), createCard('11', '01')],
      3: [createCard('12', '12'), createCard('13', '23'), createCard('14', '34')],
    },
  };
  assert.is(countCardsInGroup(group), 14);
});

test('ignores null cards in sparse grid', () => {
  const group: Group = {
    id: '1',
    cards: {
      0: [createCard('1', '01'), null, createCard('3', '23')],
      1: [null, createCard('4', '34'), null],
      2: [createCard('7', '67'), null, createCard('9', '89')],
    },
  };
  assert.is(countCardsInGroup(group), 5);
});

test('counts cards with multiple columns of different heights', () => {
  const group: Group = {
    id: '1',
    cards: {
      0: [createCard('1', '01')],
      1: [createCard('2', '12'), createCard('3', '23'), createCard('4', '34')],
      2: [createCard('5', '45'), createCard('6', '56')],
    },
  };
  assert.is(countCardsInGroup(group), 6);
});

test('handles single column with multiple cards', () => {
  const group: Group = {
    id: '1',
    cards: {
      0: [
        createCard('1', '01'),
        createCard('2', '12'),
        createCard('3', '23'),
        createCard('4', '34'),
        createCard('5', '45'),
      ],
    },
  };
  assert.is(countCardsInGroup(group), 5);
});

test('handles single row with multiple cards', () => {
  const group: Group = {
    id: '1',
    cards: {
      0: [createCard('1', '01')],
      1: [createCard('2', '12')],
      2: [createCard('3', '23')],
      3: [createCard('4', '34')],
      4: [createCard('5', '45')],
    },
  };
  assert.is(countCardsInGroup(group), 5);
});

test.run();
