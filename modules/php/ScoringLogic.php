<?php
declare(strict_types=1);

namespace Bga\Games\TetherGame;

class ScoringLogic {
    /**
     * Determine if a group should trigger scoring based on size and threshold.
     *
     * @param int $groupSize Number of cards in group
     * @param int $lastScoredAt Last threshold at which group was scored
     * @return int|null Threshold value (6, 10, or 14) or null if no scoring
     */
    public static function calculateScoringThreshold(int $groupSize, int $lastScoredAt): ?int {
        foreach ([14, 10, 6] as $threshold) {
            if ($groupSize >= $threshold && $lastScoredAt < $threshold) {
                return $threshold;
            }
        }
        return null;
    }

    /**
     * Calculate scores for both players from group dimensions.
     *
     * @param int $greatestX Maximum X coordinate (width - 1)
     * @param int $greatestY Maximum Y coordinate (height - 1)
     * @return array ['horizontal' => int, 'vertical' => int]
     */
    public static function calculateScores(int $greatestX, int $greatestY): array {
        return [
            'horizontal' => $greatestX + 1,  // +1 because coordinates start at 0
            'vertical' => $greatestY + 1,
        ];
    }

    /**
     * Check if game should end based on score or threshold.
     *
     * @param int $vScore Vertical player's score
     * @param int $hScore Horizontal player's score
     * @param int $threshold Threshold that was just crossed
     * @return string|null 'GROUP_SIZE_14', 'SCORE_DIFFERENCE_6', or null
     */
    public static function checkEndGameCondition(int $vScore, int $hScore, int $threshold): ?string {
        if ($threshold === 14) {
            return 'GROUP_SIZE_14';
        }

        if (abs($vScore - $hScore) >= 6) {
            return 'SCORE_DIFFERENCE_6';
        }

        return null;
    }

    /**
     * Convert a player's hand count into the tiebreaker aux score.
     *
     * BGA compares player_aux_score descending (higher wins), so the player
     * with the fewest cards in hand must get the highest aux score.
     *
     * @param int $handCount Number of cards in the player's hand
     * @return int Aux score to store in the player table
     */
    public static function calculateTiebreakerAuxScore(int $handCount): int {
        return -$handCount;
    }

    /**
     * Determine if drawing the last card from the deck should trigger the
     * final round (each player gets exactly one more turn, then game end).
     *
     * @param int $deckCount Number of cards remaining in the deck
     * @param int $finalTurnsRemaining Current value of the final_turns_remaining global (-1 = not triggered)
     * @return bool True if the final round should now be triggered
     */
    public static function shouldTriggerFinalRound(int $deckCount, int $finalTurnsRemaining): bool {
        return $finalTurnsRemaining === -1 && $deckCount === 0;
    }

    /**
     * Advance the final-round countdown by one player turn.
     *
     * @param int $finalTurnsRemaining Current value of the final_turns_remaining global
     * @return array{endGame: bool, value: int} Whether the game should now end, and the new value to store
     */
    public static function advanceFinalTurns(int $finalTurnsRemaining): array {
        if ($finalTurnsRemaining === 0) {
            return ['endGame' => true, 'value' => 0];
        }

        if ($finalTurnsRemaining > 0) {
            return ['endGame' => false, 'value' => $finalTurnsRemaining - 1];
        }

        return ['endGame' => false, 'value' => $finalTurnsRemaining];
    }
}
