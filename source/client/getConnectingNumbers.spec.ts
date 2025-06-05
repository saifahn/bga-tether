import { getConnectingNumbers } from './getConnectingNumbers';
import { test } from 'uvu';
import * as assert from 'uvu/assert';

test('getConnectingNumbers should behave as expected', () => {
  assert.throws(
    () => getConnectingNumbers('0'),
    'the number string should be exactly 2 characters long'
  );
  assert.throws(
    () => getConnectingNumbers('00'),
    'the number must be between 01 and 98'
  );
  assert.throws(
    () => getConnectingNumbers('99'),
    'the number must be between 01 and 98'
  );

  assert.equal(getConnectingNumbers('32'), ['31', '33']);
  assert.equal(getConnectingNumbers('02'), ['01', '03']);
});

test.run();
