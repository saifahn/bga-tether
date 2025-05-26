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
        x: 0,
        y: 1,
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
        x: 0,
        y: 0,
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
  'should connect a card to a group that has horizontal and vertical cards successfully for the vertical player',
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
        x: 1,
        y: 0,
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
    // data is always represented from the vertical player's perspective
    const group: Group = {
      number: 2,
      cards: {
        0: [{ id: '3', lowNum: '03', uprightFor: 'horizontal' }, null],
        1: [
          { id: '2', lowNum: '02', uprightFor: 'horizontal' },
          { id: '12', lowNum: '12', uprightFor: 'horizontal' },
        ],
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
        0: [{ id: '3', lowNum: '03', uprightFor: 'horizontal' }, null],
        1: [
          { id: '2', lowNum: '02', uprightFor: 'horizontal' },
          { id: '12', lowNum: '12', uprightFor: 'horizontal' },
        ],
        2: [{ id: '1', lowNum: '01', uprightFor: 'horizontal' }, null],
      },
    });
  }
);

connectCardToGroupTests(
  'should connect a card to the end of a row successfully for the horizontal player',
  () => {
    // horizontal player view:
    // 12
    // 02 03
    //
    // vertical player view:
    // 30 20
    //    21
    const group: Group = {
      number: 2,
      cards: {
        0: [{ id: '3', lowNum: '03', uprightFor: 'horizontal' }, null],
        1: [
          { id: '2', lowNum: '02', uprightFor: 'horizontal' },
          { id: '12', lowNum: '12', uprightFor: 'horizontal' },
        ],
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
        x: 0,
        y: 0,
      },
    });
    assert.equal(group, {
      number: 2,
      cards: {
        0: [{ id: '4', lowNum: '04', uprightFor: 'horizontal' }, null],
        1: [{ id: '3', lowNum: '03', uprightFor: 'horizontal' }, null],
        2: [
          { id: '2', lowNum: '02', uprightFor: 'horizontal' },
          { id: '12', lowNum: '12', uprightFor: 'horizontal' },
        ],
      },
    });
  }
);

connectCardToGroupTests(
  'can connect a card of a different orientation horizontally to a group of mixed orientations, with the card replacing a blank space (null)',
  () => {
    // for vertical:
    // 17 07
    //    08 97

    // for horizontal:
    // 79 80
    //    70 71
    const group: Group = {
      number: 2,
      cards: {
        0: [{ id: '17', lowNum: '17', uprightFor: 'vertical' }, null],
        1: [
          { id: '07', lowNum: '07', uprightFor: 'vertical' },
          { id: '08', lowNum: '08', uprightFor: 'vertical' },
        ],
        2: [null, { id: '79', lowNum: '79', uprightFor: 'horizontal' }],
      },
    };

    connectCardToGroup({
      group,
      card: {
        id: '69',
        lowNum: '69',
        uprightFor: 'horizontal',
      },
      orientation: 'horizontal',
      connection: {
        card: {
          id: '07',
          lowNum: '07',
          uprightFor: 'vertical',
        },
        x: 1,
        y: 0,
      },
    });

    assert.equal(group, {
      number: 2,
      cards: {
        0: [{ id: '17', lowNum: '17', uprightFor: 'vertical' }, null],
        1: [
          { id: '07', lowNum: '07', uprightFor: 'vertical' },
          { id: '08', lowNum: '08', uprightFor: 'vertical' },
        ],
        2: [
          { id: '69', lowNum: '69', uprightFor: 'horizontal' },
          { id: '79', lowNum: '79', uprightFor: 'horizontal' },
        ],
      },
    });
  }
);

connectCardToGroupTests(
  'can connect a card horizontally and fill in blank spaces correctly',
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
        x: 0,
        y: 3,
      },
    });

    assert.equal(group, {
      number: 2,
      cards: {
        0: [
          null,
          null,
          null,
          { id: '33', lowNum: '33', uprightFor: 'vertical' },
        ],
        1: [
          { id: '02', lowNum: '02', uprightFor: 'horizontal' },
          { id: '12', lowNum: '12', uprightFor: 'horizontal' },
          { id: '22', lowNum: '22', uprightFor: 'vertical' },
          { id: '23', lowNum: '23', uprightFor: 'vertical' },
        ],
      },
    });
  }
);

connectCardToGroupTests(
  'can connect a card of a different orientation vertically to a group of mixed orientations, with the card replacing a blank space (null)',
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
        id: '49',
        lowNum: '49',
        uprightFor: 'vertical',
      },
      orientation: 'vertical',
      connection: {
        card: {
          id: '05',
          lowNum: '05',
          uprightFor: 'horizontal',
        },
        x: 0,
        y: 1,
      },
    });

    assert.equal(group, {
      number: 2,
      cards: {
        0: [
          {
            id: '49',
            lowNum: '49',
            uprightFor: 'vertical',
          },
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
    });
  }
);

connectCardToGroupTests.run();
