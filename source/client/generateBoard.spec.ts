import { generateGroup } from './generateBoard';
import { test, suite } from 'uvu';
import * as assert from 'uvu/assert';

const gen = suite('gen');

gen('should return an empty array when no group is provided', () => {
  const result = generateGroup({});
  assert.equal(result, []);
});

gen.run();
