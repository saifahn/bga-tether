<?php
declare(strict_types=1);

namespace Bga\Games\TetherGame;

/**
 * Pure board-manipulation logic, ported from the client TypeScript
 * (getConnectingNumbers.ts, getConnection.ts, connectCardToGroup.ts,
 * connectGroups.ts) so the server can recompute board state itself.
 *
 * Data shapes match the client / GroupLogic::createGroupObjectForUI:
 *   Card:  ['id' => string, 'lowNum' => string, 'uprightFor' => 'vertical'|'horizontal']
 *   Group: ['id' => string, 'cards' => [x => [y => Card|null]]]
 *   Connection: ['card' => Card, 'x' => int, 'y' => int]
 *
 * The grid is always stored from the vertical player's perspective.
 *
 * All violations throw \InvalidArgumentException; the framework layer
 * (Game.php) converts them to user-visible errors.
 */
class BoardLogic
{
    /**
     * Returns the two numbers (as zero-padded 2-char strings) that connect
     * to the given shown number: exactly one lower and one higher.
     */
    public static function getConnectingNumbers(string $num): array
    {
        if (strlen($num) !== 2) {
            throw new \InvalidArgumentException('the number string should be exactly 2 characters long');
        }
        $parsedNum = (int) $num;
        if ($parsedNum < 1 || $parsedNum > 98) {
            throw new \InvalidArgumentException('the number must be between 01 and 98');
        }

        $decremented = str_pad((string) ($parsedNum - 1), 2, '0', STR_PAD_LEFT);
        $incremented = str_pad((string) ($parsedNum + 1), 2, '0', STR_PAD_LEFT);

        return [$decremented, $incremented];
    }

    /**
     * The number a card shows for the given orientation: its lowNum if the
     * card is upright for that orientation, otherwise the digits reversed.
     */
    public static function shownNum(array $card, string $orientation): string
    {
        return $card['uprightFor'] === $orientation
            ? $card['lowNum']
            : strrev($card['lowNum']);
    }

    /**
     * True when the two cards' shown numbers differ by exactly 1 for the
     * given orientation, i.e. they may legally connect.
     */
    public static function isValidConnection(array $card, array $connectionCard, string $orientation): bool
    {
        $possibleNumbers = self::getConnectingNumbers(self::shownNum($card, $orientation));
        return in_array(self::shownNum($connectionCard, $orientation), $possibleNumbers, true);
    }

    /**
     * Finds a connection in the group for the given card (first match, same
     * scan order as the client's getConnection). Throws if none exists.
     */
    public static function getConnection(array $card, array $group, string $orientation): array
    {
        $possibleNumbers = self::getConnectingNumbers(self::shownNum($card, $orientation));

        foreach ($group['cards'] as $x => $column) {
            foreach ($column as $y => $groupCard) {
                if ($groupCard === null) {
                    continue;
                }
                if (in_array(self::shownNum($groupCard, $orientation), $possibleNumbers, true)) {
                    return ['card' => $groupCard, 'x' => (int) $x, 'y' => $y];
                }
            }
        }
        throw new \InvalidArgumentException('the card is not a valid option to connect to the group');
    }

    /**
     * Places a card in the group adjacent to the connection point, mutating
     * the group grid. The higher shown number goes above (vertical) or to the
     * right (horizontal). Unlike the client, an occupied destination cell is
     * rejected rather than silently mishandled.
     */
    public static function connectCardToGroup(array &$group, array $card, array $connection, string $orientation): void
    {
        $cardNumShown = (int) self::shownNum($card, $orientation);
        $connectionCardNumShown = (int) self::shownNum($connection['card'], $orientation);

        $numCols = count($group['cards']);
        $x = $connection['x'];
        $y = $connection['y'];

        $connectionCell = $group['cards'][$x][$y] ?? null;
        if ($connectionCell === null || (string) $connectionCell['id'] !== (string) $connection['card']['id']) {
            throw new \InvalidArgumentException('The connecting card details are not correct');
        }

        // higher shown number goes after (above for vertical, right for horizontal)
        $connectAfter = $connectionCardNumShown > $cardNumShown;

        if ($orientation === 'vertical') {
            $targetY = $connectAfter ? $y + 1 : $y - 1;
            if (array_key_exists($targetY, $group['cards'][$x]) && $group['cards'][$x][$targetY] !== null) {
                throw new \InvalidArgumentException('The destination cell is already occupied');
            }
            for ($i = 0; $i < $numCols; $i++) {
                if (!isset($group['cards'][$i])) {
                    throw new \InvalidArgumentException("something has gone wrong - cards for the column don't exist for some reason");
                }
                $itemToAdd = $i === $x ? $card : null;
                if (array_key_exists($targetY, $group['cards'][$i])) {
                    // an existing empty space we can fill
                    if ($i === $x) {
                        $group['cards'][$i][$targetY] = $itemToAdd;
                    }
                } elseif ($connectAfter) {
                    $group['cards'][$i][] = $itemToAdd;
                } else {
                    array_unshift($group['cards'][$i], $itemToAdd);
                }
            }
            return;
        }

        // horizontal: the data represents the vertical player's view, so
        // left/right operate on the x (column) axis
        $numRows = count($group['cards'][0]);
        $targetX = $connectAfter ? $x + 1 : $x - 1;

        if (isset($group['cards'][$targetX]) && array_key_exists($y, $group['cards'][$targetX])) {
            if ($group['cards'][$targetX][$y] !== null) {
                throw new \InvalidArgumentException('The destination cell is already occupied');
            }
            $group['cards'][$targetX][$y] = $card;
            return;
        }

        $newColumn = [];
        for ($i = 0; $i < $numRows; $i++) {
            $newColumn[] = $i === $y ? $card : null;
        }

        if ($connectAfter) {
            if ($x !== $numCols - 1) {
                throw new \InvalidArgumentException('The destination cell is already occupied');
            }
            $group['cards'][$numCols] = $newColumn;
            return;
        }

        if ($x !== 0) {
            throw new \InvalidArgumentException('The destination cell is already occupied');
        }
        // adding at the start of the row: shift all columns to the right
        for ($i = $numCols; $i >= 1; $i--) {
            $group['cards'][$i] = $group['cards'][$i - 1];
        }
        $group['cards'][0] = $newColumn;
    }

    /**
     * Merges two groups at the given connection points and returns the new
     * group. The merged group takes the higher of the two group ids. Unlike
     * the client, overlapping cells cause a rejection.
     *
     * $group1 / $group2: ['group' => Group, 'connection' => Connection]
     */
    public static function connectGroups(array $group1, array $group2, string $orientation): array
    {
        foreach ([$group1, $group2] as $g) {
            $cell = $g['group']['cards'][$g['connection']['x']][$g['connection']['y']] ?? null;
            if ($cell === null || (string) $cell['id'] !== (string) $g['connection']['card']['id']) {
                throw new \InvalidArgumentException('The connecting card details are not correct');
            }
        }

        // The FROM group is the one whose connection card shows the lesser number
        $group1Num = (int) self::shownNum($group1['connection']['card'], $orientation);
        $group2Num = (int) self::shownNum($group2['connection']['card'], $orientation);
        $group1IsGreater = $group1Num > $group2Num;

        // higher connecting number = "to the right" for horizontal (left side in data),
        // higher connecting number = "above" for vertical
        if ($orientation === 'horizontal') {
            $groupFrom = $group1IsGreater ? $group2 : $group1;
            $groupTo = $group1IsGreater ? $group1 : $group2;
        } else {
            $groupFrom = $group1IsGreater ? $group1 : $group2;
            $groupTo = $group1IsGreater ? $group2 : $group1;
        }

        // Connect at relative positions 0,0 / 0,1 (vertical) or 0,0 / 1,0
        // (horizontal, flipped in data), then normalize back to origin.
        $relativeToY = $orientation === 'vertical' ? 1 : 0;
        $relativeFromX = $orientation === 'horizontal' ? 1 : 0;

        $temporaryCombined = [];
        $rows = [];

        $placements = [
            [$groupFrom, $relativeFromX - $groupFrom['connection']['x'], 0 - $groupFrom['connection']['y']],
            [$groupTo, 0 - $groupTo['connection']['x'], $relativeToY - $groupTo['connection']['y']],
        ];

        foreach ($placements as [$g, $xShift, $yShift]) {
            foreach ($g['group']['cards'] as $x => $column) {
                foreach ($column as $y => $card) {
                    if ($card === null) {
                        continue;
                    }
                    $offsetX = (int) $x + $xShift;
                    $offsetY = $y + $yShift;
                    if (isset($temporaryCombined[$offsetX][$offsetY])) {
                        throw new \InvalidArgumentException('The groups overlap and cannot be connected there');
                    }
                    $temporaryCombined[$offsetX][$offsetY] = $card;
                    $rows[$offsetY] = true;
                }
            }
        }

        $xOffset = min(0, ...array_map('intval', array_keys($temporaryCombined))) * -1;
        $yOffset = min(0, ...array_keys($rows)) * -1;
        $newGroupHeight = count($rows);

        $newGroupId = max((int) $group1['group']['id'], (int) $group2['group']['id']);
        $newGroup = ['id' => (string) $newGroupId, 'cards' => []];

        foreach (array_keys($temporaryCombined) as $oldX) {
            $newX = (int) $oldX + $xOffset;
            $newGroup['cards'][$newX] = [];
            for ($y = 0; $y < $newGroupHeight; $y++) {
                $oldY = $y - $yOffset;
                $newGroup['cards'][$newX][] = $temporaryCombined[$oldX][$oldY] ?? null;
            }
        }
        ksort($newGroup['cards']);

        return $newGroup;
    }
}
