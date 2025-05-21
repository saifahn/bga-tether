import { connectCardToGroup, Group } from './connectCardToGroup';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';

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
        y: 0,
        x: 1,
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
        y: 0,
        x: 0,
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
        y: 1,
        x: 0,
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

connectCardToGroupTests(
  'should connect a card to the beginning of a row successfully for the horizontal player',
  () => {
    const group: Group = {
      number: 2,
      cards: {
        0: [
          { id: '12', lowNum: '12', uprightFor: 'horizontal' },
          { id: '2', lowNum: '02', uprightFor: 'horizontal' },
        ],
        1: [null, { id: '3', lowNum: '03', uprightFor: 'horizontal' }],
      },
    };
    connectCardToGroup({
      group,
      card: {
        id: '1',
        lowNum: '01',
        uprightFor: 'horizontal',
      },
      orientation: 'horizontal',
      connection: {
        card: {
          id: '2',
          lowNum: '02',
          uprightFor: 'horizontal',
        },
        y: 0,
        x: 1,
      },
    });
    assert.equal(group, {
      number: 2,
      cards: {
        0: [null, { id: '1', lowNum: '01', uprightFor: 'horizontal' }],
        1: [
          { id: '12', lowNum: '12', uprightFor: 'horizontal' },
          { id: '2', lowNum: '02', uprightFor: 'horizontal' },
        ],
        2: [null, { id: '3', lowNum: '03', uprightFor: 'horizontal' }],
      },
    });
  }
);

// FIXME: should the data all be from the perspective of vertical player?
connectCardToGroupTests(
  'should connect a card to the end of a row successfully for the horizontal player',
  () => {
    // horizontal player view:
    // 12
    // 02 03
    //
    // vertical player view:
    // 20 30
    // 21
    const group: Group = {
      number: 2,
      cards: {
        0: [
          { id: '12', lowNum: '12', uprightFor: 'horizontal' },
          { id: '2', lowNum: '02', uprightFor: 'horizontal' },
        ],
        1: [null, { id: '3', lowNum: '03', uprightFor: 'horizontal' }],
      },
    };
    connectCardToGroup({
      group,
      card: {
        id: '4',
        lowNum: '04',
        uprightFor: 'horizontal',
      },
      orientation: 'horizontal',
      connection: {
        card: {
          id: '3',
          lowNum: '03',
          uprightFor: 'horizontal',
        },
        y: 1,
        x: 1,
      },
    });
    assert.equal(group, {
      number: 2,
      cards: {
        0: [
          { id: '12', lowNum: '12', uprightFor: 'horizontal' },
          { id: '2', lowNum: '02', uprightFor: 'horizontal' },
        ],
        1: [null, { id: '3', lowNum: '03', uprightFor: 'horizontal' }],
        2: [null, { id: '4', lowNum: '04', uprightFor: 'horizontal' }],
      },
    });
  }
);

connectCardToGroupTests(
  'can connect a card horizontally to a group of different orientations',
  () => {
    // for vertical:
    // 20
    // 21
    // 22
    // 23

    // for horizontal:
    // 32
    // 22
    // 12
    // 02
    const group: Group = {
      number: 2,
      cards: {
        0: [
          { id: '02', lowNum: '02', uprightFor: 'horizontal' },
          { id: '12', lowNum: '12', uprightFor: 'horizontal' },
          { id: '22', lowNum: '22', uprightFor: 'vertical' },
          { id: '23', lowNum: '23', uprightFor: 'vertical' },
        ],
      },
    };

    connectCardToGroup({
      group,
      card: {
        id: '33',
        lowNum: '33',
        uprightFor: 'vertical',
      },
      orientation: 'horizontal',
      connection: {
        card: {
          id: '23',
          lowNum: '23',
          uprightFor: 'vertical',
        },
        y: 0,
        x: 3,
      },
    });

    assert.equal(group, {
      number: 2,
      cards: {
        0: [
          { id: '02', lowNum: '02', uprightFor: 'horizontal' },
          { id: '12', lowNum: '12', uprightFor: 'horizontal' },
          { id: '22', lowNum: '22', uprightFor: 'vertical' },
          { id: '23', lowNum: '23', uprightFor: 'vertical' },
        ],
        1: [
          null,
          null,
          null,
          { id: '33', lowNum: '33', uprightFor: 'vertical' },
        ],
      },
    });
  }
);

connectCardToGroupTests(
  'can connect a card horizontally to a group of different orientations',
  () => {
    // for vertical:
    //    39
    // 50 40
    // 51
    const group: Group = {
      number: 2,
      cards: {
        0: [
          null,
          {
            id: '05',
            lowNum: '05',
            uprightFor: 'horizontal',
          },
          {
            id: '15',
            lowNum: '15',
            uprightFor: 'horizontal',
          },
        ],
        1: [
          { id: '39', lowNum: '39', uprightFor: 'vertical' },
          { id: '04', lowNum: '04', uprightFor: 'horizontal' },
          null,
        ],
      },
    };

    connectCardToGroup({
      group,
      card: {
        id: '25',
        lowNum: '25',
        uprightFor: 'horizontal',
      },
      orientation: 'vertical',
      connection: {
        card: {
          id: '15',
          lowNum: '15',
          uprightFor: 'horizontal',
        },
        y: 0,
        x: 2,
      },
    });

    assert.equal(group, {
      number: 2,
      cards: {
        0: [
          null,
          {
            id: '05',
            lowNum: '05',
            uprightFor: 'horizontal',
          },
          {
            id: '15',
            lowNum: '15',
            uprightFor: 'horizontal',
          },
          { id: '25', lowNum: '25', uprightFor: 'horizontal' },
        ],
        1: [
          { id: '39', lowNum: '39', uprightFor: 'vertical' },
          { id: '04', lowNum: '04', uprightFor: 'horizontal' },
          null,
          null,
        ],
      },
    });
  }
);

connectCardToGroupTests.run();
