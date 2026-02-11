<?php
declare(strict_types=1);

namespace Bga\Games\TetherGame;

class CardUpdateHelper
{
    /**
     * Build list of card updates from board state JSON sent by client.
     * Pure function - no side effects.
     *
     * This function traverses the 2D grid structure from the client and builds a flat list
     * of database updates. Each update contains the card ID and its new position/orientation.
     *
     * PROBLEM SOLVED: This is part of fixing the N+1 query problem. Previously, the code
     * would execute one UPDATE query per card inside nested loops. This function extracts
     * the update data so we can execute a SINGLE bulk update.
     *
     * INPUT: Board state from client (nested structure):
     *   [
     *     "1" => [                              // Group 1
     *       "cards" => [
     *         0 => [card1, card2, null],        // X=0, Y positions 0,1,2
     *         1 => [card3, null, card4]         // X=1, Y positions 0,1,2
     *       ]
     *     ]
     *   ]
     *
     * OUTPUT: Flat list of updates:
     *   [
     *     ['id' => 123, 'type' => 'horizontal', 'location' => 'group', 'location_arg' => '1_0_0'],
     *     ['id' => 124, 'type' => 'vertical', 'location' => 'group', 'location_arg' => '1_0_1'],
     *     ['id' => 125, 'type' => 'horizontal', 'location' => 'group', 'location_arg' => '1_1_0'],
     *     ...
     *   ]
     *
     * @param array $boardState Board state from client (2D nested array structure)
     * @return array List of card updates ready for bulk SQL generation
     */
    public static function buildCardUpdates(array $boardState): array
    {
        // Initialize array to collect all card updates
        $updates = [];

        // Traverse the nested board structure
        // Outer loop: Each group on the board
        foreach ($boardState as $groupNum => $group) {
            // Middle loop: Each X coordinate (column) in the group
            foreach ($group["cards"] as $xCoord => $cards) {
                // Y coordinate starts at 0 for each column
                $yCoord = 0;

                // Inner loop: Each Y position (row) in this column
                foreach ($cards as $card) {
                    // Only process if there's actually a card at this position
                    // (could be null for empty grid spaces)
                    if ($card) {
                        // Build update record with all the info needed for database UPDATE
                        $updates[] = [
                            'id' => $card['id'],                           // Card's unique database ID
                            'type' => $card['uprightFor'],                 // Orientation: "horizontal" or "vertical"
                            'location' => 'group',                         // Always 'group' (vs 'hand', 'deck', 'adrift')
                            'location_arg' => "{$groupNum}_{$xCoord}_{$yCoord}"  // Position: "1_2_3" = group 1, x=2, y=3
                        ];
                    }
                    // Increment Y for next position in this column
                    // We increment even for null positions to maintain correct coordinates
                    $yCoord++;
                }
            }
        }

        return $updates;
    }

    /**
     * Generate bulk UPDATE SQL query using CASE-WHEN for multiple cards.
     * This is the KEY to solving the N+1 query problem.
     *
     * BEFORE (N+1 problem):
     *   UPDATE card SET card_type='horizontal', card_location='group', card_location_arg='1_0_0' WHERE card_id=123;
     *   UPDATE card SET card_type='vertical', card_location='group', card_location_arg='1_0_1' WHERE card_id=124;
     *   UPDATE card SET card_type='horizontal', card_location='group', card_location_arg='1_1_0' WHERE card_id=125;
     *   ... (N separate queries, one per card)
     *
     * AFTER (single bulk query):
     *   UPDATE card SET
     *     card_type = CASE card_id WHEN 123 THEN 'horizontal' WHEN 124 THEN 'vertical' WHEN 125 THEN 'horizontal' END,
     *     card_location = CASE card_id WHEN 123 THEN 'group' WHEN 124 THEN 'group' WHEN 125 THEN 'group' END,
     *     card_location_arg = CASE card_id WHEN 123 THEN '1_0_0' WHEN 124 THEN '1_0_1' WHEN 125 THEN '1_1_0' END
     *   WHERE card_id IN (123,124,125);
     *
     * PERFORMANCE: Reduces ~20-50 queries down to 1 query when connecting astronauts.
     *
     * HOW IT WORKS:
     * - CASE-WHEN allows conditional updates: "if card_id = 123 then set to 'horizontal'"
     * - We build parallel CASE statements for each column (type, location, location_arg)
     * - WHERE card_id IN (...) limits the update to only the cards we're changing
     *
     * @param array $updates List of card updates from buildCardUpdates()
     * @return string Complete SQL UPDATE query, or empty string if no updates
     */
    public static function generateBulkUpdateSQL(array $updates): string
    {
        // Early return if nothing to update
        if (empty($updates)) {
            return '';
        }

        // Arrays to build the CASE-WHEN clauses for each column
        $casesType = [];        // For card_type column
        $casesLocation = [];    // For card_location column
        $casesLocationArg = []; // For card_location_arg column
        $ids = [];              // List of all card IDs being updated

        // Build CASE-WHEN clauses from the update list
        foreach ($updates as $update) {
            // Extract and sanitize values
            $id = (int) $update['id'];  // Cast to int for safety
            $type = self::escapeSQL($update['type']);              // Escape special chars
            $location = self::escapeSQL($update['location']);      // Escape special chars
            $locationArg = self::escapeSQL($update['location_arg']); // Escape special chars

            // Collect the card ID for the WHERE IN clause
            $ids[] = $id;

            // Build CASE-WHEN clause for each column
            // Format: "WHEN {id} THEN '{value}'"
            // Example: "WHEN 123 THEN 'horizontal'"
            $casesType[] = "WHEN {$id} THEN '{$type}'";
            $casesLocation[] = "WHEN {$id} THEN '{$location}'";
            $casesLocationArg[] = "WHEN {$id} THEN '{$locationArg}'";
        }

        // Build comma-separated list of IDs for WHERE IN clause
        // Example: "123,124,125"
        $idList = implode(',', $ids);

        // Construct the final bulk UPDATE query
        // Each column gets its own CASE statement with all the WHEN clauses
        return "UPDATE card SET
            card_type = CASE card_id " . implode(' ', $casesType) . " END,
            card_location = CASE card_id " . implode(' ', $casesLocation) . " END,
            card_location_arg = CASE card_id " . implode(' ', $casesLocationArg) . " END
            WHERE card_id IN ({$idList})";
    }

    /**
     * Escape SQL string values to prevent SQL injection.
     * Uses addslashes() to escape quotes and backslashes.
     *
     * NOTE: This is a basic safety measure. In production code, you'd typically
     * use prepared statements with parameter binding for better security.
     *
     * @param string $value String value to escape
     * @return string Escaped string safe for SQL query
     */
    private static function escapeSQL(string $value): string
    {
        return addslashes($value);
    }
}
