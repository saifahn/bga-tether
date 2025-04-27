import { getConnectingCardNums, connectCardToGroup, Group } from './genGroupUI';
import { suite, test } from 'uvu';
import * as assert from 'uvu/assert';

const connectingNumsTests = suite('getConnectingCardNums');

connectingNumsTests(
  'should return the connecting card numbers for a card',
  () => {
    const result = getConnectingCardNums('02');
    assert.equal(result, ['01', '03']);
  }
);

connectingNumsTests.run();

const connectCardToGroupTests = suite('connectCardToGroup');

connectCardToGroupTests(
  'should connect a greater card to the bottom of a group of 2 cards',
  () => {
    const group: Group = {
      number: 2,
      0: [
        { id: '1', lowNum: '01', uprightFor: 'vertical' },
        { id: '2', lowNum: '02', uprightFor: 'vertical' },
      ],
    };
    connectCardToGroup({
      group,
      card: {
        id: '3',
        lowNum: '03',
        uprightFor: 'vertical',
      },
      orientation: 'vertical',
      connectingCard: {
        id: '2',
        lowNum: '02',
        uprightFor: 'vertical',
      },
    });

    assert.equal(group, {
      number: 2,
      0: [
        { id: '1', lowNum: '01', uprightFor: 'vertical' },
        { id: '2', lowNum: '02', uprightFor: 'vertical' },
        { id: '3', lowNum: '03', uprightFor: 'vertical' },
      ],
    });
  }
);

connectCardToGroupTests.run();
