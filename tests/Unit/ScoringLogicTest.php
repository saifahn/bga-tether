<?php
declare(strict_types=1);

namespace Bga\Games\TetherGame\Tests\Unit;

use PHPUnit\Framework\TestCase;
use Bga\Games\TetherGame\ScoringLogic;

class ScoringLogicTest extends TestCase
{
    public function testCalculateScoringThreshold_WithSize6AndNotScored_Returns6(): void
    {
        $threshold = ScoringLogic::calculateScoringThreshold(6, 0);
        $this->assertEquals(6, $threshold);
    }

    public function testCalculateScoringThreshold_WithSize6AndAlreadyScored_ReturnsNull(): void
    {
        $threshold = ScoringLogic::calculateScoringThreshold(6, 6);
        $this->assertNull($threshold);
    }

    public function testCalculateScoringThreshold_WithSize10AndScoredAt6_Returns10(): void
    {
        $threshold = ScoringLogic::calculateScoringThreshold(10, 6);
        $this->assertEquals(10, $threshold);
    }

    public function testCalculateScoringThreshold_WithSize14_Returns14First(): void
    {
        $threshold = ScoringLogic::calculateScoringThreshold(14, 0);
        $this->assertEquals(14, $threshold);
    }

    public function testCalculateScores_ReturnsWidthAndHeight(): void
    {
        $scores = ScoringLogic::calculateScores(2, 1);
        $this->assertEquals(3, $scores['horizontal']);
        $this->assertEquals(2, $scores['vertical']);
    }

    public function testCheckEndGameCondition_WithThreshold14_ReturnsGroupSize14(): void
    {
        $result = ScoringLogic::checkEndGameCondition(5, 3, 14);
        $this->assertEquals('GROUP_SIZE_14', $result);
    }

    public function testCheckEndGameCondition_WithScoreDifference6_ReturnsScoreDifference(): void
    {
        $result = ScoringLogic::checkEndGameCondition(10, 4, 10);
        $this->assertEquals('SCORE_DIFFERENCE_6', $result);
    }

    public function testCheckEndGameCondition_WithNormalState_ReturnsNull(): void
    {
        $result = ScoringLogic::checkEndGameCondition(5, 3, 6);
        $this->assertNull($result);
    }

    public function testShouldTriggerFinalRound_WithEmptyDeckAndNotTriggered_ReturnsTrue(): void
    {
        $this->assertTrue(ScoringLogic::shouldTriggerFinalRound(0, -1));
    }

    public function testShouldTriggerFinalRound_WithNonEmptyDeck_ReturnsFalse(): void
    {
        $this->assertFalse(ScoringLogic::shouldTriggerFinalRound(5, -1));
    }

    public function testShouldTriggerFinalRound_WithAlreadyTriggered_ReturnsFalse(): void
    {
        $this->assertFalse(ScoringLogic::shouldTriggerFinalRound(0, 2));
    }

    public function testAdvanceFinalTurns_WithNotTriggered_PassesThroughUnchanged(): void
    {
        $result = ScoringLogic::advanceFinalTurns(-1);
        $this->assertFalse($result['endGame']);
        $this->assertEquals(-1, $result['value']);
    }

    public function testAdvanceFinalTurns_WithTwoRemaining_DecrementsToOne(): void
    {
        $result = ScoringLogic::advanceFinalTurns(2);
        $this->assertFalse($result['endGame']);
        $this->assertEquals(1, $result['value']);
    }

    public function testAdvanceFinalTurns_WithOneRemaining_DecrementsToZero(): void
    {
        $result = ScoringLogic::advanceFinalTurns(1);
        $this->assertFalse($result['endGame']);
        $this->assertEquals(0, $result['value']);
    }

    public function testAdvanceFinalTurns_WithZeroRemaining_EndsGame(): void
    {
        $result = ScoringLogic::advanceFinalTurns(0);
        $this->assertTrue($result['endGame']);
        $this->assertEquals(0, $result['value']);
    }
}
