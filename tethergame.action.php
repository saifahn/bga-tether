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

	public function playCard()
	{
		self::setAjaxMode();

		/** @var int $card_id */
		$card_id = self::getArg('card_id', AT_int, true);

		$this->game->playCard( $card_id );
		self::ajaxResponse();
	}

	public function pass()
	{
		self::setAjaxMode();

		$this->game->pass(  );
		self::ajaxResponse();
	}
}