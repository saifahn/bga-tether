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
      cards: {
        0: [
          { id: '1', lowNum: '01', uprightFor: 'vertical' },
          { id: '2', lowNum: '02', uprightFor: 'vertical' },
        ],
      },
    };
    connectCardToGroup({
      group,
      card: {
        id: '3',
        lowNum: '03',
        uprightFor: 'vertical',
      },
      orientation: 'vertical',
      connection: {
        card: {
          id: '2',
          lowNum: '02',
          uprightFor: 'vertical',
        },
        columnIndex: 0,
        rowIndex: 1,
      },
    });

    assert.equal(group, {
      number: 2,
      cards: {
        0: [
          { id: '1', lowNum: '01', uprightFor: 'vertical' },
          { id: '2', lowNum: '02', uprightFor: 'vertical' },
          { id: '3', lowNum: '03', uprightFor: 'vertical' },
        ],
      },
    });
  }
);

connectCardToGroupTests(
  'should connect a lesser card to the top of a group of 2 cards',
  () => {
    const group: Group = {
      number: 2,
      cards: {
        0: [
          { id: '2', lowNum: '02', uprightFor: 'vertical' },
          { id: '3', lowNum: '03', uprightFor: 'vertical' },
        ],
      },
    };
    connectCardToGroup({
      group,
      card: {
        id: '1',
        lowNum: '01',
        uprightFor: 'vertical',
      },
      orientation: 'vertical',
      connection: {
        card: {
          id: '2',
          lowNum: '02',
          uprightFor: 'vertical',
        },
        columnIndex: 0,
        rowIndex: 0,
      },
    });
    assert.equal(group, {
      number: 2,
      cards: {
        0: [
          { id: '1', lowNum: '01', uprightFor: 'vertical' },
          { id: '2', lowNum: '02', uprightFor: 'vertical' },
          { id: '3', lowNum: '03', uprightFor: 'vertical' },
        ],
      },
    });
  }
);

connectCardToGroupTests(
  'should connect a card to a group that has horizontal and vertical cards',
  () => {
    const group: Group = {
      number: 2,
      cards: {
        0: [
          { id: '2', lowNum: '02', uprightFor: 'vertical' },
          { id: '3', lowNum: '03', uprightFor: 'vertical' },
        ],
        1: [{ id: '12', lowNum: '12', uprightFor: 'vertical' }, null],
      },
    };
    connectCardToGroup({
      group,
      card: {
        id: '11',
        lowNum: '11',
        uprightFor: 'vertical',
      },
      orientation: 'vertical',
      connection: {
        card: {
          id: '12',
          lowNum: '12',
          uprightFor: 'vertical',
        },
        columnIndex: 1,
        rowIndex: 0,
      },
    });

    assert.equal(group, {
      number: 2,
      cards: {
        0: [
          null,
          { id: '2', lowNum: '02', uprightFor: 'vertical' },
          { id: '3', lowNum: '03', uprightFor: 'vertical' },
        ],
        1: [
          { id: '11', lowNum: '11', uprightFor: 'vertical' },
          { id: '12', lowNum: '12', uprightFor: 'vertical' },
          null,
        ],
      },
    });
  }
);

// TODO: horizontal

connectCardToGroupTests.run();
