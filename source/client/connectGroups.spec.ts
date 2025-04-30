import { connectGroups, Group } from './genGroupUI';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';

const connectGroupsTests = suite('connectGroups');
connectGroupsTests('should connect two groups vertically successfully', () => {
  const group1: Group = {
    number: 1,
    cards: {
      0: [
        { id: '1', lowNum: '01', uprightFor: 'vertical' },
        { id: '2', lowNum: '02', uprightFor: 'vertical' },
      ],
    },
  };
  const group2: Group = {
    number: 2,
    cards: {
      0: [
        { id: '3', lowNum: '03', uprightFor: 'vertical' },
        { id: '4', lowNum: '04', uprightFor: 'vertical' },
      ],
    },
  };

  const result = connectGroups({
    group1: {
      group: group1,
      connection: {
        card: { id: '2', lowNum: '02', uprightFor: 'vertical' },
        x: 0,
        y: 1,
      },
    },
    group2: {
      group: group2,
      connection: {
        card: { id: '3', lowNum: '03', uprightFor: 'vertical' },
        x: 0,
        y: 0,
      },
    },
    orientation: 'vertical',
  });

  assert.equal(result, {
    number: 1,
    cards: {
      0: [
        { id: '1', lowNum: '01', uprightFor: 'vertical' },
        { id: '2', lowNum: '02', uprightFor: 'vertical' },
        { id: '3', lowNum: '03', uprightFor: 'vertical' },
        { id: '4', lowNum: '04', uprightFor: 'vertical' },
      ],
    },
  });
});

connectGroupsTests.run();
