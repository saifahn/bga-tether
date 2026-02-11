<?php
declare(strict_types=1);

namespace Bga\Games\TetherGame\Tests\Unit;

use PHPUnit\Framework\TestCase;
use Bga\Games\TetherGame\CardUpdateHelper;

class CardUpdateHelperTest extends TestCase
{
    public function testBuildCardUpdates_WithSimpleBoard_ReturnsUpdateList(): void
    {
        $boardState = [
            '1' => [
                'cards' => [
                    0 => [
                        ['id' => '1', 'uprightFor' => 'horizontal'],
                        ['id' => '2', 'uprightFor' => 'vertical'],
                    ]
                ]
            ]
        ];

        $updates = CardUpdateHelper::buildCardUpdates($boardState);
        $card1 = $updates[0];
        $card2 = $updates[1];

        $this->assertCount(2, $updates);
        $this->assertEquals('1', $card1['id']);
        $this->assertEquals('horizontal', $card1['type']);
        $this->assertEquals('1_0_0', $card1['location_arg']);
        $this->assertEquals('group', $card1['location']);
        $this->assertEquals('2', $card2['id']);
        $this->assertEquals('vertical', $card2['type']);
        $this->assertEquals('1_0_1', $card2['location_arg']);
        $this->assertEquals('group', $card2['location']);
    }

    public function testGenerateBulkUpdateSQL_WithMultipleCards_GeneratesCaseWhen(): void
    {
        $updates = [
            ['id' => 1, 'type' => 'horizontal', 'location' => 'group', 'location_arg' => '1_0_0'],
            ['id' => 2, 'type' => 'vertical', 'location' => 'group', 'location_arg' => '1_0_1'],
        ];

        $sql = CardUpdateHelper::generateBulkUpdateSQL($updates);

        $this->assertStringContainsString('UPDATE card SET', $sql);
        $this->assertStringContainsString('CASE card_id', $sql);
        $this->assertStringContainsString('WHEN 1 THEN \'horizontal\'', $sql);
        $this->assertStringContainsString('WHEN 1 THEN \'group\'', $sql);
        $this->assertStringContainsString('WHEN 1 THEN \'1_0_0\'', $sql);
        $this->assertStringContainsString('WHEN 2 THEN \'vertical\'', $sql);
        $this->assertStringContainsString('WHEN 2 THEN \'group\'', $sql);
        $this->assertStringContainsString('WHEN 2 THEN \'1_0_1\'', $sql);
        $this->assertStringContainsString('WHERE card_id IN (1,2)', $sql);
    }

    public function testGenerateBulkUpdateSQL_WithEmptyUpdates_ReturnsEmptyString(): void
    {
        $sql = CardUpdateHelper::generateBulkUpdateSQL([]);
        $this->assertEquals('', $sql);
    }
}
