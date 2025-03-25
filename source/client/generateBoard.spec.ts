import { generateGroupUI } from './generateBoard';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';

const gen = suite('gen');

gen(
  'should return cards in the right order when a three card vertical group is supplied',
  () => {
    const result = generateGroupUI({
      vertical: {
        '02': { id: '2', number: '02', upright: true },
        '03': { id: '3', number: '03', upright: true },
        '01': { id: '1', number: '01', upright: true },
      },
      horizontal: {
        '02': { id: '2', number: '02', upright: false },
        '03': { id: '3', number: '03', upright: false },
        '01': { id: '1', number: '01', upright: false },
      },
    });
    assert.equal(result, [
      [{ id: '1', number: '01', uprightFor: 'vertical' }],
      [{ id: '2', number: '02', uprightFor: 'vertical' }],
      [{ id: '3', number: '03', uprightFor: 'vertical' }],
    ]);
  }
);

gen(
  'should return cards in the right order when a two card horizontal group is supplied',
  () => {}
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
