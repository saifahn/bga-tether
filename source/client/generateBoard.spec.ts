import { generateGroup } from './generateBoard';
import { test, suite } from 'uvu';
import * as assert from 'uvu/assert';

const gen = suite('gen');

gen('should return an empty array when no group is provided', () => {
  const result = generateGroup({});
  assert.equal(result, []);
});

gen(
  'should return cards in the right order when a two card vertical group is supplied',
  () => {
    const result = generateGroup({
      vertical: {
        '01': { id: '1', number: '01', flipped: false },
        '02': { id: '2', number: '02', flipped: false },
      },
    });
    assert.equal(result, [
      [{ id: '1', number: '01', flipped: false, uprightFor: 'vertical' }],
      [{ id: '2', number: '02', flipped: false, uprightFor: 'vertical' }],
    ]);
  }
);

gen(
  'should return cards in the right order when a two card horizontal group is supplied',
  () => {
    const result = generateGroup({
      horizontal: {
        '01': { id: '1', number: '01', flipped: false },
        '02': { id: '2', number: '02', flipped: false },
      },
    });
    assert.equal(result, [
      { id: '1', number: '01', flipped: false, uprightFor: 'horizontal' },
      { id: '2', number: '02', flipped: false, uprightFor: 'horizontal' },
    ]);
  }
);

gen(
  'should return cards in the right order when a two card group of flipped cards is supplied',
  () => {}
);

gen(
  'should return cards in the right order when a two card group of mixed flip orientation is supplied',
  () => {}
);

gen.run();
