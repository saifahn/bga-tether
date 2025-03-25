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
import { BoardUI, generateGroupUI, Group, GroupUI } from './generateBoard';

interface PlayedCard {
  status: 'played';
  id: string;
  number: string; // this is the lower number of the card, not necessarily what it was played as
  flipped: boolean;
}

/** See {@link BGA.Gamegui} for more information. */
class TetherGame extends Gamegui {
  eventHandlers: {
    element: HTMLElement;
    event: string;
    handler: EventListener;
  }[] = [];

  status:
    | 'choosingAction'
    | 'connectingAstronautsInitial'
    | 'connectingAstronautsNext' = 'choosingAction';

  cardSetAdrift: {
    id: string;
    number: string;
  } | null = null;

  cardForConnecting:
    | {
        status: 'choosingFromHand';
        id: string;
        number: string;
        numReversed: string;
      }
    | PlayedCard
    | null = null;

  currentGroup = 0;

  board: BoardUI = {};

  boardState: BGA.Gamedatas['board'] = {};

  playerDirection: 'horizontal' | 'vertical' | null = null;

  playableCardNumbers: string[] = [];

  /** See {@link BGA.Gamegui} for more information. */
  constructor() {
    super();
    console.log('tethergame constructor');
  }

  createCardElement({
    id,
    number,
    flipped,
  }: {
    id: string;
    number: string;
    flipped: boolean;
  }) {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.dataset['cardId'] = id;
    cardElement.dataset['cardNumber'] = number;
    cardElement.dataset['cardNumReversed'] = number
      .split('')
      .reverse()
      .join('');
    cardElement.id = `card-${number}`;
    if (flipped) {
      cardElement.classList.add('card--flipped');
    }
    return cardElement;
  }

  createAdriftCardElement(id: string, number: string) {
    const cardElement = this.createCardElement({ id, number, flipped: false });
    cardElement.classList.add('card--adrift');
    cardElement.classList.add('js-adrift');
    return cardElement;
  }

  // TODO: this redraw function needs to handle animations in the future?
  updateBoardUI() {
    const groupsArea = document.getElementById('groups');
    if (!groupsArea) {
      throw new Error('groups not found');
    }
    groupsArea.innerHTML = '';

    let groups: Record<string, GroupUI> = {};
    for (const group in this.boardState) {
      const generatedGroup = generateGroupUI(this.boardState[group]!);
      groups[group] = generatedGroup;

      const groupEl = document.createElement('div');
      groupEl.classList.add('group');

      console.log(generatedGroup);

      for (const row of generatedGroup) {
        for (const card of row) {
          if (card) {
            const flipped = card.uprightFor !== this.playerDirection;
            const cardEl = this.createCardElement({
              id: card.id,
              number: card.number,
              flipped,
            });
            groupEl.appendChild(cardEl);
          }
        }
      }
      groupsArea.appendChild(groupEl);
    }
    this.board = groups;
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

    const groupsArea = document.createElement('div');
    groupsArea.id = 'groups';
    groupsArea.classList.add('groups');
    gamePlayArea.appendChild(groupsArea);

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
      const cardEl = this.createCardElement({
        id: cardId,
        number: gamedatas.hand[cardId]!.type_arg,
        flipped: false,
      });
      hand.appendChild(cardEl);
    }

    if (!this.player_id) {
      throw new Error('player_id not found');
    }
    this.playerDirection =
      // TODO: figure out a way to extend this type definition or return it under
      // a different gamedatas key
      // @ts-expect-error
      gamedatas.players[this.player_id]?.turn_order === '1'
        ? 'vertical'
        : 'horizontal';

    this.boardState = gamedatas.board;
    this.updateBoardUI();

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
      case 'playerTurn':
        this.playableCardNumbers = (state.args['_private'] as string[]) || [];
        break;
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
        this.playableCardNumbers = (args['_private'] as string[]) || [];
        this.addActionButton(
          'connect-astronauts-button',
          _('Connect Astronauts'),
          () => {
            this.highlightPlayableAstronauts('initial');
          }
        );
        if (this.playableCardNumbers.length === 0) {
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
      // @ts-expect-error
      case 'client_connectAstronautInitial':
        this.addActionButton(
          'cancel-button',
          _('Restart turn'),
          () => {
            this.cancelConnectAstronautsAction();
          },
          undefined,
          false,
          'red'
        );
        break;
      // @ts-expect-error
      case 'client_chooseCardSideToPlay':
        if (this.cardForConnecting?.status !== 'choosingFromHand') {
          throw new Error(
            'cardForConnecting not in correct state for this call'
          );
        }
        const num = this.cardForConnecting?.number;
        this.addActionButton(
          'play-upright-button',
          _(`Play card as ${num}`),
          () => {
            this.handleChooseCardToPlay({
              first: this.status === 'connectingAstronautsInitial',
              flipped: false,
            });
          }
        );
        const isNumPlayable = this.numberIsPlayable(num);
        if (!isNumPlayable) {
          document
            .getElementById('play-upright-button')
            ?.classList.add('disabled');
        }

        const flippedNum = this.cardForConnecting?.numReversed;
        this.addActionButton(
          'play-flipped-button',
          _(`Play card as ${flippedNum}`),
          () => {
            this.handleChooseCardToPlay({
              first: this.status === 'connectingAstronautsInitial',
              flipped: true,
            });
          }
        );
        const isFlippedNumPlayable = this.numberIsPlayable(flippedNum);
        if (!isFlippedNumPlayable) {
          document
            .getElementById('play-flipped-button')
            ?.classList.add('disabled');
        }
        this.addActionButton(
          'cancel-button',
          _('Restart turn'),
          () => {
            this.cancelConnectAstronautsAction();
          },
          undefined,
          false,
          'red'
        );
        break;
      // @ts-expect-error
      case 'client_connectAstronautChooseNextCard':
        this.addActionButton(
          'finish-connecting-button',
          _('Finish connecting astronauts'),
          () => {
            this.finishConnectingAstronauts();
          }
        );
        this.addActionButton(
          'cancel-button',
          _('Restart turn'),
          () => {
            this.cancelConnectAstronautsAction();
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
    this.clearEventListeners();
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
    this.clearEventListeners();

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

  // #region Connect Astronauts Action methods
  cancelConnectAstronautsAction() {
    this.clearSelectedCards();
    this.clearSelectableCards();
    this.clearEventListeners();
    this.restoreServerGameState();
    this.status = 'choosingAction';
  }

  cardIsPlayable(card: HTMLElement) {
    return (
      this.numberIsPlayable(card.dataset['cardNumber']) ||
      this.numberIsPlayable(card.dataset['cardNumReversed'])
    );
  }

  numberIsPlayable(number: string | undefined) {
    return (
      typeof number === 'string' && this.playableCardNumbers.includes(number)
    );
  }

  /**
   * Called for each time the playable astronauts need to be highlighted during
   * the connect astronauts action.
   */
  highlightPlayableAstronauts(call: 'initial' | 'further' = 'further') {
    if (call === 'initial') {
      this.status = 'connectingAstronautsInitial';
      this.setClientState('client_connectAstronautInitial', {
        // @ts-expect-error
        descriptionmyturn: _(
          '${you} must select an astronaut from your hand to begin connecting.'
        ),
      });
    } else {
      this.status = 'connectingAstronautsNext';
      this.setClientState('client_connectAstronautChooseNextCard', {
        // @ts-expect-error
        descriptionmyturn: _(
          'Select an astronaut from your hand or the adrift zone to continue connecting.'
        ),
      });
    }

    // enable the right buttons
    const handler = (e: Event) => this.handleChooseCardFromHandConnect(e);
    this.getCardElementsFromHand().forEach((card) => {
      if (card instanceof HTMLElement) {
        if (this.cardIsPlayable(card)) {
          card.classList.add('card--selectable');
          card.addEventListener('click', handler);
          this.eventHandlers.push({
            element: card,
            event: 'click',
            handler,
          });
        }
      }
    });
  }

  handleChooseCardFromHandConnect(e: Event) {
    if (!(e.target instanceof HTMLElement)) {
      throw new Error(
        "handleChooseCardFromHandConnect called when it shouldn't have been"
      );
    }
    this.clearSelectableCards();
    this.clearEventListeners();
    e.target.classList.add('card--selected');

    this.cardForConnecting = {
      status: 'choosingFromHand',
      id: e.target.dataset['cardId']!,
      number: e.target.dataset['cardNumber']!,
      numReversed: e.target.dataset['cardNumReversed']!,
    };
    this.setClientState('client_chooseCardSideToPlay', {
      // @ts-expect-error
      descriptionmyturn: _(
        '${you} must choose which side of the card to play.'
      ),
    });
  }

  /**
   * utility function to create a group representation from a card
   */
  createGroupFromCard(card: PlayedCard): Group {
    const uprightVertically =
      this.playerDirection === 'vertical' && card.flipped;

    return {
      vertical: {
        [card.number]: {
          id: card.id,
          number: card.number,
          upright: uprightVertically,
        },
      },
      horizontal: {
        [card.number]: {
          id: card.id,
          number: card.number,
          upright: !uprightVertically,
        },
      },
    };
  }

  handleChooseCardToPlay(
    { first, flipped } = { first: false, flipped: false }
  ) {
    if (!this.cardForConnecting) {
      throw new Error('cardForConnecting not set');
    }
    if (this.cardForConnecting.status !== 'choosingFromHand') {
      throw new Error('cardForConnecting not in correct state for this call');
    }
    this.cardForConnecting = {
      status: 'played',
      id: this.cardForConnecting.id,
      number: this.cardForConnecting.number,
      flipped,
    };

    if (first) {
      if (!this.boardState) {
        this.boardState = {};
      }
      const existingGroupsLen = Object.keys(this.boardState).length;
      this.currentGroup = existingGroupsLen + 1;
      this.boardState[this.currentGroup] = this.createGroupFromCard(
        this.cardForConnecting
      );
      this.updateBoardUI();
    } else {
      const group = this.boardState[this.currentGroup];
      if (!group) {
        throw new Error('current group not found');
      }

      const card = this.cardForConnecting;
      const uprightVertically =
        this.playerDirection === 'vertical' && card.flipped;
      group.vertical[card.number] = {
        id: card.id,
        number: card.number,
        upright: uprightVertically,
      };
      group.horizontal[card.number] = {
        id: card.id,
        number: card.number,
        upright: !uprightVertically,
      };
      this.updateBoardUI();
    }

    // TODO: this should be part of the board state? cards in hand
    // move the card from hand to a new group
    const hand = document.getElementById('hand');
    if (!hand) {
      throw new Error('hand not found');
    }
    const cardToRemove = hand.querySelector(
      `[data-card-id="${this.cardForConnecting.id}"]`
    );
    if (!cardToRemove) {
      throw new Error('card to remove not found');
    }
    hand.removeChild(cardToRemove);

    this.highlightPlayableAstronauts();
  }

  getGroupsOfCardIDsFromBoardState() {
    const groups: Record<string, string[]> = {};
    for (const groupNum in this.boardState) {
      const group = this.boardState[groupNum];
      if (!group) break;
      const vertical = Object.values(group.vertical);
      groups[groupNum] = vertical.map((card) => card.id);
    }
    return groups;
  }

  finishConnectingAstronauts() {
    this.bgaPerformAction('actConnectAstronauts', {
      boardStateJSON: JSON.stringify(this.getGroupsOfCardIDsFromBoardState()),
    });
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

    const cardEl = this.createCardElement({
      id: notif.args.card_id,
      number: notif.args.card_num,
      flipped: false,
    });
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
    const cardEl = this.createCardElement({
      id: notif.args.card_id,
      number: notif.args.card_num,
      flipped: false,
    });
    const hand = document.getElementById('hand');
    if (!hand) {
      throw new Error('hand not found');
    }
    hand.appendChild(cardEl);
  }
}

// The global 'bgagame.tethergame' class is instantiated when the page is loaded and used as the Gamegui.
window.bgagame = { tethergame: TetherGame };
