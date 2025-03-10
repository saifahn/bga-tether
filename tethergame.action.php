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

	public function connectAstronauts()
	{
		self::setAjaxMode();

		$this->game->connectAstronauts(  );
		self::ajaxResponse();
	}

	public function setAdrift()
	{
		self::setAjaxMode();

		$this->game->setAdrift(  );
		self::ajaxResponse();
	}
}