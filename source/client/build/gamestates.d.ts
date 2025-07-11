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

declare namespace BGA {

interface DefinedGameStates extends ValidateGameStates<{
	1: {
		'name': 'gameSetup',
		'description': '',
		'type': 'manager',
		'action': 'stGameSetup',
		'transitions': {
			'': 10,
		},
	},
	10: {
		'name': 'playerTurn',
		'description': '${actplayer} must connect astronauts or set an astronaut adrift',
		'descriptionmyturn': '${you} must connect astronauts or set an astronaut adrift',
		'action': 'stPlayerTurn',
		'type': 'activeplayer',
		'possibleactions': ['actConnectAstronauts', 'actSetAdrift'],
		'transitions': {
			'drawAtEndOfTurn': 25,
			'goToGameEnd': 99,
		},
	},
	25: {
		'name': 'drawAtEndOfTurn',
		'description': 'The active player draws a card if they have fewer than 6 cards in hand to end their turn',
		'type': 'game',
		'action': 'stDrawAtEndOfTurn',
		'transitions': {
			'nextPlayer': 30,
		},
	},
	30: {
		'name': 'nextPlayer',
		'description': '',
		'type': 'game',
		'action': 'stNextPlayer',
		'updateGameProgression': true,
		'transitions': {
			'goToGameEnd': 99,
			'goToNextPlayerTurn': 10,
		},
	},
	99: {
		'name': 'gameEnd',
		'description': 'End of game',
		'type': 'manager',
		'action': 'stGameEnd',
		'args': 'argGameEnd',
	},
}> {}

interface GameStateArgs {}

interface GameStatePossibleActions {
	'actConnectAstronauts': {
		'boardStateJSON': string,
	},
	'actSetAdrift': {
		'cardDrawnId': string,
		'cardDrawnNum': string,
		'cardSetAdriftId': string,
		'cardSetAdriftNum': string,
	},
}

}