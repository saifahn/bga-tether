<?php
declare(strict_types=1);

namespace Bga\Games\TetherGame\Tests\Unit;

use PHPUnit\Framework\TestCase;
use Bga\Games\TetherGame\GroupLogic;

class GroupLogicTest extends TestCase
{
    public function testCalculateGroupDimensions_WithSingleGroup_ReturnsCorrectDimensions(): void
    {
        $cards = [
            ['id' => 1, 'groupAndCoords' => '1_0_0', 'lastScored' => 0],
            ['id' => 2, 'groupAndCoords' => '1_1_0', 'lastScored' => 0],
            ['id' => 3, 'groupAndCoords' => '1_0_1', 'lastScored' => 0],
        ];

        $result = GroupLogic::calculateGroupDimensions($cards);

        $this->assertArrayHasKey('1', $result);
        $this->assertEquals(1, $result['1']['greatestX']);
        $this->assertEquals(1, $result['1']['greatestY']);
        $this->assertEquals(3, $result['1']['size']);
        $this->assertEquals(0, $result['1']['lastScoredAt']);
    }

    public function testCalculateGroupDimensions_WithMultipleGroups_SeparatesCorrectly(): void
    {
        $cards = [
            ['id' => 1, 'groupAndCoords' => '1_0_0', 'lastScored' => 0],
            ['id' => 2, 'groupAndCoords' => '1_1_0', 'lastScored' => 0],
            ['id' => 3, 'groupAndCoords' => '2_0_0', 'lastScored' => 6],
            ['id' => 4, 'groupAndCoords' => '2_0_1', 'lastScored' => 6],
        ];

        $result = GroupLogic::calculateGroupDimensions($cards);
        $group1 = $result['1'];
        $group2 = $result['2'];

        $this->assertCount(2, $result);
        $this->assertEquals(2, $group1['size']);
        $this->assertEquals(1, $group1['greatestX']);
        $this->assertEquals(0, $group1['greatestY']);
        $this->assertEquals(0, $group1['lastScoredAt']);
        $this->assertEquals(2, $group2['size']);
        $this->assertEquals(0, $group2['greatestX']);
        $this->assertEquals(1, $group2['greatestY']);
        $this->assertEquals(6, $group2['lastScoredAt']);
    }

    public function testCreateGroupObjectForUI_BuildsNestedArrayStructure(): void
    {
        $cards = [
            ['id' => 2, 'groupAndCoords' => '1_0_0', 'cardNum' => '02', 'uprightFor' => 'vertical'],
            ['id' => 1, 'groupAndCoords' => '1_1_0', 'cardNum' => '19', 'uprightFor' => 'horizontal'],
            ['id' => 4, 'groupAndCoords' => '2_0_0', 'cardNum' => '06', 'uprightFor' => 'horizontal'],
            ['id' => 3, 'groupAndCoords' => '2_0_1', 'cardNum' => '59', 'uprightFor' => 'vertical'],
        ];

        $result = GroupLogic::createGroupObjectForUI($cards);
        $group1 = $result['1'];
        $group2 = $result['2'];

        $this->assertEquals('1', $group1['number']); // group number
        $this->assertIsArray($group1['cards']);
        $this->assertEquals('2', $group1['cards'][0][0]['id']);
        $this->assertEquals('02', $group1['cards'][0][0]['lowNum']);
        $this->assertEquals('vertical', $group1['cards'][0][0]['uprightFor']);
        $this->assertEquals('1', $group1['cards'][1][0]['id']);
        $this->assertEquals('19', $group1['cards'][1][0]['lowNum']);
        $this->assertEquals('horizontal', $group1['cards'][1][0]['uprightFor']);

        $this->assertEquals('4', $group2['cards'][0][0]['id']);
        $this->assertEquals('06', $group2['cards'][0][0]['lowNum']);
        $this->assertEquals('horizontal', $group2['cards'][0][0]['uprightFor']);
        $this->assertEquals('3', $group2['cards'][0][1]['id']);
        $this->assertEquals('59', $group2['cards'][0][1]['lowNum']);
        $this->assertEquals('vertical', $group2['cards'][0][1]['uprightFor']);
    }
}
