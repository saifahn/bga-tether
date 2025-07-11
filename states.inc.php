<?php
declare(strict_types=1);
/*
 * THIS FILE HAS BEEN AUTOMATICALLY GENERATED. ANY CHANGES MADE DIRECTLY MAY BE OVERWRITTEN.
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * TetherGame implementation : © Sean Li 9913851+saifahn@users.noreply.github.com
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 */

/**
 * TYPE CHECKING ONLY, this function is never called.
 * If there are any undefined function errors here, you MUST rename the action within the game states file, or create the function in the game class.
 * If the function does not match the parameters correctly, you are either calling an invalid function, or you have incorrectly added parameters to a state function.
 */
if (false) {
	/** @var tethergame $game */
	$game->stPlayerTurn();
	$game->stDrawAtEndOfTurn();
	$game->stNextPlayer();
}

$machinestates = array(
	1 => array(
		'name' => 'gameSetup',
		'description' => '',
		'type' => 'manager',
		'action' => 'stGameSetup',
		'transitions' => array(
			'' => 10,
		),
	),
	10 => array(
		'name' => 'playerTurn',
		'description' => clienttranslate('${actplayer} must connect astronauts or set an astronaut adrift'),
		'descriptionmyturn' => clienttranslate('${you} must connect astronauts or set an astronaut adrift'),
		'action' => 'stPlayerTurn',
		'type' => 'activeplayer',
		'possibleactions' => ['actConnectAstronauts', 'actSetAdrift'],
		'transitions' => array(
			'drawAtEndOfTurn' => 25,
			'goToGameEnd' => 99,
		),
	),
	25 => array(
		'name' => 'drawAtEndOfTurn',
		'description' => clienttranslate('The active player draws a card if they have fewer than 6 cards in hand to end their turn'),
		'type' => 'game',
		'action' => 'stDrawAtEndOfTurn',
		'transitions' => array(
			'nextPlayer' => 30,
		),
	),
	30 => array(
		'name' => 'nextPlayer',
		'description' => '',
		'type' => 'game',
		'action' => 'stNextPlayer',
		'updateGameProgression' => true,
		'transitions' => array(
			'goToGameEnd' => 99,
			'goToNextPlayerTurn' => 10,
		),
	),
	99 => array(
		'name' => 'gameEnd',
		'description' => clienttranslate('End of game'),
		'type' => 'manager',
		'action' => 'stGameEnd',
		'args' => 'argGameEnd',
	),
);