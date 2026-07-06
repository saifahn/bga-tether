import { test } from 'uvu';
import * as assert from 'uvu/assert';
import * as fs from 'fs';
import * as path from 'path';
import {
  connectCardToGroup,
  Card,
  Group,
  Orientation,
} from './connectCardToGroup';
import { connectGroups } from './connectGroups';
import { getConnectingNumbers } from './getConnectingNumbers';

// These JSON fixtures are shared with the server: the same scenarios are run
// against the PHP ports in tests/Unit/BoardLogicTest.php, so the two rule
// implementations cannot drift apart silently. Cases marked phpOnly cover
// server-side hardening that the client does not implement.

const fixturesDir = path.join(__dirname, '..', '..', 'tests', 'fixtures', 'moves');

function loadFixtures<T>(file: string): T[] {
  return JSON.parse(fs.readFileSync(path.join(fixturesDir, file), 'utf8'));
}

interface BaseCase {
  name: string;
  phpOnly?: boolean;
  error?: string;
}

interface GroupWithConnection {
  group: Group;
  connection: { card: Card; x: number; y: number };
}

function throwsWithMessage(fn: () => unknown, message: string) {
  assert.throws(fn, (err: Error) => err.message === message);
}

for (const c of loadFixtures<BaseCase & { num: string; expected?: string[] }>(
  'getConnectingNumbers.json'
)) {
  if (c.phpOnly) continue;
  test(`fixture: getConnectingNumbers - ${c.name}`, () => {
    if (c.error !== undefined) {
      throwsWithMessage(() => getConnectingNumbers(c.num), c.error);
    } else {
      assert.equal(getConnectingNumbers(c.num), c.expected);
    }
  });
}

// getConnection.json is exercised only by tests/Unit/BoardLogicTest.php now -
// the client no longer has a getConnection function (findMatchingConnections/
// getConnections in getConnections.ts replaced it; see docs/multiple-connection-spots-ui.md).

for (const c of loadFixtures<
  BaseCase & {
    group: Group;
    card: Card;
    connection: { card: Card; x: number; y: number };
    orientation: Orientation;
    expected?: Group;
  }
>('connectCardToGroup.json')) {
  if (c.phpOnly) continue;
  test(`fixture: connectCardToGroup - ${c.name}`, () => {
    const run = () =>
      connectCardToGroup({
        group: c.group,
        card: c.card,
        connection: c.connection,
        orientation: c.orientation,
      });
    if (c.error !== undefined) {
      throwsWithMessage(run, c.error);
    } else {
      run();
      assert.equal(c.group, c.expected);
    }
  });
}

for (const c of loadFixtures<
  BaseCase & {
    group1: GroupWithConnection;
    group2: GroupWithConnection;
    orientation: Orientation;
    expected?: Group;
  }
>('connectGroups.json')) {
  if (c.phpOnly) continue;
  test(`fixture: connectGroups - ${c.name}`, () => {
    const run = () =>
      connectGroups({
        group1: c.group1,
        group2: c.group2,
        orientation: c.orientation,
      });
    if (c.error !== undefined) {
      throwsWithMessage(run, c.error);
    } else {
      assert.equal(run(), c.expected);
    }
  });
}

test.run();
