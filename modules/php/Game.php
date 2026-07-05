<?php

/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * TetherGame implementation : © Sean Li <9913851+saifahn@users.noreply.github.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * Game.php
 *
 * This is the main file for your game logic.
 *
 * In this PHP file, you are going to defines the rules of the game.
 */

declare(strict_types=1);

namespace Bga\Games\TetherGame;

use Bga\GameFramework\Actions\Types\JsonParam;

require_once(APP_GAMEMODULE_PATH . "module/table/table.game.php");

class Game extends \Table
{
    private array $card_nums;
    public mixed $cards;

    /**
     * Your global variables labels:
     *
     * Here, you can assign labels to global variables you are using for this game. You can use any number of global
     * variables with IDs between 10 and 99. If your game has options (variants), you also have to associate here a
     * label to the corresponding ID in `gameoptions.inc.php`.
     *
     * NOTE: afterward, you can get/set the global variables with `getGameStateValue`, `setGameStateInitialValue` or
     * `setGameStateValue` functions.
     */
    public function __construct()
    {
        parent::__construct();

        $this->initGameStateLabels([
            "final_turns_remaining" => 10,
        ]);

        $this->cards = $this->getNew("module.common.deck");
        $this->cards->init("card");

        $this->card_nums = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '11', '12', '13', '14', '15', '16', '17', '18', '19', '22', '23', '24', '25', '26', '27', '28', '29', '33', '34', '35', '36', '37', '38', '39', '44', '45', '46', '47', '48', '49', '55', '56', '57', '58', '59', '66', '67', '68', '69', '77', '78', '79', '88', '89'];


        /* example of notification decorator.
        // automatically complete notification args when needed
        $this->notify->addDecorator(function(string $message, array $args) {
            if (isset($args['player_id']) && !isset($args['player_name']) && str_contains($message, '${player_name}')) {
                $args['player_name'] = $this->getPlayerNameById($args['player_id']);
            }

            if (isset($args['card_id']) && !isset($args['card_name']) && str_contains($message, '${card_name}')) {
                $args['card_name'] = self::$CARD_TYPES[$args['card_id']]['card_name'];
                $args['i18n'][] = ['card_name'];
            }

            return $args;
        });*/
    }

    /**
     * Compute and return the current game progression.
     *
     * The number returned must be an integer between 0 and 100.
     *
     * This method is called each time we are in a game state with the "updateGameProgression" property set to true.
     *
     * @return int
     * @see ./states.inc.php
     */
    public function getGameProgression()
    {
        // TODO: compute and return the game progression

        return 0;
    }

    /**
     * Game state action, example content.
     *
     * The action method of state `nextPlayer` is called everytime the current game state is set to `nextPlayer`.
     */
    public function stNextPlayer(): void
    {
        $player_id = (int) $this->getActivePlayerId();
        $this->giveExtraTime($player_id);

        $finalTurnsRemaining = (int) $this->getGameStateValue('final_turns_remaining');
        $advance = \Bga\Games\TetherGame\ScoringLogic::advanceFinalTurns($finalTurnsRemaining);

        if ($advance['endGame']) {
            $this->updateTiebreakerScores();
            $this->notify->all('endgame', clienttranslate('The deck ran out of cards and each player has taken their final turn, so the game is now over.'), []);
            $this->gamestate->nextState('goToGameEnd');
            return;
        }

        if ($advance['value'] !== $finalTurnsRemaining) {
            $this->setGameStateValue('final_turns_remaining', $advance['value']);
        }

        $this->activeNextPlayer();

        if ($finalTurnsRemaining !== -1) {
            $incoming_player_id = (int) $this->getActivePlayerId();
            $this->notify->all('finalTurn', clienttranslate('${player_name} takes their final turn before the game ends.'), [
                'player_id' => $incoming_player_id,
                'player_name' => $this->getPlayerNameById($incoming_player_id),
            ]);
        }

        $this->gamestate->nextState('goToNextPlayerTurn');
    }

    public function stPlayerTurn(): void
    {
        $player_id = (int) $this->getActivePlayerId();

        $gameState = [];
        $gameState['adrift'] = $this->getCollectionFromDB(
            "SELECT card_id id, card_type_arg cardNum
            FROM card 
            WHERE card_location = 'adrift'"
        );
        $gameState['hand'] = $this->cards->getCardsInLocation('hand', $player_id);

        $cardsByGroup = $this->getCollectionFromDB(
            "SELECT card_id id, card_type uprightFor, card_type_arg cardNum, card_location_arg groupAndCoords
            FROM card 
            WHERE card_location = 'group'"
        );

        $groups = \Bga\Games\TetherGame\GroupLogic::createGroupObjectForUI($cardsByGroup);
        $gameState['board'] = $groups;
        $gameState['latestGroup'] = count($groups) > 0 ? max(array_keys($groups)) : 0;

        $this->notify->player($player_id, 'updateGameState', '', $gameState);
    }

    public function stDrawAtEndOfTurn(): void
    {
        $current_player_id = (int) $this->getActivePlayerId();
        $opponent_id = $this->getPlayerAfter($current_player_id);

        $hand = $this->cards->getCardsInLocation('hand', $current_player_id);
        if (count($hand) >= 6) {
            $this->notify->player($current_player_id, 'dontDrawHandLimit', clienttranslate('You didn\'t draw a card at the end of your turn because you already had 6 cards in hand.'));
            $this->notify->player($opponent_id, 'dontDrawHandLimit', clienttranslate('${player_name} already has 6 cards in hand so they don\'t draw a card at the end of their turn.'), [
                'player_id' => $current_player_id,
                'player_name' => $this->getPlayerNameById($current_player_id),
            ]);
            $this->gamestate->nextState('nextPlayer');
            return;
        }

        $newCardFromDeck = $this->cards->pickCardForLocation('deck', 'hand', $current_player_id);
        if ($newCardFromDeck === null) {
            $this->notify->all('dontDrawDeckEmpty', clienttranslate('The deck is empty, so no card is drawn at the end of the turn.'), []);
            $this->checkDeckEmptyTrigger();
            $this->gamestate->nextState('nextPlayer');
            return;
        }

        $this->checkDeckEmptyTrigger();

        $newCardName = $this->formatCardName($newCardFromDeck['type_arg']);
        $this->notify->player($current_player_id, 'drawFromDeck', clienttranslate('You drew the card ${card} from the deck at the end of your turn.'), [
            'card' => $newCardName,
            'card_id' => $newCardFromDeck['id'],
            'card_num' => $newCardFromDeck['type_arg'],
        ]);
        $this->notify->player($opponent_id, 'drawOtherPlayer', clienttranslate('${player_name} drew a card from the deck to end their turn.'), [
            'player_id' => $current_player_id,
            'player_name' => $this->getPlayerNameById($current_player_id),
        ]);
        $this->gamestate->nextState('nextPlayer');
    }

    /**
     * Checks whether the deck has just become empty and, if so, starts the
     * final round: each player gets exactly one more turn before the game
     * ends. No-op if the final round has already been triggered.
     */
    private function checkDeckEmptyTrigger(): void
    {
        $deckCount = $this->cards->countCardInLocation('deck');
        $finalTurnsRemaining = (int) $this->getGameStateValue('final_turns_remaining');

        if (!\Bga\Games\TetherGame\ScoringLogic::shouldTriggerFinalRound($deckCount, $finalTurnsRemaining)) {
            return;
        }

        $this->setGameStateValue('final_turns_remaining', 2);
        $this->notify->all('deckEmpty', clienttranslate('The deck is empty! Each player takes one more turn, then the game ends.'), []);
    }

    /**
     * Migrate database.
     *
     * You don't have to care about this until your game has been published on BGA. Once your game is on BGA, this
     * method is called everytime the system detects a game running with your old database scheme. In this case, if you
     * change your database scheme, you just have to apply the needed changes in order to update the game database and
     * allow the game to continue to run with your new version.
     *
     * @param int $from_version
     * @return void
     */
    public function upgradeTableDb($from_version)
    {
        //       if ($from_version <= 1404301345)
        //       {
        //            // ! important ! Use DBPREFIX_<table_name> for all tables
        //
        //            $sql = "ALTER TABLE DBPREFIX_xxxxxxx ....";
        //            $this->applyDbUpgradeToAllDB( $sql );
        //       }
        //
        //       if ($from_version <= 1405061421)
        //       {
        //            // ! important ! Use DBPREFIX_<table_name> for all tables
        //
        //            $sql = "CREATE TABLE DBPREFIX_xxxxxxx ....";
        //            $this->applyDbUpgradeToAllDB( $sql );
        //       }
    }

    /*
     * Gather all information about current game situation (visible by the current player).
     *
     * The method is called each time the game interface is displayed to a player, i.e.:
     *
     * - when the game starts
     * - when a player refreshes the game page (F5)
     */
    protected function getAllDatas(): array
    {
        $result = [];

        // WARNING: We must only return information visible by the current player.
        $current_player_id = (int) $this->getCurrentPlayerId();

        // Get information about players.
        $result["players"] = $this->getCollectionFromDb("SELECT player_id id, player_score score, player_no turnOrder FROM player");

        $result['adrift'] = $this->getCollectionFromDB(
            "SELECT card_id id, card_type_arg cardNum
            FROM card 
            WHERE card_location = 'adrift'"
        );
        $result['hand'] = $this->cards->getCardsInLocation('hand', $current_player_id);

        $cardsByGroup = $this->getCollectionFromDB(
            "SELECT card_id id, card_type uprightFor, card_type_arg cardNum, card_location_arg groupAndCoords
            FROM card
            WHERE card_location = 'group'"
        );

        $groups = \Bga\Games\TetherGame\GroupLogic::createGroupObjectForUI($cardsByGroup);
        $result['board'] = $groups;
        $result['latestGroup'] = count($groups) > 0 ? max(array_keys($groups)) : 0;
        $result['deckEmpty'] = $this->cards->countCardInLocation('deck') === 0;

        return $result;
    }

    /**
     * Returns the game name.
     *
     * IMPORTANT: Please do not modify.
     */
    protected function getGameName()
    {
        return "tethergame";
    }

    /**
     * This method is called only once, when a new game is launched. In this method, you must setup the game
     *  according to the game rules, so that the game is ready to be played.
     */
    protected function setupNewGame($players, $options = [])
    {
        // Set the colors of the players with HTML color code. The default below is red/green/blue/orange/brown. The
        // number of colors defined here must correspond to the maximum number of players allowed for the gams.
        $gameinfos = $this->getGameinfos();
        $default_colors = $gameinfos['player_colors'];

        foreach ($players as $player_id => $player) {
            // Now you can access both $player_id and $player array
            $query_values[] = vsprintf("('%s', '%s', '%s', '%s', '%s')", [
                $player_id,
                array_shift($default_colors),
                $player["player_canal"],
                addslashes($player["player_name"]),
                addslashes($player["player_avatar"]),
            ]);
        }

        // Create players based on generic information.
        //
        // NOTE: You can add extra field on player table in the database (see dbmodel.sql) and initialize
        // additional fields directly here.
        static::DbQuery(
            sprintf(
                "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar) VALUES %s",
                implode(",", $query_values)
            )
        );

        $this->reattributeColorsBasedOnPreferences($players, $gameinfos["player_colors"]);
        $this->reloadPlayersBasicInfos();

        // Init global values with their initial values.
        $this->setGameStateInitialValue('final_turns_remaining', -1);

        // Init game statistics.
        //
        // NOTE: statistics used in this file must be defined in your `stats.inc.php` file.

        // Dummy content.
        // $this->initStat("table", "table_teststat1", 0);
        // $this->initStat("player", "player_teststat1", 0);

        $this->initTables($players);

        // Activate first player once everything has been initialized and ready.
        $this->activeNextPlayer();
    }

    function initTables()
    {
        try {
            // TODO $this->initStats();
            $this->createDeck();
            $this->drawAdriftCards();
            $this->drawInitialCards();
        } catch (\Exception $e) {
            $this->error("Error while creating game");
            $this->dump('err', $e);
        }
    }

    function createDeck()
    {
        $cards = array();
        foreach ($this->card_nums as $num) {
            $cards[] = array('type' => 'none', 'type_arg' => $num, 'nbr' => 1);
        }
        $this->cards->createCards($cards, 'deck');
        $this->cards->shuffle('deck');
    }

    function drawAdriftCards()
    {
        $this->cards->pickCardsForLocation(3, 'deck', 'adrift');
    }

    function drawInitialCards()
    {
        $players = $this->loadPlayersBasicInfos();
        foreach ($players as $player_id => $player) {
            $this->cards->pickCardsForLocation(5, 'deck', 'hand', $player_id);
        }
    }

    function formatCardName(string $cardNum): string
    {

        return "$cardNum/" . strrev($cardNum);
    }

    function actSetAdrift(string $cardDrawnId, string $cardDrawnNum, string $cardSetAdriftId, string $cardSetAdriftNum)
    {
        $current_player_id = (int) $this->getCurrentPlayerId();
        $opponent_id = $this->getPlayerAfter($current_player_id);

        // validate against the state BEFORE the action so the discarded card
        // must come from the hand and cannot be drawn straight back
        $hand = $this->cards->getCardsInLocation('hand', $current_player_id);
        $adrift = $this->getCollectionFromDB(
            "SELECT card_id id, card_type_arg lowNum
            FROM card
            WHERE card_location = 'adrift'"
        );
        $deckEmpty = $this->cards->countCardInLocation('deck') === 0;
        try {
            \Bga\Games\TetherGame\MoveValidator::validateSetAdrift($cardSetAdriftId, $cardDrawnId, $hand, $adrift, $deckEmpty);
        } catch (\InvalidArgumentException $e) {
            throw new \BgaUserException($e->getMessage());
        }

        $this->cards->moveCard($cardSetAdriftId, 'adrift');
        $cardSetAdriftName = $this->formatCardName($cardSetAdriftNum);
        $this->notify->all('cardSetAdrift', clienttranslate('${player_name} sets ${card} adrift.'), [
            'player_id' => $current_player_id,
            'player_name' => $this->getPlayerNameById($current_player_id),
            'card' => $cardSetAdriftName,
            'card_id' => $cardSetAdriftId,
            'card_num' => $cardSetAdriftNum,
        ]);

        if ($cardDrawnId === 'none') {
            $this->notify->all('noCardToDraw', clienttranslate('${player_name} has no card to draw, so their turn ends without drawing.'), [
                'player_id' => $current_player_id,
                'player_name' => $this->getPlayerNameById($current_player_id),
            ]);
        } elseif ($cardDrawnId == 'deck') {
            $newCardFromDeck = $this->cards->pickCard('deck', $current_player_id);
            $this->checkDeckEmptyTrigger();
            $newCardName = $this->formatCardName($newCardFromDeck['type_arg']);
            $this->notify->player($current_player_id, 'drawFromDeck', clienttranslate('You drew the card ${card} from the deck.'), [
                'card' => $newCardName,
                'card_id' => $newCardFromDeck['id'],
                'card_num' => $newCardFromDeck['type_arg'],
            ]);
            $this->notify->all('drawOtherPlayer', clienttranslate('${player_name} drew a card from the deck.'), [
                'player_id' => $current_player_id,
                'player_name' => $this->getPlayerNameById($current_player_id),
            ]);
        } else {
            $this->cards->moveCard($cardDrawnId, 'hand', $current_player_id);
            $newCardName = $this->formatCardName($cardDrawnNum);
            $this->notify->all('drawFromAdrift', clienttranslate('${player_name} drew the card ${card} from the adrift zone.'), [
                'player_id' => $current_player_id,
                'player_name' => $this->getPlayerNameById($current_player_id),
                'card' => $newCardName,
                'card_id' => $cardDrawnId,
                'card_num' => $cardDrawnNum,
            ]);
        }

        $this->gamestate->nextState('drawAtEndOfTurn');
    }

    // TODO: instead of getCardsInLocation 'hand', do a custom query and unify it so a custom cardNumKey is not necessary?
    /**
     * Takes an array of cards and returns them separated by commas.
     */
    function formatCardsIntoCommaSeparatedString(array $cards, string $cardNumKey): string
    {
        return implode(', ', array_map(fn($card) => $this->formatCardName($card[$cardNumKey]), $cards));
    }

    /**
     * Takes groups of cards (returned from getCardsByGroup)
     * and returns a string representation of the cards from each group.
     */
    function getGroupsByCommaSeparatedCardStrings(array $groups)
    {
        $groupsOfCommaSeparatedCardStrings = array();
        foreach ($groups as $groupNum => $group) {
            $groupsOfCommaSeparatedCardStrings[$groupNum] = "[" . $this->formatCardsIntoCommaSeparatedString($group, 'cardNum') . "]";
        }
        return implode(', ', $groupsOfCommaSeparatedCardStrings);
    }

    /**
     * Takes the whole raw collection of cards in groups and sorts them into cards
     * by group number.
     */
    function getCardsByGroup(array $cards)
    {
        // takes array of cards and splits them into groups
        $groups = array();
        foreach ($cards as $card) {
            $groupAndCoords = explode("_", $card["groupAndCoords"]);
            $groupNum = $groupAndCoords[0];

            if (!isset($groups[$groupNum])) {
                // create a new group
                $groups[$groupNum] = array();
            }
            $groups[$groupNum][] = $card;
        }
        return $groups;
    }

    function actConnectAstronauts(#[JsonParam] array $moves)
    {
        $current_player_id = (int) $this->getCurrentPlayerId();

        // load the authoritative state from the database
        $adrift = $this->getCollectionFromDB(
            "SELECT card_id id, card_type_arg lowNum
            FROM card
            WHERE card_location = 'adrift'"
        );
        $handRows = $this->cards->getCardsInLocation('hand', $current_player_id);
        $hand = array();
        foreach ($handRows as $id => $handCard) {
            $hand[$id] = ['id' => (string) $id, 'lowNum' => $handCard['type_arg']];
        }
        $initialCardsInGroups = $this->getCollectionFromDB(
            "SELECT card_id id, card_type uprightFor, card_type_arg cardNum, card_location_arg groupAndCoords
            FROM card
            WHERE card_location = 'group'"
        );
        $initialCardsByGroup = $this->getCardsByGroup($initialCardsInGroups);
        $board = \Bga\Games\TetherGame\GroupLogic::createGroupObjectForUI($initialCardsInGroups);
        $latestGroup = count($board) > 0 ? (int) max(array_keys($board)) : 0;

        $playerNo = (int) $this->getUniqueValueFromDB(
            "SELECT player_no FROM player WHERE player_id = $current_player_id"
        );
        $playerOrientation = $playerNo === 1 ? 'vertical' : 'horizontal';

        // replay the submitted moves server-side; the server - not the
        // client - computes the resulting board and rejects illegal moves
        try {
            $result = \Bga\Games\TetherGame\MoveValidator::replayConnectMoves(
                $moves,
                $hand,
                $adrift,
                $board,
                $playerOrientation,
                $latestGroup
            );
        } catch (\InvalidArgumentException $e) {
            throw new \BgaUserException($e->getMessage());
        }

        $cardUpdates = \Bga\Games\TetherGame\CardUpdateHelper::buildCardUpdates($result['board']);
        if (!empty($cardUpdates)) {
            $sql = \Bga\Games\TetherGame\CardUpdateHelper::generateBulkUpdateSQL($cardUpdates);
            $this->DbQuery($sql);
        }

        // groups that no longer exist were merged into the played group
        $groupNumsRemoved = array_diff_key($initialCardsByGroup, $result['board']);
        $groupsAndCardsPlayed = array_intersect_key($initialCardsByGroup, $groupNumsRemoved);

        $opponent_id = $this->getPlayerAfter($current_player_id);

        $this->bga->notify->player($opponent_id, 'connectFromHandOpponent', clienttranslate('${player_name} connected astronauts by playing the card(s) ${cards} from their hand.'), [
            "player_id" => $current_player_id,
            "player_name" => $this->getPlayerNameById($current_player_id),
            "cards" => $this->formatCardsIntoCommaSeparatedString($result['playedFromHand'], 'lowNum'),
        ]);
        $this->bga->notify->player($current_player_id, 'connectFromHandSelf', clienttranslate('You connected astronauts by playing the card(s) ${cards} from your hand.'), [
            "cards" => $this->formatCardsIntoCommaSeparatedString($result['playedFromHand'], 'lowNum')
        ]);
        if (count($result['playedFromAdrift']) > 0) {
            $this->bga->notify->player($opponent_id, 'connectFromAdriftOpponent', clienttranslate('${player_name} connected the card(s) ${cards} from the adrift zone.'), [
                "player_id" => $current_player_id,
                "player_name" => $this->getPlayerNameById($current_player_id),
                "cards" => $this->formatCardsIntoCommaSeparatedString($result['playedFromAdrift'], 'lowNum')
            ]);
            $this->bga->notify->player($current_player_id, 'connectFromAdriftSelf', clienttranslate('You connected the card(s) ${cards} from the adrift zone.'), [
                "cards" => $this->formatCardsIntoCommaSeparatedString($result['playedFromAdrift'], 'lowNum')
            ]);
        }
        if (count($groupsAndCardsPlayed) > 0) {
            $this->bga->notify->player($opponent_id, 'connectBoardOpponent', clienttranslate('${player_name} connected to the group(s) of cards: ${groups} from the board.'), [
                "player_id" => $current_player_id,
                "player_name" => $this->getPlayerNameById($current_player_id),
                "groups" => $this->getGroupsByCommaSeparatedCardStrings($groupsAndCardsPlayed)
            ]);
            $this->bga->notify->player($current_player_id, 'connectBoardSelf', clienttranslate('You connected to the group(s) of cards: ${groups} from the board.'), [
                "groups" => $this->getGroupsByCommaSeparatedCardStrings($groupsAndCardsPlayed)
            ]);
        }
        $this->handleScoring();

        $this->gamestate->nextState('drawAtEndOfTurn');
    }

    /**
     * Store each player's tiebreaker score (player_aux_score) so BGA can
     * break tied final scores. Fewest cards in hand wins, so the aux score
     * is the negated hand count. Called right before every transition to
     * game end.
     */
    private function updateTiebreakerScores(): void
    {
        $handCounts = $this->getCollectionFromDB(
            "SELECT card_location_arg player_id, COUNT(*) cnt
            FROM card
            WHERE card_location = 'hand'
            GROUP BY card_location_arg"
        );

        foreach ($this->loadPlayersBasicInfos() as $playerId => $info) {
            $count = isset($handCounts[$playerId]) ? (int) $handCounts[$playerId]['cnt'] : 0;
            $aux = \Bga\Games\TetherGame\ScoringLogic::calculateTiebreakerAuxScore($count);
            $this->DbQuery("UPDATE player SET player_aux_score = $aux WHERE player_id = $playerId");
        }
    }

    function handleScoring(): void
    {
        // Fetch all cards in groups
        $cards = $this->getCollectionFromDB(
            "SELECT card_id id, card_type uprightFor, card_type_arg cardNum, card_location_arg groupAndCoords, scored_at lastScored
            FROM card
            WHERE card_location = 'group'"
        );

        // Use extracted logic to calculate group dimensions
        $groupsBySizeAndLastScored = \Bga\Games\TetherGame\GroupLogic::calculateGroupDimensions($cards);

        $hScore = 0;
        $vScore = 0;
        foreach ($groupsBySizeAndLastScored as $groupNum => $group) {
            // Use extracted scoring logic to determine threshold
            $threshold = \Bga\Games\TetherGame\ScoringLogic::calculateScoringThreshold(
                $group["size"],
                $group["lastScoredAt"]
            );

            if ($threshold !== null) {
                // Use extracted logic to calculate scores
                $scores = \Bga\Games\TetherGame\ScoringLogic::calculateScores(
                    $group["greatestX"],
                    $group["greatestY"]
                );
                $hScore = $scores['horizontal'];
                $vScore = $scores['vertical'];

                // Fetch players
                $players = $this->getCollectionFromDB("SELECT player_id id, player_name playerName, player_score score, player_no turnOrder FROM player");
                foreach ($players as $player) {
                    if ($player["turnOrder"] == 1) {
                        $vPlayer = $player;
                    } else {
                        $hPlayer = $player;
                    }
                }
                $updatedVScore = $vPlayer["score"] + $vScore;
                $updatedHScore = $hPlayer["score"] + $hScore;

                // Update scores in database
                $updateVScore = "UPDATE player SET player_score=$updatedVScore WHERE player_no=1";
                $updateHSCore = "UPDATE player SET player_score=$updatedHScore WHERE player_no=2";
                $this->DbQuery($updateVScore);
                $this->DbQuery($updateHSCore);

                // Update cards scored_at threshold
                $updateCards = "UPDATE card SET scored_at=$threshold WHERE card_location_arg LIKE '$groupNum\_%'";
                $this->DbQuery($updateCards);

                // Send notifications
                $this->bga->notify->all('scoringTriggered', clienttranslate('The latest Connect Astronauts action brought the group above the threshold of ${threshold} cards and triggered scoring.'), [
                    'threshold' => $threshold,
                ]);
                $this->bga->notify->all('updateVScore', clienttranslate('The vertical player ${player_name} scored ${scored} points, bringing their total to ${new_total}'), [
                    'player_id' => $vPlayer["id"],
                    'player_name' => $vPlayer['playerName'],
                    'scored' => $vScore,
                    'new_total' => $updatedVScore
                ]);
                $this->bga->notify->all('updateHScore', clienttranslate('The horizontal player ${player_name} scored ${scored} points, bringing their total to ${new_total}.'), [
                    'player_id' => $hPlayer["id"],
                    'player_name' => $hPlayer['playerName'],
                    'scored' => $hScore,
                    'new_total' => $updatedHScore,
                ]);

                // Use extracted logic to check end-game conditions
                $endGameReason = \Bga\Games\TetherGame\ScoringLogic::checkEndGameCondition(
                    $updatedVScore,
                    $updatedHScore,
                    $threshold
                );

                if ($endGameReason === 'GROUP_SIZE_14') {
                    $this->updateTiebreakerScores();
                    $this->bga->notify->all('endgame', clienttranslate('A group of 14 or more astronauts was created this round, so the game is now over.'), []);
                    $this->gamestate->nextState('goToGameEnd');
                    return;
                }
                if ($endGameReason === 'SCORE_DIFFERENCE_6') {
                    $this->updateTiebreakerScores();
                    $this->bga->notify->all('endgame', clienttranslate('A player has a 6 or more point lead against the other player, so the game is now over.'), []);
                    $this->gamestate->nextState('goToGameEnd');
                    return;
                }

                break;
            }

            if ($hScore > 0 && $vScore > 0) {
                break;
            }
        }
    }

    /**
     * This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
     * You can do whatever you want in order to make sure the turn of this player ends appropriately
     * (ex: pass).
     *
     * Important: your zombie code will be called when the player leaves the game. This action is triggered
     * from the main site and propagated to the gameserver from a server, not from a browser.
     * As a consequence, there is no current player associated to this action. In your zombieTurn function,
     * you must _never_ use `getCurrentPlayerId()` or `getCurrentPlayerName()`, otherwise it will fail with a
     * "Not logged" error message.
     *
     * @param array{ type: string, name: string } $state
     * @param int $active_player
     * @return void
     * @throws feException if the zombie mode is not supported at this game state.
     */
    protected function zombieTurn(array $state, int $active_player): void
    {
        $state_name = $state["name"];

        if ($state["type"] === "activeplayer") {
            switch ($state_name) {
                default: {
                    $this->gamestate->nextState("zombiePass");
                    break;
                }
            }

            return;
        }

        // Make sure player is in a non-blocking status for role turn.
        if ($state["type"] === "multipleactiveplayer") {
            $this->gamestate->setPlayerNonMultiactive($active_player, '');
            return;
        }

        throw new \feException("Zombie mode not supported at this game state: \"{$state_name}\".");
    }
}
