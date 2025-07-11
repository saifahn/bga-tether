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
import { Group, connectCardToGroup } from './connectCardToGroup';
import { generateGroupUI } from './generateGroupUI';
import { getConnectingNumbers } from './getConnectingNumbers';
import { connectGroups } from './connectGroups';
import { getConnection } from './getConnection';
import { clone } from 'dojo';

interface PlayedCard {
  id: string;
  number: string; // this is the lower number of the card, not necessarily what it was played as
  flipped: boolean;
}

interface GameState {
  adrift: BGA.Gamedatas['adrift'];
  board: BGA.Gamedatas['board'];
  hand: BGA.Gamedatas['hand'];
}

type ClientState =
  | {
      status:
        | 'choosingAction'
        | 'connectingAstronautsNext'
        | 'connectingAstronautsInitial';
    }
  | {
      status: 'settingAdrift';
      card: {
        id: string;
        number: string;
      };
    }
  | {
      status: 'choosingCardSideToPlay';
      card: {
        first: boolean;
        from: 'hand' | 'adrift';
        id: string;
        number: string;
        numReversed: string;
      };
    };

/** See {@link BGA.Gamegui} for more information. */
class TetherGame extends Gamegui {
  eventHandlers: {
    element: HTMLElement;
    event: string;
    handler: EventListener;
  }[] = [];

  clientState: ClientState = {
    status: 'choosingAction',
  };

  currentGroup = '';

  gameStateTurnStart: GameState = {
    adrift: {},
    board: {},
    hand: {},
  };

  gameStateCurrent: GameState = {
    adrift: {},
    board: {},
    hand: {},
  };

  playerDirection: 'horizontal' | 'vertical' | null = null;

  cardMap: Record<string, string> = {};

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

  updateBoardUI() {
    const adriftZone = document.getElementById('adrift-zone');
    if (!adriftZone) {
      throw new Error('adrift-zone not found');
    }
    adriftZone.innerHTML = '';

    const deckStack = document.createElement('li');
    deckStack.classList.add('deck-stack');
    const deckTopCard = document.createElement('ul');
    deckTopCard.id = 'deck';
    deckTopCard.classList.add('deck-card');
    deckTopCard.classList.add('deck-card--top');
    deckTopCard.classList.add('js-deck');
    deckStack.appendChild(deckTopCard);
    adriftZone.appendChild(deckStack);

    for (let i = 0; i < 3; i++) {
      const nextCard = document.createElement('ul');
      nextCard.classList.add('deck-card');
      deckStack.appendChild(nextCard);
    }

    for (const cardId in this.gameStateCurrent.adrift) {
      const cardEl = this.createAdriftCardElement(
        cardId,
        this.gameStateCurrent.adrift[cardId]!.cardNum
      );
      adriftZone.appendChild(cardEl);
    }

    const hand = document.getElementById('hand');
    if (!hand) {
      throw new Error('hand not found');
    }
    hand.innerHTML = '';
    for (const cardId in this.gameStateCurrent.hand) {
      const cardEl = this.createCardElement({
        id: cardId,
        number: this.gameStateCurrent.hand[cardId]!.type_arg,
        flipped: false,
      });
      hand.appendChild(cardEl);
    }

    const groupsArea = document.getElementById('groups');
    if (!groupsArea) {
      throw new Error('groups not found');
    }
    groupsArea.innerHTML = '';

    for (const group in this.gameStateCurrent.board) {
      const generatedGroup = generateGroupUI(
        this.gameStateCurrent.board[group]!
      );

      const groupEl = document.createElement('div');
      groupEl.classList.add('group');
      if (this.playerDirection === 'horizontal') {
        groupEl.classList.add('group--flipped');
      }

      for (const [x, col] of generatedGroup.entries()) {
        const columnEl = document.createElement('div');
        columnEl.classList.add('column');

        for (const [y, card] of col.entries()) {
          if (card) {
            const cardEl = this.createCardElement({
              id: card.id,
              number: card.lowNum,
              flipped: !card.lowUprightForV,
            });
            cardEl.dataset['x'] = x.toString();
            cardEl.dataset['y'] = y.toString();
            cardEl.dataset['groupNum'] = group;
            cardEl.dataset['uprightFor'] = card.lowUprightForV
              ? 'vertical'
              : 'horizontal';
            cardEl.classList.add('js-group-card');
            columnEl.appendChild(cardEl);
            continue;
          }
          // create a blank card to take up the same space for null
          const blankCard = document.createElement('div');
          blankCard.classList.add('card');
          blankCard.classList.add('card--blank');
          columnEl.appendChild(blankCard);
        }
        groupEl.appendChild(columnEl);
      }
      groupsArea.appendChild(groupEl);
    }
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

    const groupsArea = document.createElement('div');
    groupsArea.id = 'groups';
    groupsArea.classList.add('groups');
    gamePlayArea.appendChild(groupsArea);

    const hand = document.createElement('div');
    hand.id = 'hand';
    gamePlayArea.appendChild(hand);

    if (!this.player_id) {
      throw new Error('player_id not found');
    }
    this.playerDirection =
      // TODO: figure out a way to extend this type definition or return it under
      // a different gamedatas key
      // @ts-expect-error
      gamedatas.players[this.player_id]?.turnOrder === '1'
        ? 'vertical'
        : 'horizontal';

    this.gameStateTurnStart.adrift = gamedatas.adrift;
    // it's only an array if it is empty
    this.gameStateTurnStart.board = Array.isArray(gamedatas.board)
      ? {}
      : gamedatas.board;
    this.gameStateTurnStart.hand = gamedatas.hand;
    this.gameStateCurrent = clone(this.gameStateTurnStart);

    console.log('player direction', this.playerDirection);

    this.generateCardMap();
    this.setInitialPlayableCards();

    this.updateBoardUI();

    // Setup game notifications to handle (see "setupNotifications" method below)
    this.setupNotifications();

    console.log('Ending game setup');
  }

  ///////////////////////////////////////////////////
  //// Game & client states

  generateCardMap() {
    this.cardMap = {};
    for (const cardId in this.gameStateTurnStart.hand) {
      const lowNum = this.gameStateTurnStart.hand[cardId]!.type_arg;
      this.cardMap[lowNum] = cardId;
      const numReversed = lowNum.split('').reverse().join('');
      this.cardMap[numReversed] = cardId;
    }
    for (const cardId in this.gameStateTurnStart.adrift) {
      const lowNum = this.gameStateTurnStart.adrift[cardId]!.cardNum;
      this.cardMap[lowNum] = cardId;
      const numReversed = lowNum.split('').reverse().join('');
      this.cardMap[numReversed] = cardId;
    }
    for (const group of Object.values(this.gameStateTurnStart.board)) {
      for (const column of Object.values(group.cards)) {
        for (const card of column) {
          if (card === null) {
            continue;
          }
          const uprightNum =
            card.uprightFor === this.playerDirection
              ? card.lowNum
              : card.lowNum.split('').toReversed().join('');
          this.cardMap[uprightNum] = card.id;
        }
      }
    }
  }

  /** See {@link BGA.Gamegui#onEnteringState} for more information. */
  override onEnteringState(
    ...[stateName, state]: BGA.GameStateTuple<['name', 'state']>
  ): void {
    console.log('Entering state: ' + stateName, state);

    switch (stateName) {
      case 'playerTurn':
        this.clientState = { status: 'choosingAction' };
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

  setInitialPlayableCards() {
    const playableCardNums = [];

    for (const cardId in this.gameStateTurnStart.hand) {
      const lowNum = this.gameStateTurnStart.hand[cardId]!.type_arg;
      for (const possibleConnectNum of getConnectingNumbers(lowNum)) {
        if (this.cardMap[possibleConnectNum]) {
          playableCardNums.push(lowNum);
          break;
        }
      }
      const numReversed = lowNum.split('').reverse().join('');
      for (const possibleConnectNum of getConnectingNumbers(numReversed)) {
        if (this.cardMap[possibleConnectNum]) {
          playableCardNums.push(numReversed);
          break;
        }
      }
    }
    this.playableCardNumbers = playableCardNums;
  }

  // checks that current group has at least two cards in it
  isCurrentGroupValid() {
    const currentGroup = this.gameStateCurrent.board[this.currentGroup];
    if (!currentGroup) return false;
    return (
      Object.keys(currentGroup.cards).length > 1 ||
      currentGroup.cards[0]!.length > 1
    );
  }

  /** See {@link BGA.Gamegui#onUpdateActionButtons} for more information. */
  override onUpdateActionButtons(
    ...[stateName, args]: BGA.GameStateTuple<['name', 'args']>
  ): void {
    console.log('onUpdateActionButtons: ' + stateName, args);

    if (!this.isCurrentPlayerActive()) return;

    switch (stateName) {
      case 'playerTurn':
        this.addActionButton(
          'connect-astronauts-button',
          _('Connect Astronauts'),
          () => {
            this.highlightPlayableAstronauts();
          }
        );
        // this must be present to account for the case of re/loading the page
        // and notif_updateGameState will not be called again until the next turn
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
        if (this.clientState.status !== 'choosingCardSideToPlay') {
          throw new Error(
            'cardForConnecting not in correct state for this call'
          );
        }
        const { first, number, numReversed } = this.clientState.card;
        this.addActionButton(
          'play-upright-button',
          _(`Play card as ${number}`),
          () => {
            this.handleChooseCardToPlay({
              first,
              flipped: false,
            });
          }
        );
        const isNumPlayable = this.isNumPlayable(number);
        if (!isNumPlayable) {
          document
            .getElementById('play-upright-button')
            ?.classList.add('disabled');
        }

        this.addActionButton(
          'play-flipped-button',
          _(`Play card as ${numReversed}`),
          () => {
            this.handleChooseCardToPlay({
              first,
              flipped: true,
            });
          }
        );
        const isFlippedNumPlayable = this.isNumPlayable(numReversed);
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
        if (!this.isCurrentGroupValid()) {
          document
            .getElementById('finish-connecting-button')
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
    this.clientState = {
      status: 'choosingAction',
    };
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

    this.clientState = {
      status: 'settingAdrift',
      card: {
        id: e.target.dataset['cardId']!,
        number: e.target.dataset['cardNumber']!,
      },
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
      this.clientState.status !== 'settingAdrift'
    ) {
      throw new Error('id of card to draw or adrift status not set properly');
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
    if (this.clientState.status !== 'settingAdrift') {
      throw new Error('performAdriftAction called in the wrong state');
    }

    try {
      this.clearSelectableCards();
      this.clearSelectedCards();
      this.clearEventListeners();
      await this.bgaPerformAction('actSetAdrift', {
        cardDrawnId,
        cardDrawnNum,
        cardSetAdriftId: this.clientState.card.id,
        cardSetAdriftNum: this.clientState.card.number,
      });
    } catch (e) {
      this.restoreServerGameState();
      console.log('error while trying to perform actSetAdrift', e);
    }
  }
  // #endregion

  restoreUIToTurnStart() {
    this.gameStateCurrent = clone(this.gameStateTurnStart);
    this.updateBoardUI();
  }

  // #region Connect Astronauts Action methods
  cancelConnectAstronautsAction() {
    this.clearSelectedCards();
    this.clearSelectableCards();
    this.clearEventListeners();
    this.restoreServerGameState();
    this.clientState = {
      status: 'choosingAction',
    };
    this.setInitialPlayableCards();
    this.restoreUIToTurnStart();
  }

  isCardPlayable(card: HTMLElement) {
    return (
      this.isNumPlayable(card.dataset['cardNumber']) ||
      this.isNumPlayable(card.dataset['cardNumReversed'])
    );
  }

  isNumPlayable(number: string | undefined) {
    return (
      typeof number === 'string' && this.playableCardNumbers.includes(number)
    );
  }

  /**
   * Called for each time the playable astronauts need to be highlighted during
   * the connect astronauts action.
   */
  highlightPlayableAstronauts() {
    const handler = (e: Event) => this.handleChooseCardFromHandConnect(e);
    this.getCardElementsFromHand().forEach((card) => {
      if (card instanceof HTMLElement) {
        if (this.isCardPlayable(card)) {
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

    if (this.clientState.status === 'choosingAction') {
      this.clientState = { status: 'connectingAstronautsInitial' };
      this.setClientState('client_connectAstronautInitial', {
        // @ts-expect-error
        descriptionmyturn: _(
          '${you} must select an astronaut from your hand to begin connecting.'
        ),
      });
      return;
    } else {
      this.clientState = { status: 'connectingAstronautsNext' };
      this.setClientState('client_connectAstronautChooseNextCard', {
        // @ts-expect-error
        descriptionmyturn: _(
          'Select an astronaut from your hand or the adrift zone to continue connecting.'
        ),
      });
    }

    const adriftCards = document.querySelectorAll('.js-adrift');
    const connectFromAdriftHandler = (e: Event) =>
      this.handleChooseCardFromAdriftConnect(e);
    adriftCards.forEach((card) => {
      if (card instanceof HTMLElement) {
        if (this.isCardPlayable(card)) {
          card.classList.add('card--selectable');
          card.addEventListener('click', connectFromAdriftHandler);
          this.eventHandlers.push({
            element: card,
            event: 'click',
            handler: connectFromAdriftHandler,
          });
        }
      }
    });

    const groupCards = document.querySelectorAll('.js-group-card');
    const connectGroupHandler = (e: Event) => this.handleConnectGroup(e);
    groupCards.forEach((card) => {
      if (card instanceof HTMLElement) {
        const isCurrentGroup = card.dataset['groupNum']! === this.currentGroup;
        if (!isCurrentGroup && this.isCardPlayable(card)) {
          card.classList.add('card--selectable');
          card.addEventListener('click', connectGroupHandler);
          this.eventHandlers.push({
            element: card,
            event: 'click',
            handler: connectGroupHandler,
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

    const firstCardPlayed =
      this.clientState.status === 'connectingAstronautsInitial';

    this.clientState = {
      status: 'choosingCardSideToPlay',
      card: {
        first: firstCardPlayed,
        from: 'hand',
        id: e.target.dataset['cardId']!,
        number: e.target.dataset['cardNumber']!,
        numReversed: e.target.dataset['cardNumReversed']!,
      },
    };
    this.setClientState('client_chooseCardSideToPlay', {
      // @ts-expect-error
      descriptionmyturn: _(
        '${you} must choose which side of the card to play.'
      ),
    });
  }

  handleChooseCardFromAdriftConnect(e: Event) {
    if (!(e.target instanceof HTMLElement)) {
      throw new Error(
        "handleChooseCardFromAdriftConnect called when it shouldn't have been"
      );
    }
    this.clearSelectableCards();
    this.clearEventListeners();
    e.target.classList.add('card--selected');

    this.clientState = {
      status: 'choosingCardSideToPlay',
      card: {
        first: false,
        from: 'adrift',
        id: e.target.dataset['cardId']!,
        number: e.target.dataset['cardNumber']!,
        numReversed: e.target.dataset['cardNumReversed']!,
      },
    };
    this.setClientState('client_chooseCardSideToPlay', {
      // @ts-expect-error
      descriptionmyturn: _(
        '${you} must choose which side of the card to play.'
      ),
    });
  }

  handleConnectGroup(e: Event) {
    if (!(e.target instanceof HTMLElement)) {
      throw new Error(
        "handleChooseCardFromAdriftConnect called when it shouldn't have been"
      );
    }
    const groupToConnect = e.target.dataset['groupNum'];
    const x = e.target.dataset['x'];
    const y = e.target.dataset['y'];

    if (!groupToConnect || !x || !y) {
      throw new Error(
        "handleConnectGroup couldn't get the right data from the card"
      );
    }

    const cardToConnect = {
      id: e.target.dataset['cardId']!,
      lowNum: e.target.dataset['cardNumber']!,
      uprightFor: e.target.dataset['uprightFor'] as 'vertical' | 'horizontal',
    };
    // find connection point between current group and selected group
    const currentGroupConnectionPoint = getConnection(
      cardToConnect,
      this.gameStateCurrent.board[this.currentGroup]!,
      this.playerDirection!
    );

    const combinedGroup = connectGroups({
      group1: {
        group: this.gameStateCurrent.board[this.currentGroup]!,
        connection: currentGroupConnectionPoint,
      },
      group2: {
        group: this.gameStateCurrent.board[groupToConnect]!,
        connection: {
          card: cardToConnect,
          x: parseInt(x, 10),
          y: parseInt(y, 10),
        },
      },
      orientation: this.playerDirection!,
    });

    const toDeleteGroupId =
      combinedGroup.id === groupToConnect ? this.currentGroup : groupToConnect;
    // the higher group is now combined into the lower group, so we can get rid of the existing group
    delete this.gameStateCurrent.board[toDeleteGroupId];
    this.gameStateCurrent.board[combinedGroup.id] = combinedGroup;
    this.currentGroup = combinedGroup.id;

    this.clearSelectableCards();
    this.clearEventListeners();
    this.updateBoardUI();
    this.updatePlayableCards();
    this.highlightPlayableAstronauts();
  }

  /**
   * utility function to create a group representation from a card
   */
  createGroupFromCard(card: PlayedCard, id: string): Group {
    const otherDirection =
      this.playerDirection === 'vertical' ? 'horizontal' : 'vertical';
    const uprightFor = card.flipped ? otherDirection : this.playerDirection!;

    return {
      id,
      cards: {
        0: [{ id: card.id, lowNum: card.number, uprightFor }],
      },
    };
  }

  updatePlayableCards() {
    // iterate over the cards in our current group
    const currentGroup = this.gameStateCurrent.board[this.currentGroup];
    if (!currentGroup) {
      throw new Error(
        'there was no current group found in updatePlayableCards'
      );
    }
    const playableNumbers = [];
    for (const col in currentGroup.cards) {
      for (const card of currentGroup.cards[col]!) {
        if (!card) continue;
        const uprightNum =
          card.uprightFor === this.playerDirection
            ? card.lowNum
            : card.lowNum.split('').toReversed().join('');

        for (const possibleConnectNum of getConnectingNumbers(uprightNum)) {
          if (this.cardMap[possibleConnectNum]) {
            playableNumbers.push(possibleConnectNum);
          }
        }
      }
    }
    this.playableCardNumbers = playableNumbers;
  }

  handleChooseCardToPlay(
    { first, flipped } = { first: false, flipped: false }
  ) {
    if (this.clientState.status !== 'choosingCardSideToPlay') {
      throw new Error('handleChooseCardToPlay was called in the wrong state');
    }
    const { from, id, number } = this.clientState.card;
    // remove the card from adrift or hand, depending where it is played from
    delete this.gameStateCurrent[from][id];

    const card = { id, number, flipped };

    if (first) {
      const newGroupId = crypto.randomUUID().substring(0, 6);
      this.currentGroup = newGroupId;
      this.gameStateCurrent.board[this.currentGroup] = this.createGroupFromCard(
        card,
        newGroupId
      );
      this.updateBoardUI();
    } else {
      // connect card to that group
      const group = this.gameStateCurrent.board[this.currentGroup];
      if (!group) {
        throw new Error('current group not found');
      }

      if (!this.playerDirection) {
        throw new Error('something is wrong, playerDirection was null');
      }

      const otherDirection =
        this.playerDirection === 'vertical' ? 'horizontal' : 'vertical';
      const uprightFor = card.flipped ? otherDirection : this.playerDirection;

      const cardToConnect = {
        id: card.id,
        lowNum: card.number,
        uprightFor,
      };

      connectCardToGroup({
        group,
        card: cardToConnect,
        connection: getConnection(cardToConnect, group, this.playerDirection),
        orientation: this.playerDirection,
      });
      this.updateBoardUI();
    }

    this.updatePlayableCards();
    this.highlightPlayableAstronauts();
  }

  finishConnectingAstronauts() {
    this.bgaPerformAction('actConnectAstronauts', {
      boardStateJSON: JSON.stringify(this.gameStateCurrent.board),
    });
    this.clearSelectableCards();
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

    dojo.subscribe('updateHScore', this, 'notif_updatePlayerScore');
    this.notifqueue.setSynchronous('updateHScore', 500);
    dojo.subscribe('updateVScore', this, 'notif_updatePlayerScore');
    this.notifqueue.setSynchronous('updateVScore', 500);

    dojo.subscribe('updateGameState', this, 'notif_updateGameState');
    this.notifqueue.setSynchronous('updateGameState', 500);

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

  notif_updateGameState(notif: BGA.Notif<'updateGameState'>) {
    console.log('notif_updateGameState is called');
    this.gameStateTurnStart.adrift = notif.args.adrift;
    this.gameStateTurnStart.board = notif.args.board;
    this.gameStateTurnStart.hand = notif.args.hand;
    this.gameStateCurrent = clone(this.gameStateTurnStart);
    // these are put here because onUpdateActionButtons is called before the
    // state is updated here and we need the new state to calculate playable cards
    this.generateCardMap();
    this.setInitialPlayableCards();
    const connectAstronautsButton = document.getElementById(
      'connect-astronauts-button'
    );
    if (this.playableCardNumbers.length === 0) {
      connectAstronautsButton?.classList.add('disabled');
    } else {
      connectAstronautsButton?.classList.remove('disabled');
    }
    this.updateBoardUI();
  }

  notif_updatePlayerScore(notif: BGA.Notif<'updatePlayerScore'>) {
    this.scoreCtrl[notif.args.player_id]?.toValue(notif.args.new_total);
  }
}

// The global 'bgagame.tethergame' class is instantiated when the page is loaded and used as the Gamegui.
window.bgagame = { tethergame: TetherGame };
