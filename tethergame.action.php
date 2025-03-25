<?php
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

class action_tethergame extends APP_GameAction
{
	/** @var tethergame $game */
	protected $game; // Enforces functions exist on Table class

	// Constructor: please do not modify
	public function __default()
	{
		if (self::isArg('notifwindow')) {
			$this->view = "common_notifwindow";
			$this->viewArgs['table'] = self::getArg("table", AT_posint, true);
		} else {
			$this->view = "tethergame_tethergame";
			self::trace("Complete reinitialization of board game");
		}
	}

	public function actConnectAstronauts()
	{
		self::setAjaxMode();

		/** @var string $boardStateJSON */
		$boardStateJSON = self::getArg('boardStateJSON', AT_json, true);

		$this->game->actConnectAstronauts( $boardStateJSON );
		self::ajaxResponse();
	}

	public function actSetAdrift()
	{
		self::setAjaxMode();

		/** @var string $cardDrawnId */
		$cardDrawnId = self::getArg('cardDrawnId', AT_alphanum, true);
		/** @var string $cardDrawnNum */
		$cardDrawnNum = self::getArg('cardDrawnNum', AT_alphanum, true);
		/** @var string $cardSetAdriftId */
		$cardSetAdriftId = self::getArg('cardSetAdriftId', AT_alphanum, true);
		/** @var string $cardSetAdriftNum */
		$cardSetAdriftNum = self::getArg('cardSetAdriftNum', AT_alphanum, true);

		$this->game->actSetAdrift( $cardDrawnId, $cardDrawnNum, $cardSetAdriftId, $cardSetAdriftNum );
		self::ajaxResponse();
	}
}