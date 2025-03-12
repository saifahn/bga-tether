/*
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * TetherGame implementation : © Sean Li 9913851+saifahn@users.noreply.github.com
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 */

/**
 * See {@link ../../node_modules/bga-ts-template/docs/typescript/index.md} for a LOT more information on this file.
 * The file include alternative ways to structure this file, how to break it up into multiple files, and more.
 */

// Defines the name of this module. Same as putting this code into a file at path: bgagame/tethergame.ts
/// <amd-module name="bgagame/tethergame"/>

import Gamegui = require('ebg/core/gamegui');
import 'ebg/counter';

/** See {@link BGA.Gamegui} for more information. */
class TetherGame extends Gamegui {
  eventHandlers: {
    element: HTMLElement;
    event: string;
    handler: EventListener;
  }[] = [];

  cardSetAdrift: string | null = null;

  /** See {@link BGA.Gamegui} for more information. */
  constructor() {
    super();
    console.log('tethergame constructor');
  }

  /** See {@link  BGA.Gamegui#setup} for more information. */
  override setup(gamedatas: BGA.Gamedatas): void {
    console.log('Starting game setup');

    const gamePlayArea = document.getElementById('game_play_area');
    if (!gamePlayArea) {
      throw new Error('game_play_area not found');
    }

    const adriftZone = document.createElement('div');
    adriftZone.id = 'adrift-zone';
    gamePlayArea.appendChild(adriftZone);

    const deck = document.createElement('div');
    deck.id = 'deck';
    deck.classList.add('deck');
    adriftZone.appendChild(deck);

    const hand = document.createElement('div');
    hand.id = 'hand';
    gamePlayArea.appendChild(hand);

    for (const cardId in gamedatas.adrift) {
      const cardElement = document.createElement('div');
      cardElement.classList.add('card');
      cardElement.classList.add('card--adrift');
      cardElement.classList.add('js-adrift');
      cardElement.dataset['cardId'] = cardId;
      const cardNum = gamedatas.adrift[cardId]!.cardNum;
      cardElement.dataset['cardNumber'] = cardNum;
      cardElement.innerText = cardNum;
      adriftZone.appendChild(cardElement);
    }

    for (const cardId in gamedatas.hand) {
      const cardElement = document.createElement('div');
      cardElement.dataset['cardId'] = cardId;
      const cardNumber = gamedatas.hand[cardId]!.type_arg;
      cardElement.dataset['cardNumber'] = cardNumber;
      cardElement.innerText = cardNumber;
      cardElement.classList.add('card');
      hand.appendChild(cardElement);
    }

    // Setup game notifications to handle (see "setupNotifications" method below)
    this.setupNotifications();

    console.log('Ending game setup');
  }

  ///////////////////////////////////////////////////
  //// Game & client states

  /** See {@link BGA.Gamegui#onEnteringState} for more information. */
  override onEnteringState(
    ...[stateName, state]: BGA.GameStateTuple<['name', 'state']>
  ): void {
    console.log('Entering state: ' + stateName);

    switch (stateName) {
      default:
        // enable/disable any user interaction...
        break;
    }
  }

  /** See {@link BGA.Gamegui#onLeavingState} for more information. */
  override onLeavingState(stateName: BGA.ActiveGameState['name']): void {
    console.log('Leaving state: ' + stateName);

    switch (stateName) {
      default:
        // enable/disable any user interaction...
        break;
    }
  }

  /** See {@link BGA.Gamegui#onUpdateActionButtons} for more information. */
  override onUpdateActionButtons(
    ...[stateName, args]: BGA.GameStateTuple<['name', 'args']>
  ): void {
    console.log('onUpdateActionButtons: ' + stateName, args);

    if (!this.isCurrentPlayerActive()) return;

    switch (stateName) {
      case 'playerTurn':
        // Add buttons to action bar...
        this.addActionButton(
          'connect-astronauts-button',
          _('Connect Astronauts'),
          () => {
            console.log('not implemented yet');
          },
          undefined,
          false,
          'gray'
        );
        this.addActionButton(
          'set-adrift-button',
          _('Set Astronauts Adrift'),
          (e) => {
            this.onSetAdriftClick(e);
          }
        );
        break;
      // @ts-expect-error
      case 'client_setAdriftChooseFromHand':
        this.addActionButton(
          'cancel-button',
          _('Restart turn'),
          () => {
            this.cancelSetAdriftAction();
          },
          undefined,
          false,
          'red'
        );
        break;
      // @ts-expect-error
      case 'client_setAdriftChooseDraw':
        this.addActionButton(
          'draw-from-deck-button',
          _('Draw from deck'),
          (e) => {
            this.drawFromDeck(e);
          }
        );
        break;
    }
  }

  ///////////////////////////////////////////////////
  //// Utility methods

  ///////////////////////////////////////////////////
  //// Player's action

  /*
		Here, you are defining methods to handle player's action (ex: results of mouse click on game objects).
		
		Most of the time, these methods:
		- check the action is possible at this game state.
		- make a call to the game server
	*/

  getCardElementsFromHand() {
    const hand = document.getElementById('hand');
    if (!hand) {
      throw new Error('hand not found');
    }
    return hand.childNodes;
  }

  clearSelectedCards() {
    const selectedCards = document.querySelectorAll('.card--selected');
    selectedCards.forEach((card) => {
      card.classList.remove('card--selected');
    });
  }

  clearSelectableCards() {
    const selectableCards = document.querySelectorAll('.card--selectable');
    selectableCards.forEach((card) => {
      card.classList.remove('card--selectable');
    });
  }

  cancelSetAdriftAction() {
    this.clearSelectedCards();
    this.clearSelectableCards();
    this.cardSetAdrift = null;
    this.restoreServerGameState();
  }

  drawFromDeck(e: Event) {
    console.log('drawFromDeck must be implemented');
  }

  onSetAdriftHandClick(e: Event) {
    if (!(e.target instanceof HTMLElement)) {
      throw new Error(
        "onSetAdriftHandClick called when it shouldn't have been"
      );
    }
    e.target.classList.add('card--selected');

    this.cardSetAdrift = e.target.dataset['cardId']!;
    this.clearSelectableCards();

    for (const handler of this.eventHandlers) {
      handler.element.removeEventListener(handler.event, handler.handler);
    }
    this.setClientState('client_setAdriftChooseDraw', {
      // @ts-expect-error
      descriptionmyturn: _(
        '${you} must choose to take an astronaut from the adrift zone or draw from the deck.'
      ),
    });

    // add click handlers to each of the adrift cards and the deck
    const adriftCards = document.querySelectorAll('.js-adrift');
    const adriftHandler = (e: Event) => this.onAdriftCardDrawClick(e);
    adriftCards.forEach((card) => {
      if (card instanceof HTMLElement) {
        card.classList.add('card--selectable');
        card.addEventListener('click', adriftHandler);
        this.eventHandlers.push({
          element: card,
          event: 'click',
          handler: adriftHandler,
        });
      }
    });
  }

  onAdriftCardDrawClick(e: Event) {
    if (!(e.target instanceof HTMLElement)) {
      throw new Error("onAdriftCardClick called when it shouldn't have been");
    }
    e.preventDefault();
    e.stopPropagation();

    if (!e.target.dataset['cardId'] || !this.cardSetAdrift) {
      throw new Error('id of card to draw or cardSetAdrift not set properly');
    }
    this.clearSelectableCards();
    this.clearSelectedCards();

    const cardDrawn = e.target.dataset['cardId'];
    const cardSetAdrift = this.cardSetAdrift;

    console.table({ cardDrawn, cardSetAdrift });

    this.bgaPerformAction('actSetAdrift', {
      cardDrawn: e.target.dataset['cardId'],
      cardSetAdrift: this.cardSetAdrift,
    });

    this.cardSetAdrift = null;
  }

  onSetAdriftClick(e: Event) {
    if (!(e.target instanceof HTMLElement)) {
      throw new Error("onSetAdriftClick called when it shouldn't have been");
    }
    e.preventDefault();
    e.stopPropagation();
    this.setClientState('client_setAdriftChooseFromHand', {
      // @ts-expect-error
      descriptionmyturn: _(
        '${you} must select an astronaut from your hand to set adrift.'
      ),
    });

    const handler = (e: Event) => this.onSetAdriftHandClick(e);
    this.getCardElementsFromHand().forEach((card) => {
      if (card instanceof HTMLElement) {
        card.classList.add('card--selectable');
        card.addEventListener('click', handler);
        this.eventHandlers.push({
          element: card,
          event: 'click',
          handler,
        });
      }
    });
    // when clicked, store the id and move to the next client state
    // in the next client state, the player can choose to draw from the adrift zone or deck
    // then send everything to server and update
  }

  /* Example:

	onButtonClicked( evt: Event )
	{
		console.log( 'onButtonClicked' );

		// Preventing default browser reaction
		evt.preventDefault();

		// Builtin example...
		if(this.checkAction( 'myAction' ))
		{
			this.ajaxcall(
				`/${this.game_name!}/${this.game_name!}/myAction.html`,
				{
					lock: true, 
					myArgument1: arg1,
					myArgument2: arg2,
				},
				this,
				function( server_response: unknown ) {
					// Callback only on success (no error)
					// (for player actions, this is almost always empty)
				}, function(error: boolean, errorMessage?: string, errorCode?: number) {
					// What to do after the server call in anyway (success or failure)
					// (usually catch unexpected server errors)
				},
			);
		}

		// Builtin example with new BGA wrapper...
		this.bgaPerformAction( 'myAction', { myArgument1: arg1, myArgument2: arg2 } );

		//	With CommonMixin from 'cookbook/common'...
		this.ajaxAction(
			'myAction',
			{ myArgument1: arg1, myArgument2: arg2 },
			function(error: boolean, errorMessage?: string, errorCode?: number) {
				// What to do after the server call in anyway (success or failure)
				// (usually catch unexpected server errors)
			}
		);
	}

	*/

  ///////////////////////////////////////////////////
  //// Reaction to cometD notifications

  /** See {@link BGA.Gamegui#setupNotifications} for more information. */
  override setupNotifications = () => {
    console.log('notifications subscriptions setup');

    // TODO: here, associate your game notifications with local methods

    // Builtin example...
    // dojo.subscribe( 'cardPlayed_1', this, "ntf_any" );
    // dojo.subscribe( 'actionTaken', this, "ntf_actionTaken" );
    // dojo.subscribe( 'cardPlayed_0', this, "ntf_cardPlayed" );
    // dojo.subscribe( 'cardPlayed_1', this, "ntf_cardPlayed" );

    //	With CommonMixin from 'cookbook/common'...
    // this.subscribeNotif( "cardPlayed_1", this.ntf_any );
    // this.subscribeNotif( "actionTaken", this.ntf_actionTaken );
    // this.subscribeNotif( "cardPlayed_0", this.ntf_cardPlayed );
    // this.subscribeNotif( "cardPlayed_1", this.ntf_cardPlayed );
  };

  /* Example:

	ntf_any( notif: BGA.Notif )
	{
		console.log( 'ntf_any', notif );
		notif.args!['arg_0'];
	}

	ntf_actionTaken( notif: BGA.Notif<'actionTaken'> ) {
		console.log( 'ntf_actionTaken', notif );
	}

	ntf_cardPlayed( notif: BGA.Notif<'cardPlayed_0' | 'cardPlayed_1'> )
	{
		console.log( 'ntf_cardPlayed', notif );
		switch( notif.type ) {
			case 'cardPlayed_0':
				notif.args.arg_0;
				break;
			case 'cardPlayed_1':
				notif.args.arg_1;
				break;
		}
	}

	*/
}

// The global 'bgagame.tethergame' class is instantiated when the page is loaded and used as the Gamegui.
window.bgagame = { tethergame: TetherGame };
