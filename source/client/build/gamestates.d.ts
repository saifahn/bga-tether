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
		'type': 'activeplayer',
		'args': 'argPlayerTurn',
		'possibleactions': ['connectAstronauts', 'actSetAdrift'],
		'transitions': {
			'finishConnectingAstronauts': 30,
			'drawAtEndOfTurn': 25,
		},
	},
	25: {
		'name': 'drawAtEndOfTurn',
		'description': '${actplayer} draws a card if they have fewer than 6 cards in hand',
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

interface GameStateArgs {
	'argPlayerTurn': object,
}

interface GameStatePossibleActions {
	'connectAstronauts': {},
	'actSetAdrift': {
		'cardDrawnId': string,
		'cardDrawnNum': string,
		'cardSetAdriftId': string,
		'cardSetAdriftNum': string,
	},
}

}