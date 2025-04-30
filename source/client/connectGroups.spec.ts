import { connectGroups, Group } from './genGroupUI';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';

const connectGroupsTests = suite('connectGroups');
connectGroupsTests(
  'should connect two groups of same columns vertically successfully',
  () => {
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
      smallerGroup: {
        group: group1,
        connection: {
          card: { id: '2', lowNum: '02', uprightFor: 'vertical' },
          x: 0,
          y: 1,
        },
      },
      largerGroup: {
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
  }
);

connectGroupsTests(
  'should connect two groups of different columns vertically successfully',
  () => {
    const group1: Group = {
      number: 1,
      cards: {
        0: [null, { id: '38', lowNum: '38', uprightFor: 'vertical' }],
        1: [
          {
            id: '27',
            lowNum: '27',
            uprightFor: 'vertical',
          },
          {
            id: '28',
            lowNum: '28',
            uprightFor: 'vertical',
          },
        ],
        2: [
          {
            id: '17',
            lowNum: '17',
            uprightFor: 'vertical',
          },
          null,
        ],
      },
    };
    const group2: Group = {
      number: 2,
      cards: {
        0: [
          { id: '29', lowNum: '29', uprightFor: 'vertical' },
          { id: '03', lowNum: '03', uprightFor: 'horizontal' },
        ],
      },
    };

    const result = connectGroups({
      smallerGroup: {
        group: group1,
        connection: {
          card: { id: '28', lowNum: '28', uprightFor: 'vertical' },
          x: 1,
          y: 1,
        },
      },
      largerGroup: {
        group: group2,
        connection: {
          card: { id: '29', lowNum: '29', uprightFor: 'vertical' },
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
          null,
          { id: '38', lowNum: '38', uprightFor: 'vertical' },
          null,
          null,
        ],
        1: [
          {
            id: '27',
            lowNum: '27',
            uprightFor: 'vertical',
          },
          {
            id: '28',
            lowNum: '28',
            uprightFor: 'vertical',
          },
          { id: '29', lowNum: '29', uprightFor: 'vertical' },
          { id: '03', lowNum: '03', uprightFor: 'horizontal' },
        ],
        2: [
          {
            id: '17',
            lowNum: '17',
            uprightFor: 'vertical',
          },
          null,
          null,
          null,
        ],
      },
    });
  }
);

connectGroupsTests.run();
