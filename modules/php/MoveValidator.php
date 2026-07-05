<?php
declare(strict_types=1);

namespace Bga\Games\TetherGame;

/**
 * Validates and replays a player's turn server-side, so that the server —
 * not the client — is the authority on move legality and resulting state
 * (see docs/adr/0001-server-authoritative-move-replay.md).
 *
 * A "connect astronauts" turn is an ordered list of moves:
 *   ['action' => 'startGroup',  'cardId' => string, 'from' => 'hand'|'adrift', 'flipped' => bool]
 *   ['action' => 'placeCard',   'cardId' => string, 'from' => 'hand'|'adrift', 'flipped' => bool,
 *    'connection' => ['cardId' => string, 'x' => int, 'y' => int]]
 *   ['action' => 'mergeGroups', 'otherGroupId' => string,
 *    'currentConnection' => ['cardId' => string, 'x' => int, 'y' => int],   // cell in current group
 *    'otherConnection'   => ['cardId' => string, 'x' => int, 'y' => int]]  // cell in other group
 *
 * Enforced turn rules:
 *   1. The first move always starts a NEW group; existing groups are only
 *      extended via merges.
 *   2. Later cards attach only to the current turn's group.
 *   3. At least one card must be played; any mix of hand/adrift, no limit.
 *   4. Any number of merges, each requiring a valid +-1 connection.
 *
 * A claimed connection is accepted if it is ANY rules-valid connection, not
 * necessarily the one the current client UI would auto-pick.
 *
 * Pure static class - throws \InvalidArgumentException on any violation.
 */
class MoveValidator
{
    /**
     * Replays the moves against the current server-side state and returns
     * the resulting board plus what was consumed, or throws.
     *
     * @param array $moves ordered move list (see class doc)
     * @param array $hand card id => ['id','lowNum'] cards in the player's hand
     * @param array $adrift card id => ['id','lowNum'] cards in the adrift zone
     * @param array $board group id => Group (GroupLogic::createGroupObjectForUI shape)
     * @param string $playerOrientation 'vertical'|'horizontal'
     * @param int $latestGroup highest group id currently on the board
     * @return array ['board' => groups, 'playedFromHand' => Card[], 'playedFromAdrift' => Card[]]
     */
    public static function replayConnectMoves(
        array $moves,
        array $hand,
        array $adrift,
        array $board,
        string $playerOrientation,
        int $latestGroup
    ): array {
        if (count($moves) === 0) {
            throw new \InvalidArgumentException('At least one card must be played');
        }

        $sources = ['hand' => $hand, 'adrift' => $adrift];
        $played = ['hand' => [], 'adrift' => []];
        $currentGroupId = null;

        foreach ($moves as $i => $move) {
            $action = $move['action'] ?? null;

            if ($i === 0 && $action !== 'startGroup') {
                throw new \InvalidArgumentException('The first card played must start a new group');
            }
            if ($i !== 0 && $action === 'startGroup') {
                throw new \InvalidArgumentException('Only the first card played may start a new group');
            }

            switch ($action) {
                case 'startGroup':
                    $card = self::takeCard($move, $sources, $played, $playerOrientation);
                    $currentGroupId = (string) ($latestGroup + 1);
                    $board[$currentGroupId] = [
                        'id' => $currentGroupId,
                        'cards' => [0 => [0 => $card]],
                    ];
                    break;

                case 'placeCard':
                    $card = self::takeCard($move, $sources, $played, $playerOrientation);
                    $group = &$board[$currentGroupId];
                    $connection = self::resolveConnection($move['connection'] ?? null, $group);
                    if (!BoardLogic::isValidConnection($card, $connection['card'], $playerOrientation)) {
                        throw new \InvalidArgumentException('The card does not connect to the chosen card');
                    }
                    BoardLogic::connectCardToGroup($group, $card, $connection, $playerOrientation);
                    unset($group);
                    break;

                case 'mergeGroups':
                    $otherGroupId = (string) ($move['otherGroupId'] ?? '');
                    if (!isset($board[$otherGroupId])) {
                        throw new \InvalidArgumentException('The group to connect to does not exist');
                    }
                    if ($otherGroupId === $currentGroupId) {
                        throw new \InvalidArgumentException('A group cannot be connected to itself');
                    }
                    $currentConnection = self::resolveConnection($move['currentConnection'] ?? null, $board[$currentGroupId]);
                    $otherConnection = self::resolveConnection($move['otherConnection'] ?? null, $board[$otherGroupId]);
                    if (!BoardLogic::isValidConnection($currentConnection['card'], $otherConnection['card'], $playerOrientation)) {
                        throw new \InvalidArgumentException('The two groups do not connect at the chosen cards');
                    }
                    $merged = BoardLogic::connectGroups(
                        ['group' => $board[$currentGroupId], 'connection' => $currentConnection],
                        ['group' => $board[$otherGroupId], 'connection' => $otherConnection],
                        $playerOrientation
                    );
                    unset($board[$currentGroupId], $board[$otherGroupId]);
                    $currentGroupId = $merged['id'];
                    $board[$currentGroupId] = $merged;
                    break;

                default:
                    throw new \InvalidArgumentException('Unknown move action');
            }
        }

        return [
            'board' => $board,
            'playedFromHand' => $played['hand'],
            'playedFromAdrift' => $played['adrift'],
        ];
    }

    /**
     * Validates an actSetAdrift request against the state BEFORE the action:
     * the discarded card must be in the player's hand, and the drawn card
     * must be the deck or a card already in the adrift zone (you cannot take
     * back the card you just set adrift).
     */
    public static function validateSetAdrift(
        string $cardSetAdriftId,
        string $cardDrawnId,
        array $hand,
        array $adrift
    ): void {
        if (!isset($hand[$cardSetAdriftId])) {
            throw new \InvalidArgumentException('The card to set adrift is not in your hand');
        }
        if ($cardDrawnId === 'deck') {
            return;
        }
        if ($cardDrawnId === $cardSetAdriftId) {
            throw new \InvalidArgumentException('You cannot take back the card you just set adrift');
        }
        if (!isset($adrift[$cardDrawnId])) {
            throw new \InvalidArgumentException('The card to draw is not in the adrift zone');
        }
    }

    /**
     * Consumes the played card from its claimed source zone and returns it
     * as a board Card with its orientation derived from the flipped flag.
     */
    private static function takeCard(array $move, array &$sources, array &$played, string $playerOrientation): array
    {
        $from = $move['from'] ?? null;
        if ($from !== 'hand' && $from !== 'adrift') {
            throw new \InvalidArgumentException('Cards can only be played from your hand or the adrift zone');
        }
        $cardId = (string) ($move['cardId'] ?? '');
        if (!isset($sources[$from][$cardId])) {
            throw new \InvalidArgumentException("The card is not available to play from the $from");
        }
        $sourceCard = $sources[$from][$cardId];
        unset($sources[$from][$cardId]);

        $otherOrientation = $playerOrientation === 'vertical' ? 'horizontal' : 'vertical';
        $card = [
            'id' => $cardId,
            'lowNum' => $sourceCard['lowNum'],
            'uprightFor' => !empty($move['flipped']) ? $otherOrientation : $playerOrientation,
        ];
        $played[$from][] = $card;

        return $card;
    }

    /**
     * Checks the claimed connection cell exists in the group and holds the
     * claimed card, returning a full Connection.
     */
    private static function resolveConnection(?array $claimed, array $group): array
    {
        $x = isset($claimed['x']) ? (int) $claimed['x'] : -1;
        $y = isset($claimed['y']) ? (int) $claimed['y'] : -1;
        $cell = $group['cards'][$x][$y] ?? null;
        if ($cell === null || !isset($claimed['cardId']) || (string) $cell['id'] !== (string) $claimed['cardId']) {
            throw new \InvalidArgumentException('The connecting card details are not correct');
        }
        return ['card' => $cell, 'x' => $x, 'y' => $y];
    }
}
