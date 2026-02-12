<?php
declare(strict_types=1);

namespace Bga\Games\TetherGame;

class GroupLogic
{
    /**
     * Calculate dimensions and metadata for each group from card data.
     * Pure function - no framework dependencies.
     *
     * This function analyzes cards in groups to determine:
     * 1. Group dimensions (width and height)
     * 2. Number of cards in each group
     * 3. Last scoring threshold reached by each group
     *
     * Used by handleScoring() to determine if groups should trigger scoring
     * at thresholds of 6, 10, or 14 cards.
     *
     * INPUT: Array of cards from database with "groupAndCoords" (format: "groupNum_x_y")
     *        and "lastScored" (0, 6, 10, or 14) fields
     *
     * OUTPUT: Array keyed by group number:
     *   [
     *     "1" => [
     *       "greatestX" => 2,        // Maximum X coordinate (0-indexed)
     *       "greatestY" => 5,        // Maximum Y coordinate (0-indexed)
     *       "size" => 6,             // Total number of cards in group
     *       "lastScoredAt" => 0      // Last threshold: 0, 6, 10, or 14
     *     ]
     *   ]
     *
     * @param array $cards Card data from database with groupAndCoords and lastScored fields
     * @return array Associative array keyed by groupNum with dimension metadata
     */
    public static function calculateGroupDimensions(array $cards): array
    {
        // Initialize result array to store metadata for each group
        $groupsBySizeAndLastScored = array();

        // Process each card to build up group statistics
        foreach ($cards as $card) {
            // Parse the location string "groupNum_x_y" into components
            // Example: "1_2_3" means group 1, position (2, 3)
            $groupAndCoords = explode("_", $card["groupAndCoords"]);
            $groupNum = $groupAndCoords[0];  // e.g., "1"
            $x = (int) $groupAndCoords[1];    // e.g., 2 (width coordinate)
            $y = (int) $groupAndCoords[2];    // e.g., 3 (height coordinate)

            // === Track Maximum X Coordinate (Width) ===
            // Initialize greatestX to 0 if this is the first card we've seen in this group
            if (!isset($groupsBySizeAndLastScored[$groupNum]["greatestX"])) {
                $groupsBySizeAndLastScored[$groupNum]["greatestX"] = 0;
            }
            // Initialize greatestY to 0 if this is the first card in this group
            if (!isset($groupsBySizeAndLastScored[$groupNum]["greatestY"])) {
                $groupsBySizeAndLastScored[$groupNum]["greatestY"] = 0;
            }
            // Update greatestX if current card's X coordinate is larger
            // This tells us how wide the group is (horizontal player's score = greatestX + 1)
            if ($x > $groupsBySizeAndLastScored[$groupNum]["greatestX"]) {
                $groupsBySizeAndLastScored[$groupNum]["greatestX"] = $x;
            }
            // Update greatestY if current card's Y coordinate is larger
            // This tells us how tall the group is (vertical player's score = greatestY + 1)
            if ($y > $groupsBySizeAndLastScored[$groupNum]["greatestY"]) {
                $groupsBySizeAndLastScored[$groupNum]["greatestY"] = $y;
            }

            // === Count Total Cards in Group ===
            // Initialize card count to 0 if this is the first card in this group
            if (!isset($groupsBySizeAndLastScored[$groupNum]["size"])) {
                $groupsBySizeAndLastScored[$groupNum]["size"] = 0;
            }
            // Increment the count - each card adds 1 to the group size
            // Used to check if group has reached scoring thresholds (6, 10, or 14)
            $groupsBySizeAndLastScored[$groupNum]["size"]++;

            // === Track Last Scoring Threshold ===
            // Initialize lastScoredAt to 0 (not scored yet) if first card in group
            if (!isset($groupsBySizeAndLastScored[$groupNum]["lastScoredAt"])) {
                $groupsBySizeAndLastScored[$groupNum]["lastScoredAt"] = 0;
            }
            // Find the highest "scored_at" value among all cards in the group
            // All cards in a group get the same scored_at value when scoring triggers
            // Possible values: 0 (not scored), 6 (scored at 6 cards), 10 (scored at 10), 14 (scored at 14)
            // We need the maximum to know the last threshold this group reached
            if ((int) $card["lastScored"] > $groupsBySizeAndLastScored[$groupNum]["lastScoredAt"]) {
                $groupsBySizeAndLastScored[$groupNum]["lastScoredAt"] = (int) $card["lastScored"];
            }
        }

        return $groupsBySizeAndLastScored;
    }

    /**
     * Create UI-ready group object from card data.
     * Pure function - extracted from Game::createGroupObjectForUI().
     *
     * This function transforms flat card data from the database into a nested 2D array structure
     * that the client UI can easily render. Each group becomes a 2D grid of cards.
     *
     * INPUT: Flat array of cards from database, each with "groupAndCoords" like "1_2_3"
     *        (groupNum_xCoord_yCoord, where coords are 0-indexed)
     *
     * OUTPUT: Nested structure:
     *   [
     *     "1" => [
     *       "number" => "1",
     *       "cards" => [
     *         0 => [card, card, null],  // X=0, Y=0..2
     *         1 => [card, null, card],  // X=1, Y=0..2
     *       ]
     *     ]
     *   ]
     *
     * @param array $cards Card data with groupAndCoords field (format: "groupNum_x_y")
     * @return array Nested array structure ready for client UI rendering
     */
    public static function createGroupObjectForUI(array $cards): array
    {
        // PHASE 1: Parse cards into sparse 3D array and track group dimensions
        // Structure: $cardsByGroupAndCoords[groupNum][x][y] = cardData
        $cardsByGroupAndCoords = array();

        foreach ($cards as $card) {
            // Parse the location string "groupNum_x_y" into components
            // Example: "1_2_3" means group 1, position (2, 3)
            $groupAndCoords = explode("_", $card["groupAndCoords"]);
            $groupNum = $groupAndCoords[0];  // e.g., "1"
            $x = (int) $groupAndCoords[1];     // e.g., 2
            $y = (int) $groupAndCoords[2];     // e.g., 3

            // Store card data at its 3D coordinate position
            // Extract only the data needed by the UI
            $cardsByGroupAndCoords[$groupNum][$x][$y] = array(
                "id" => $card['id'],              // Unique card ID
                "lowNum" => $card['cardNum'],     // Lower number on card (e.g., "01" for "01/10")
                "uprightFor" => $card['uprightFor'], // "horizontal" or "vertical" - who sees it upright
            );

            // Track the maximum X coordinate seen in this group
            // Initialize to 0 if not yet set
            if (!isset($cardsByGroupAndCoords[$groupNum]["greatestX"])) {
                $cardsByGroupAndCoords[$groupNum]["greatestX"] = 0;
            }
            // Track the maximum Y coordinate seen in this group
            if (!isset($cardsByGroupAndCoords[$groupNum]["greatestY"])) {
                $cardsByGroupAndCoords[$groupNum]["greatestY"] = 0;
            }

            // Update maximum coordinates if current card exceeds previous max
            if ($x > $cardsByGroupAndCoords[$groupNum]["greatestX"]) {
                $cardsByGroupAndCoords[$groupNum]["greatestX"] = $x;
            }
            if ($y > $cardsByGroupAndCoords[$groupNum]["greatestY"]) {
                $cardsByGroupAndCoords[$groupNum]["greatestY"] = $y;
            }
        }

        // PHASE 2: Convert sparse array to dense 2D grid with nulls for empty positions
        // The client UI expects a complete rectangular grid, with null for empty spaces
        $groups = array();
        foreach ($cardsByGroupAndCoords as $groupNum => $group) {
            // Initialize group structure
            $groups[$groupNum] = array(
                "id" => $groupNum,  // Group identifier (e.g., "1")
                "cards" => array(),     // Will contain 2D array of cards
            );

            // Build a complete rectangular grid from (0,0) to (greatestX, greatestY)
            // Outer loop: X coordinates (columns)
            for ($x = 0; $x <= $group["greatestX"]; $x++) {
                // Create a new column (array of Y values)
                array_push($groups[$groupNum]["cards"], array());

                // Inner loop: Y coordinates (rows within this column)
                for ($y = 0; $y <= $group["greatestY"]; $y++) {
                    // Get the card at this position, or NULL if no card exists there
                    // Using null coalescing operator (??) to provide NULL as default
                    $itemToSet = $cardsByGroupAndCoords[$groupNum][$x][$y] ?? NULL;

                    // Add this card (or null) to the current column at row Y
                    array_push($groups[$groupNum]["cards"][$x], $itemToSet);
                }
            }
        }

        return $groups;
    }
}
