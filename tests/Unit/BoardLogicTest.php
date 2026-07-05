<?php
declare(strict_types=1);

namespace Bga\Games\TetherGame\Tests\Unit;

use PHPUnit\Framework\TestCase;
use Bga\Games\TetherGame\BoardLogic;

/**
 * Fixture-driven tests shared with the client: the same JSON scenarios in
 * tests/fixtures/moves are run against the TypeScript implementations by
 * source/client/fixtures.spec.ts, so the two rule implementations cannot
 * drift apart silently. Cases marked "phpOnly" cover server hardening the
 * client does not implement.
 */
class BoardLogicTest extends TestCase
{
    private static function loadFixtures(string $file): array
    {
        $json = file_get_contents(__DIR__ . '/../fixtures/moves/' . $file);
        return json_decode($json, true);
    }

    /**
     * Group cards decoded from JSON need their column keys as ints, matching
     * the shape GroupLogic::createGroupObjectForUI produces.
     */
    private static function normalizeGroup(array $group): array
    {
        $cards = [];
        foreach ($group['cards'] as $x => $column) {
            $cards[(int) $x] = $column;
        }
        $group['cards'] = $cards;
        return $group;
    }

    public function testGetConnectingNumbersFixtures(): void
    {
        foreach (self::loadFixtures('getConnectingNumbers.json') as $case) {
            if (isset($case['error'])) {
                try {
                    BoardLogic::getConnectingNumbers($case['num']);
                    $this->fail("Expected exception for case: {$case['name']}");
                } catch (\InvalidArgumentException $e) {
                    $this->assertSame($case['error'], $e->getMessage(), $case['name']);
                }
            } else {
                $this->assertSame($case['expected'], BoardLogic::getConnectingNumbers($case['num']), $case['name']);
            }
        }
    }

    public function testGetConnectionFixtures(): void
    {
        foreach (self::loadFixtures('getConnection.json') as $case) {
            $group = self::normalizeGroup($case['group']);
            if (isset($case['error'])) {
                try {
                    BoardLogic::getConnection($case['card'], $group, $case['orientation']);
                    $this->fail("Expected exception for case: {$case['name']}");
                } catch (\InvalidArgumentException $e) {
                    $this->assertSame($case['error'], $e->getMessage(), $case['name']);
                }
            } else {
                $this->assertEquals(
                    $case['expected'],
                    BoardLogic::getConnection($case['card'], $group, $case['orientation']),
                    $case['name']
                );
            }
        }
    }

    public function testConnectCardToGroupFixtures(): void
    {
        foreach (self::loadFixtures('connectCardToGroup.json') as $case) {
            $group = self::normalizeGroup($case['group']);
            $connection = [
                'card' => $case['connection']['card'],
                'x' => $case['connection']['x'],
                'y' => $case['connection']['y'],
            ];
            if (isset($case['error'])) {
                try {
                    BoardLogic::connectCardToGroup($group, $case['card'], $connection, $case['orientation']);
                    $this->fail("Expected exception for case: {$case['name']}");
                } catch (\InvalidArgumentException $e) {
                    $this->assertSame($case['error'], $e->getMessage(), $case['name']);
                }
            } else {
                BoardLogic::connectCardToGroup($group, $case['card'], $connection, $case['orientation']);
                $this->assertEquals(self::normalizeGroup($case['expected']), $group, $case['name']);
            }
        }
    }

    public function testConnectGroupsFixtures(): void
    {
        foreach (self::loadFixtures('connectGroups.json') as $case) {
            $group1 = [
                'group' => self::normalizeGroup($case['group1']['group']),
                'connection' => $case['group1']['connection'],
            ];
            $group2 = [
                'group' => self::normalizeGroup($case['group2']['group']),
                'connection' => $case['group2']['connection'],
            ];
            if (isset($case['error'])) {
                try {
                    BoardLogic::connectGroups($group1, $group2, $case['orientation']);
                    $this->fail("Expected exception for case: {$case['name']}");
                } catch (\InvalidArgumentException $e) {
                    $this->assertSame($case['error'], $e->getMessage(), $case['name']);
                }
            } else {
                $this->assertEquals(
                    self::normalizeGroup($case['expected']),
                    BoardLogic::connectGroups($group1, $group2, $case['orientation']),
                    $case['name']
                );
            }
        }
    }
}
