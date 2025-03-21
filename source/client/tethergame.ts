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

  cardSetAdrift: {
    id: string;
    number: string;
  } | null = null;

  /** See {@link BGA.Gamegui} for more information. */
  constructor() {
    super();
    console.log('tethergame constructor');
  }

  createCardElement(cardId: string, cardNum: string) {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.dataset['cardId'] = cardId;
    cardElement.dataset['cardNumber'] = cardNum;
    cardElement.id = `card-${cardNum}`;
    return cardElement;
  }

  createAdriftCardElement(cardId: string, cardNum: string) {
    const cardElement = this.createCardElement(cardId, cardNum);
    cardElement.classList.add('card--adrift');
    cardElement.classList.add('js-adrift');
    return cardElement;
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
    deck.classList.add('js-deck');
    adriftZone.appendChild(deck);

    const hand = document.createElement('div');
    hand.id = 'hand';
    gamePlayArea.appendChild(hand);

    for (const cardId in gamedatas.adrift) {
      const cardEl = this.createAdriftCardElement(
        cardId,
        gamedatas.adrift[cardId]!.cardNum
      );
      adriftZone.appendChild(cardEl);
    }

    for (const cardId in gamedatas.hand) {
      const cardEl = this.createCardElement(
        cardId,
        gamedatas.hand[cardId]!.type_arg
      );
      hand.appendChild(cardEl);
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
    console.log('Entering state: ' + stateName, state);

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

  canConnectAstronauts(playerId: string, args: Record<string, any>) {
    console.log('canConnectAstronauts', playerId, args);
    return args['_private'].length > 0;
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
          }
        );
        if (!this.canConnectAstronauts(this.player_id?.toString()!, args)) {
          console.log('disabling connect astronauts button', this.player_id);
          document
            .getElementById('connect-astronauts-button')
            ?.classList.add('disabled');
        }

        this.addActionButton(
          'set-adrift-button',
          _('Set Astronauts Adrift'),
          (e) => {
            this.handleChooseSetAdriftAction(e);
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
          () => {
            this.performAdriftAction('deck', 'deck');
          }
        );
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
    }
  }

  ///////////////////////////////////////////////////
  //// Utility methods

  ///////////////////////////////////////////////////
  //// Player's action

  // #region Shared methods
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

  clearEventListeners() {
    for (const handler of this.eventHandlers) {
      handler.element.removeEventListener(handler.event, handler.handler);
    }
  }
  // #endregion

  // #region Set Adrift Action methods
  cancelSetAdriftAction() {
    this.clearSelectedCards();
    this.clearSelectableCards();
    this.cardSetAdrift = null;
    this.restoreServerGameState();
  }

  /**
   * Handles the click event for the "Set astronaut adrift" action button.
   */
  handleChooseSetAdriftAction(e: Event) {
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

    const handler = (e: Event) => this.handleChooseCardFromHandSetAdrift(e);
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
  }

  /**
   * Handles the selection of a card to set adrift from hand.
   */
  handleChooseCardFromHandSetAdrift(e: Event) {
    if (!(e.target instanceof HTMLElement)) {
      throw new Error(
        "onSetAdriftHandClick called when it shouldn't have been"
      );
    }
    e.target.classList.add('card--selected');

    this.cardSetAdrift = {
      id: e.target.dataset['cardId']!,
      number: e.target.dataset['cardNumber']!,
    };
    this.clearSelectableCards();

    this.setClientState('client_setAdriftChooseDraw', {
      // @ts-expect-error
      descriptionmyturn: _(
        '${you} must choose to take an astronaut from the adrift zone or draw from the deck.'
      ),
    });

    const deck = document.querySelector('.js-deck');
    const drawFromDeckHandler = () => this.performAdriftAction('deck', 'deck');
    if (deck instanceof HTMLElement) {
      deck.classList.add('card--selectable');
      deck.addEventListener('click', drawFromDeckHandler);
      this.eventHandlers.push({
        element: deck,
        event: 'click',
        handler: drawFromDeckHandler,
      });
    }

    const adriftCards = document.querySelectorAll('.js-adrift');
    const drawFromAdriftHandler = (e: Event) =>
      this.handleChooseCardToDrawFromAdrift(e);
    adriftCards.forEach((card) => {
      if (card instanceof HTMLElement) {
        card.classList.add('card--selectable');
        card.addEventListener('click', drawFromAdriftHandler);
        this.eventHandlers.push({
          element: card,
          event: 'click',
          handler: drawFromAdriftHandler,
        });
      }
    });
  }

  /**
   * Handles clicking a card to draw from the adrift zone.
   */
  async handleChooseCardToDrawFromAdrift(e: Event) {
    if (!(e.target instanceof HTMLElement)) {
      throw new Error("onAdriftCardClick called when it shouldn't have been");
    }
    e.preventDefault();
    e.stopPropagation();

    if (
      !e.target.dataset['cardId'] ||
      !e.target.dataset['cardNumber'] ||
      !this.cardSetAdrift
    ) {
      throw new Error('id of card to draw or cardSetAdrift not set properly');
    }
    this.performAdriftAction(
      e.target.dataset['cardId'],
      e.target.dataset['cardNumber']
    );
  }

  /**
   * Sends the actSetAdrift action to the server after cleaning up the UI styling
   * and event listeners.
   */
  async performAdriftAction(cardDrawnId: string, cardDrawnNum: string) {
    if (!this.cardSetAdrift) {
      throw new Error('performAdriftAction is missing required information');
    }

    try {
      this.clearSelectableCards();
      this.clearSelectedCards();
      this.clearEventListeners();
      await this.bgaPerformAction('actSetAdrift', {
        cardDrawnId,
        cardDrawnNum,
        cardSetAdriftId: this.cardSetAdrift.id,
        cardSetAdriftNum: this.cardSetAdrift.number,
      });
      this.cardSetAdrift = null;
    } catch (e) {
      this.restoreServerGameState();
      console.log('error while trying to perform actSetAdrift', e);
    }
  }
  // #endregion

  ///////////////////////////////////////////////////
  //// Reaction to cometD notifications

  /** See {@link BGA.Gamegui#setupNotifications} for more information. */
  override setupNotifications = () => {
    console.log('notifications subscriptions setup');

    // TODO: here, associate your game notifications with local methods

    // Builtin example...
    dojo.subscribe('cardSetAdrift', this, 'notif_cardSetAdrift');
    this.notifqueue.setSynchronous('cardSetAdrift', 500);

    dojo.subscribe('drawFromDeck', this, 'notif_drawFromDeck');
    this.notifqueue.setSynchronous('drawFromDeck', 500);

    dojo.subscribe('drawFromAdrift', this, 'notif_drawFromAdrift');
    this.notifqueue.setSynchronous('drawFromAdrift', 500);

    dojo.subscribe('drawOtherPlayer', this, 'notif_drawOtherPlayer');
    this.notifqueue.setIgnoreNotificationCheck(
      'drawOtherPlayer',
      (notif) => notif.args.player_id === this.player_id
    );
    this.notifqueue.setSynchronous('drawOtherPlayer', 500);

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

  notif_cardSetAdrift(notif: BGA.Notif<'cardSetAdrift'>) {
    const {
      card_id: cardId,
      card_num: cardNum,
      player_id: playerId,
    } = notif.args;

    const cardEl = this.createAdriftCardElement(cardId, cardNum);
    const adriftZone = document.getElementById('adrift-zone');
    if (!adriftZone) {
      throw new Error('adrift-zone not found');
    }
    adriftZone.appendChild(cardEl);

    if (playerId !== this.player_id) {
      return;
    }
    const hand = document.getElementById('hand');
    if (!hand) {
      throw new Error('hand not found');
    }
    const cardSetAdrift = hand.querySelector(`[data-card-id="${cardId}"]`);
    if (!cardSetAdrift) {
      throw new Error('cardSetAdrift not found');
    }
    hand.removeChild(cardSetAdrift);
  }

  notif_drawFromDeck(notif: BGA.Notif<'drawFromDeck'>) {
    console.log('notif_drawFromDeck', notif);

    const cardEl = this.createCardElement(
      notif.args.card_id,
      notif.args.card_num
    );
    const hand = document.getElementById('hand');
    if (!hand) {
      throw new Error('hand not found');
    }
    hand.appendChild(cardEl);
  }

  notif_drawOtherPlayer(notif: BGA.Notif<'drawOtherPlayer'>) {
    console.log('this one is just going to increase the card hand count');
  }

  notif_drawFromAdrift(notif: BGA.Notif<'drawFromAdrift'>) {
    const adriftZone = document.getElementById('adrift-zone');
    if (!adriftZone) {
      throw new Error('adrift-zone not found');
    }
    const cardToRemove = adriftZone.querySelector(
      `[data-card-id="${notif.args.card_id}"]`
    );
    if (!cardToRemove) {
      throw new Error('card to remove not found');
    }
    adriftZone.removeChild(cardToRemove);

    if (notif.args.player_id !== this.player_id) {
      return;
    }
    const cardEl = this.createCardElement(
      notif.args.card_id,
      notif.args.card_num
    );
    const hand = document.getElementById('hand');
    if (!hand) {
      throw new Error('hand not found');
    }
    hand.appendChild(cardEl);
  }
}

// The global 'bgagame.tethergame' class is instantiated when the page is loaded and used as the Gamegui.
window.bgagame = { tethergame: TetherGame };
