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
            "my_first_global_variable" => 10,
            "my_second_global_variable" => 11,
            "my_first_game_variant" => 100,
            "my_second_game_variant" => 101,
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
     * Game state arguments, example content.
     *
     * This method returns some additional information that is very specific to the `playerTurn` game state.
     *
     * @return array
     * @see ./states.inc.php
     */
    public function argPlayerTurn(): array
    {
        $res = array('_private' => array());
        // can't call getCurrentPlayer or getActivePlayer here because this is
        // happening in a transition for all players
        $players = $this->loadPlayersBasicInfos();


        foreach ($players as $player_id => $player_info) {
            $possibleMoves = $this->getPossibleConnections($player_id);
            $res['_private'][$player_id] = $possibleMoves;
        }

        return $res;
    }

    protected function canCardsBeConnected(string $cardNum, mixed $cardToCompare)
    {
        $cardToCompareNum = $cardToCompare['type_arg'];
        $cardToCompareNumReversed = strrev($cardToCompareNum);
        return $cardToCompareNum == $cardNum + 1 || $cardToCompareNum == $cardNum - 1 || $cardToCompareNumReversed == $cardNum + 1 || $cardToCompareNumReversed == $cardNum - 1;
    }

    public function getPossibleConnections(int $player_id): array
    {
        // TODO: improve this with a better SQL call that gets all the necessary data in one go
        // adrift + hand
        $hand = $this->cards->getCardsInLocation('hand', $player_id);
        $adrift = $this->cards->getCardsInLocation('adrift');
        $relevantCards = array_merge($hand, $adrift);
        $viableCards = array();

        foreach ($relevantCards as $card) {
            // check both sides of the card
            $cardNum = $card['type_arg'];
            foreach ($relevantCards as $otherCard) {
                if ($this->canCardsBeConnected($cardNum, $otherCard)) {
                    array_push($viableCards, $cardNum);
                    break;
                }
            }

            $cardNumReversed = strrev($cardNum);
            foreach ($relevantCards as $otherCard) {
                if ($this->canCardsBeConnected($cardNumReversed, $otherCard)) {
                    array_push($viableCards, $cardNumReversed);
                    break;
                }
            }
        }
        return $viableCards;
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
        $player_id = (int)$this->getActivePlayerId();
        $this->giveExtraTime($player_id);
        $this->activeNextPlayer();

        $this->gamestate->nextState('goToNextPlayerTurn');
    }

    public function stPlayerTurn(): void
    {
        $player_id = (int)$this->getActivePlayerId();

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
        $gameState['board'] = $this->createGroupObjectForUI($cardsByGroup);

        $this->notify->player($player_id, 'updateGameState', '', $gameState);
    }

    public function stDrawAtEndOfTurn(): void
    {
        $current_player_id = (int)$this->getActivePlayerId();
        $opponent_id = $this->getPlayerAfter($current_player_id);

        $hand = $this->cards->getCardsInLocation('hand', $current_player_id);
        if (count($hand) < 6) {
            $newCardFromDeck = $this->cards->pickCardForLocation('deck', 'hand', $current_player_id);
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
        } else {
            $this->notify->player($current_player_id, 'dontDrawHandLimit', clienttranslate('You didn\'t draw a card at the end of your turn because you already had 6 cards in hand.'));
            $this->notify->player($opponent_id, 'dontDrawHandLimit', clienttranslate('${player_name} already has 6 cards in hand so they don\'t draw a card at the end of their turn.'), [
                'player_id' => $current_player_id,
                'player_name' => $this->getPlayerNameById($current_player_id),
            ]);
        }
        $this->gamestate->nextState('nextPlayer');
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
    *
    */

    protected function createGroupObjectForUI(array $cards): array
    {
        $cardsByGroupAndCoords = array();
        foreach ($cards as $card) {
            $groupAndCoords = explode("_", $card["groupAndCoords"]);
            // 0 is group number, 1 is x coord, 2 is y coord
            $x = $groupAndCoords[1];
            $y = $groupAndCoords[2];

            $cardsByGroupAndCoords[$groupAndCoords[0]][$x][$y] = array(
                "id" => $card['id'],
                "lowNum" => $card['cardNum'],
                "uprightFor" => $card['uprightFor'],
            );

            if (!isset($cardsByGroupAndCoords[$groupAndCoords[0]]["greatestX"])) {
                $cardsByGroupAndCoords[$groupAndCoords[0]]["greatestX"] = 0;
                $greatestX = 0;
            }
            if (!isset($cardsByGroupAndCoords[$groupAndCoords[0]]["greatestY"])) {
                $cardsByGroupAndCoords[$groupAndCoords[0]]["greatestY"] = 0;
                $greatestY = 0;
            }

            if ($x > $greatestX) {
                $cardsByGroupAndCoords[$groupAndCoords[0]]["greatestX"] = $x;
            }
            if ($y > $greatestY) {
                $cardsByGroupAndCoords[$groupAndCoords[0]]["greatestY"] = $y;
            }
        }

        $groups = array();
        foreach ($cardsByGroupAndCoords as $groupNum => $group) {
            $groups[$groupNum] = array(
                "number" => $groupNum,
                "cards" => array(),
            );
            for ($x = 0; $x < $group["greatestX"] + 1; $x++) {
                array_push($groups[$groupNum]["cards"], array());
                for ($y = 0; $y < $group["greatestY"] + 1; $y++) {
                    $this->debug("x: $x, y: $y");

                    $itemToSet = $cardsByGroupAndCoords[$groupNum][$x][$y] ?? NULL;
                    // FIXME: check this actually returns null or the card as expected
                    array_push($groups[$groupNum]["cards"][$x], $itemToSet);
                }
            }
        }
        return $groups;
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
        // NOTE: you can retrieve some extra field you added for "player" table in `dbmodel.sql` if you need it.
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
        $result['board'] = $this->createGroupObjectForUI($cardsByGroup);

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

        // Dummy content.
        $this->setGameStateInitialValue("my_first_global_variable", 0);

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
            $this->activeNextPlayer();
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

        $this->cards->moveCard($cardSetAdriftId, 'adrift');
        $cardSetAdriftName = $this->formatCardName($cardSetAdriftNum);
        $this->notify->all('cardSetAdrift', clienttranslate('${player_name} sets ${card} adrift.'), [
            'player_id' => $current_player_id,
            'player_name' => $this->getPlayerNameById($current_player_id),
            'card' => $cardSetAdriftName,
            'card_id' => $cardSetAdriftId,
            'card_num' => $cardSetAdriftNum,
        ]);

        if ($cardDrawnId == 'deck') {
            $newCardFromDeck = $this->cards->pickCard('deck', $current_player_id);
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

    function actConnectAstronauts(#[JsonParam] array $boardStateJSON)
    {
        try {
            // TODO: make more efficient - one SQL query at the end
            // groups
            foreach ($boardStateJSON as $groupNum => $group) {
                // get the cards
                foreach ($group["cards"] as $xCoord => $cards) {
                    $yCoord = 0;
                    foreach ($cards as $card) {
                        if ($card) {
                            $orientation = $card['uprightFor'];
                            $groupAndCoords = $groupNum . '_' . $xCoord . '_' . $yCoord;
                            $id = $card['id'];
                            $sql = "UPDATE card SET card_type='$orientation', card_location='group', card_location_arg='$groupAndCoords' WHERE card_id=$id";
                            $this->DbQuery($sql);
                        }
                        // TODO: add validation to make sure that these are valid moves
                        $yCoord++;
                    }
                }
            }
            // TODO: personalize the notification
            $current_player_id = (int) $this->getCurrentPlayerId();
            $opponent_id = $this->getPlayerAfter($current_player_id);
            $this->notifyPlayer($opponent_id, 'updateBoardAndAdrift', clienttranslate('${player_name} connected some astronauts.'), [
                "player_id" => $current_player_id,
                "player_name" => $this->getPlayerNameById($current_player_id),
            ]);
            $this->notifyPlayer($current_player_id, 'connectAstronautComplete', clienttranslate('You connected some astronauts.'), []);
        } catch (\Exception $e) {
            $this->error("Error while connecting astronauts");
            $this->dump('err', $e);
            return;
        }

        $this->gamestate->nextState('drawAtEndOfTurn');
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
