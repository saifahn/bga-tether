<?php
declare(strict_types=1);

namespace Bga\Games\TetherGame\Tests\Unit;

use PHPUnit\Framework\TestCase;
use Bga\Games\TetherGame\MoveValidator;

class MoveValidatorTest extends TestCase
{
    private const HAND = [
        '11' => ['id' => '11', 'lowNum' => '05'],
        '12' => ['id' => '12', 'lowNum' => '06'],
    ];
    private const ADRIFT = [
        '21' => ['id' => '21', 'lowNum' => '07'],
    ];
    private const BOARD = [
        '1' => [
            'id' => '1',
            'cards' => [
                0 => [
                    0 => ['id' => '31', 'lowNum' => '04', 'uprightFor' => 'vertical'],
                    1 => ['id' => '32', 'lowNum' => '03', 'uprightFor' => 'vertical'],
                ],
            ],
        ],
    ];

    public function testHappyPathStartGroupThenPlaceCardsFromHandAndAdrift(): void
    {
        $result = MoveValidator::replayConnectMoves(
            [
                ['action' => 'startGroup', 'cardId' => '11', 'from' => 'hand', 'flipped' => false],
                [
                    'action' => 'placeCard',
                    'cardId' => '12',
                    'from' => 'hand',
                    'flipped' => false,
                    'connection' => ['cardId' => '11', 'x' => 0, 'y' => 0],
                ],
                [
                    'action' => 'placeCard',
                    'cardId' => '21',
                    'from' => 'adrift',
                    'flipped' => false,
                    'connection' => ['cardId' => '12', 'x' => 0, 'y' => 0],
                ],
            ],
            self::HAND,
            self::ADRIFT,
            self::BOARD,
            'vertical',
            1
        );

        $this->assertCount(2, $result['playedFromHand']);
        $this->assertCount(1, $result['playedFromAdrift']);
        // new group 2 built as a single column, highest number on top
        $this->assertEquals(
            [
                0 => [
                    0 => ['id' => '21', 'lowNum' => '07', 'uprightFor' => 'vertical'],
                    1 => ['id' => '12', 'lowNum' => '06', 'uprightFor' => 'vertical'],
                    2 => ['id' => '11', 'lowNum' => '05', 'uprightFor' => 'vertical'],
                ],
            ],
            $result['board']['2']['cards']
        );
        // pre-existing group untouched
        $this->assertArrayHasKey('1', $result['board']);
    }

    public function testMergeGroupsCombinesCurrentGroupWithExistingGroup(): void
    {
        $result = MoveValidator::replayConnectMoves(
            [
                ['action' => 'startGroup', 'cardId' => '11', 'from' => 'hand', 'flipped' => false],
                [
                    'action' => 'mergeGroups',
                    'otherGroupId' => '1',
                    'currentConnection' => ['cardId' => '11', 'x' => 0, 'y' => 0],
                    'otherConnection' => ['cardId' => '31', 'x' => 0, 'y' => 0],
                ],
            ],
            self::HAND,
            self::ADRIFT,
            self::BOARD,
            'vertical',
            1
        );

        // groups 1 and 2 merged into group 2 (max id), column 05-04-03
        $this->assertArrayNotHasKey('1', $result['board']);
        $this->assertEquals(
            [
                0 => [
                    0 => ['id' => '11', 'lowNum' => '05', 'uprightFor' => 'vertical'],
                    1 => ['id' => '31', 'lowNum' => '04', 'uprightFor' => 'vertical'],
                    2 => ['id' => '32', 'lowNum' => '03', 'uprightFor' => 'vertical'],
                ],
            ],
            $result['board']['2']['cards']
        );
    }

    public function testFlippedCardUsesOppositeOrientation(): void
    {
        $result = MoveValidator::replayConnectMoves(
            [['action' => 'startGroup', 'cardId' => '11', 'from' => 'hand', 'flipped' => true]],
            self::HAND,
            self::ADRIFT,
            [],
            'vertical',
            0
        );

        $this->assertSame('horizontal', $result['board']['1']['cards'][0][0]['uprightFor']);
    }

    public function testRejectsEmptyMoveList(): void
    {
        $this->expectExceptionMessage('At least one card must be played');
        MoveValidator::replayConnectMoves([], self::HAND, self::ADRIFT, self::BOARD, 'vertical', 1);
    }

    public function testRejectsFirstMoveThatIsNotStartGroup(): void
    {
        $this->expectExceptionMessage('The first card played must start a new group');
        MoveValidator::replayConnectMoves(
            [[
                'action' => 'placeCard',
                'cardId' => '11',
                'from' => 'hand',
                'flipped' => false,
                'connection' => ['cardId' => '31', 'x' => 0, 'y' => 0],
            ]],
            self::HAND,
            self::ADRIFT,
            self::BOARD,
            'vertical',
            1
        );
    }

    public function testRejectsSecondStartGroup(): void
    {
        $this->expectExceptionMessage('Only the first card played may start a new group');
        MoveValidator::replayConnectMoves(
            [
                ['action' => 'startGroup', 'cardId' => '11', 'from' => 'hand', 'flipped' => false],
                ['action' => 'startGroup', 'cardId' => '12', 'from' => 'hand', 'flipped' => false],
            ],
            self::HAND,
            self::ADRIFT,
            self::BOARD,
            'vertical',
            1
        );
    }

    public function testRejectsCardNotInHand(): void
    {
        $this->expectExceptionMessage('The card is not available to play from the hand');
        MoveValidator::replayConnectMoves(
            [['action' => 'startGroup', 'cardId' => '99', 'from' => 'hand', 'flipped' => false]],
            self::HAND,
            self::ADRIFT,
            self::BOARD,
            'vertical',
            1
        );
    }

    public function testRejectsPlayingTheSameCardTwice(): void
    {
        $this->expectExceptionMessage('The card is not available to play from the hand');
        MoveValidator::replayConnectMoves(
            [
                ['action' => 'startGroup', 'cardId' => '11', 'from' => 'hand', 'flipped' => false],
                [
                    'action' => 'placeCard',
                    'cardId' => '11',
                    'from' => 'hand',
                    'flipped' => false,
                    'connection' => ['cardId' => '11', 'x' => 0, 'y' => 0],
                ],
            ],
            self::HAND,
            self::ADRIFT,
            self::BOARD,
            'vertical',
            1
        );
    }

    public function testRejectsNonAdjacentConnection(): void
    {
        // card 07 does not connect to card 05 (difference of 2)
        $this->expectExceptionMessage('The card does not connect to the chosen card');
        MoveValidator::replayConnectMoves(
            [
                ['action' => 'startGroup', 'cardId' => '11', 'from' => 'hand', 'flipped' => false],
                [
                    'action' => 'placeCard',
                    'cardId' => '21',
                    'from' => 'adrift',
                    'flipped' => false,
                    'connection' => ['cardId' => '11', 'x' => 0, 'y' => 0],
                ],
            ],
            self::HAND,
            self::ADRIFT,
            self::BOARD,
            'vertical',
            1
        );
    }

    public function testRejectsConnectionClaimForWrongCell(): void
    {
        $this->expectExceptionMessage('The connecting card details are not correct');
        MoveValidator::replayConnectMoves(
            [
                ['action' => 'startGroup', 'cardId' => '11', 'from' => 'hand', 'flipped' => false],
                [
                    'action' => 'placeCard',
                    'cardId' => '12',
                    'from' => 'hand',
                    'flipped' => false,
                    'connection' => ['cardId' => '11', 'x' => 3, 'y' => 3],
                ],
            ],
            self::HAND,
            self::ADRIFT,
            self::BOARD,
            'vertical',
            1
        );
    }

    public function testRejectsMergeWithNonexistentGroup(): void
    {
        $this->expectExceptionMessage('The group to connect to does not exist');
        MoveValidator::replayConnectMoves(
            [
                ['action' => 'startGroup', 'cardId' => '11', 'from' => 'hand', 'flipped' => false],
                [
                    'action' => 'mergeGroups',
                    'otherGroupId' => '9',
                    'currentConnection' => ['cardId' => '11', 'x' => 0, 'y' => 0],
                    'otherConnection' => ['cardId' => '31', 'x' => 0, 'y' => 0],
                ],
            ],
            self::HAND,
            self::ADRIFT,
            self::BOARD,
            'vertical',
            1
        );
    }

    public function testRejectsMergeWhereGroupsDoNotConnect(): void
    {
        // current group card 06 vs other group card 03: difference of 3
        $this->expectExceptionMessage('The two groups do not connect at the chosen cards');
        MoveValidator::replayConnectMoves(
            [
                ['action' => 'startGroup', 'cardId' => '12', 'from' => 'hand', 'flipped' => false],
                [
                    'action' => 'mergeGroups',
                    'otherGroupId' => '1',
                    'currentConnection' => ['cardId' => '12', 'x' => 0, 'y' => 0],
                    'otherConnection' => ['cardId' => '32', 'x' => 0, 'y' => 1],
                ],
            ],
            self::HAND,
            self::ADRIFT,
            self::BOARD,
            'vertical',
            1
        );
    }

    // #region validateSetAdrift

    public function testSetAdriftAllowsHandCardAndDeckDraw(): void
    {
        MoveValidator::validateSetAdrift('11', 'deck', self::HAND, self::ADRIFT);
        $this->assertTrue(true);
    }

    public function testSetAdriftAllowsDrawingFromAdriftZone(): void
    {
        MoveValidator::validateSetAdrift('11', '21', self::HAND, self::ADRIFT);
        $this->assertTrue(true);
    }

    public function testSetAdriftRejectsCardNotInHand(): void
    {
        $this->expectExceptionMessage('The card to set adrift is not in your hand');
        MoveValidator::validateSetAdrift('99', 'deck', self::HAND, self::ADRIFT);
    }

    public function testSetAdriftRejectsTakingBackTheSameCard(): void
    {
        $this->expectExceptionMessage('You cannot take back the card you just set adrift');
        MoveValidator::validateSetAdrift('11', '11', self::HAND, self::ADRIFT);
    }

    public function testSetAdriftRejectsDrawingCardNotInAdriftZone(): void
    {
        $this->expectExceptionMessage('The card to draw is not in the adrift zone');
        MoveValidator::validateSetAdrift('11', '12', self::HAND, self::ADRIFT);
    }

    public function testSetAdriftRejectsDeckDrawWhenDeckEmpty(): void
    {
        $this->expectExceptionMessage('The deck is empty, you cannot draw from it');
        MoveValidator::validateSetAdrift('11', 'deck', self::HAND, self::ADRIFT, true);
    }

    public function testSetAdriftAllowsNoneWhenDeckEmptyAndAdriftEmpty(): void
    {
        MoveValidator::validateSetAdrift('11', 'none', self::HAND, [], true);
        $this->assertTrue(true);
    }

    public function testSetAdriftRejectsNoneWhenDeckNotEmpty(): void
    {
        $this->expectExceptionMessage('You must draw a card while the deck still has cards remaining');
        MoveValidator::validateSetAdrift('11', 'none', self::HAND, [], false);
    }

    public function testSetAdriftRejectsNoneWhenAdriftHasOtherCards(): void
    {
        $this->expectExceptionMessage('There are cards available to draw from the adrift zone');
        MoveValidator::validateSetAdrift('11', 'none', self::HAND, self::ADRIFT, true);
    }

    // #endregion
}
