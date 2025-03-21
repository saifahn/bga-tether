var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define("bgagame/tethergame", ["require", "exports", "ebg/core/gamegui", "ebg/counter"], function (require, exports, Gamegui) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TetherGame = (function (_super) {
        __extends(TetherGame, _super);
        function TetherGame() {
            var _this = _super.call(this) || this;
            _this.eventHandlers = [];
            _this.cardSetAdrift = null;
            _this.setupNotifications = function () {
                console.log('notifications subscriptions setup');
                dojo.subscribe('cardSetAdrift', _this, 'notif_cardSetAdrift');
                _this.notifqueue.setSynchronous('cardSetAdrift', 500);
                dojo.subscribe('drawFromDeck', _this, 'notif_drawFromDeck');
                _this.notifqueue.setSynchronous('drawFromDeck', 500);
                dojo.subscribe('drawFromAdrift', _this, 'notif_drawFromAdrift');
                _this.notifqueue.setSynchronous('drawFromAdrift', 500);
                dojo.subscribe('drawOtherPlayer', _this, 'notif_drawOtherPlayer');
                _this.notifqueue.setIgnoreNotificationCheck('drawOtherPlayer', function (notif) { return notif.args.player_id === _this.player_id; });
                _this.notifqueue.setSynchronous('drawOtherPlayer', 500);
            };
            console.log('tethergame constructor');
            return _this;
        }
        TetherGame.prototype.createCardElement = function (cardId, cardNum) {
            var cardElement = document.createElement('div');
            cardElement.classList.add('card');
            cardElement.dataset['cardId'] = cardId;
            cardElement.dataset['cardNumber'] = cardNum;
            cardElement.id = "card-".concat(cardNum);
            return cardElement;
        };
        TetherGame.prototype.createAdriftCardElement = function (cardId, cardNum) {
            var cardElement = this.createCardElement(cardId, cardNum);
            cardElement.classList.add('card--adrift');
            cardElement.classList.add('js-adrift');
            return cardElement;
        };
        TetherGame.prototype.setup = function (gamedatas) {
            console.log('Starting game setup');
            var gamePlayArea = document.getElementById('game_play_area');
            if (!gamePlayArea) {
                throw new Error('game_play_area not found');
            }
            var adriftZone = document.createElement('div');
            adriftZone.id = 'adrift-zone';
            gamePlayArea.appendChild(adriftZone);
            var deck = document.createElement('div');
            deck.id = 'deck';
            deck.classList.add('deck');
            deck.classList.add('js-deck');
            adriftZone.appendChild(deck);
            var hand = document.createElement('div');
            hand.id = 'hand';
            gamePlayArea.appendChild(hand);
            for (var cardId in gamedatas.adrift) {
                var cardEl = this.createAdriftCardElement(cardId, gamedatas.adrift[cardId].cardNum);
                adriftZone.appendChild(cardEl);
            }
            for (var cardId in gamedatas.hand) {
                var cardEl = this.createCardElement(cardId, gamedatas.hand[cardId].type_arg);
                hand.appendChild(cardEl);
            }
            this.setupNotifications();
            console.log('Ending game setup');
        };
        TetherGame.prototype.onEnteringState = function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var stateName = _a[0], state = _a[1];
            console.log('Entering state: ' + stateName, state);
            switch (stateName) {
                default:
                    break;
            }
        };
        TetherGame.prototype.onLeavingState = function (stateName) {
            console.log('Leaving state: ' + stateName);
            switch (stateName) {
                default:
                    break;
            }
        };
        TetherGame.prototype.canConnectAstronauts = function (playerId, args) {
            console.log('canConnectAstronauts', playerId, args);
            return args['_private'].length > 0;
        };
        TetherGame.prototype.onUpdateActionButtons = function () {
            var _this = this;
            var _a, _b;
            var _c = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _c[_i] = arguments[_i];
            }
            var stateName = _c[0], args = _c[1];
            console.log('onUpdateActionButtons: ' + stateName, args);
            if (!this.isCurrentPlayerActive())
                return;
            switch (stateName) {
                case 'playerTurn':
                    this.addActionButton('connect-astronauts-button', _('Connect Astronauts'), function () {
                        console.log('not implemented yet');
                    });
                    if (!this.canConnectAstronauts((_a = this.player_id) === null || _a === void 0 ? void 0 : _a.toString(), args)) {
                        console.log('disabling connect astronauts button', this.player_id);
                        (_b = document
                            .getElementById('connect-astronauts-button')) === null || _b === void 0 ? void 0 : _b.classList.add('disabled');
                    }
                    this.addActionButton('set-adrift-button', _('Set Astronauts Adrift'), function (e) {
                        _this.handleChooseSetAdriftAction(e);
                    });
                    break;
                case 'client_setAdriftChooseFromHand':
                    this.addActionButton('cancel-button', _('Restart turn'), function () {
                        _this.cancelSetAdriftAction();
                    }, undefined, false, 'red');
                    break;
                case 'client_setAdriftChooseDraw':
                    this.addActionButton('draw-from-deck-button', _('Draw from deck'), function () {
                        _this.performAdriftAction('deck', 'deck');
                    });
                    this.addActionButton('cancel-button', _('Restart turn'), function () {
                        _this.cancelSetAdriftAction();
                    }, undefined, false, 'red');
                    break;
            }
        };
        TetherGame.prototype.getCardElementsFromHand = function () {
            var hand = document.getElementById('hand');
            if (!hand) {
                throw new Error('hand not found');
            }
            return hand.childNodes;
        };
        TetherGame.prototype.clearSelectedCards = function () {
            var selectedCards = document.querySelectorAll('.card--selected');
            selectedCards.forEach(function (card) {
                card.classList.remove('card--selected');
            });
        };
        TetherGame.prototype.clearSelectableCards = function () {
            var selectableCards = document.querySelectorAll('.card--selectable');
            selectableCards.forEach(function (card) {
                card.classList.remove('card--selectable');
            });
        };
        TetherGame.prototype.clearEventListeners = function () {
            for (var _i = 0, _a = this.eventHandlers; _i < _a.length; _i++) {
                var handler = _a[_i];
                handler.element.removeEventListener(handler.event, handler.handler);
            }
        };
        TetherGame.prototype.cancelSetAdriftAction = function () {
            this.clearSelectedCards();
            this.clearSelectableCards();
            this.cardSetAdrift = null;
            this.restoreServerGameState();
        };
        TetherGame.prototype.handleChooseSetAdriftAction = function (e) {
            var _this = this;
            if (!(e.target instanceof HTMLElement)) {
                throw new Error("onSetAdriftClick called when it shouldn't have been");
            }
            e.preventDefault();
            e.stopPropagation();
            this.setClientState('client_setAdriftChooseFromHand', {
                descriptionmyturn: _('${you} must select an astronaut from your hand to set adrift.'),
            });
            var handler = function (e) { return _this.handleChooseCardFromHandSetAdrift(e); };
            this.getCardElementsFromHand().forEach(function (card) {
                if (card instanceof HTMLElement) {
                    card.classList.add('card--selectable');
                    card.addEventListener('click', handler);
                    _this.eventHandlers.push({
                        element: card,
                        event: 'click',
                        handler: handler,
                    });
                }
            });
        };
        TetherGame.prototype.handleChooseCardFromHandSetAdrift = function (e) {
            var _this = this;
            if (!(e.target instanceof HTMLElement)) {
                throw new Error("onSetAdriftHandClick called when it shouldn't have been");
            }
            e.target.classList.add('card--selected');
            this.cardSetAdrift = {
                id: e.target.dataset['cardId'],
                number: e.target.dataset['cardNumber'],
            };
            this.clearSelectableCards();
            this.setClientState('client_setAdriftChooseDraw', {
                descriptionmyturn: _('${you} must choose to take an astronaut from the adrift zone or draw from the deck.'),
            });
            var deck = document.querySelector('.js-deck');
            var drawFromDeckHandler = function () { return _this.performAdriftAction('deck', 'deck'); };
            if (deck instanceof HTMLElement) {
                deck.classList.add('card--selectable');
                deck.addEventListener('click', drawFromDeckHandler);
                this.eventHandlers.push({
                    element: deck,
                    event: 'click',
                    handler: drawFromDeckHandler,
                });
            }
            var adriftCards = document.querySelectorAll('.js-adrift');
            var drawFromAdriftHandler = function (e) {
                return _this.handleChooseCardToDrawFromAdrift(e);
            };
            adriftCards.forEach(function (card) {
                if (card instanceof HTMLElement) {
                    card.classList.add('card--selectable');
                    card.addEventListener('click', drawFromAdriftHandler);
                    _this.eventHandlers.push({
                        element: card,
                        event: 'click',
                        handler: drawFromAdriftHandler,
                    });
                }
            });
        };
        TetherGame.prototype.handleChooseCardToDrawFromAdrift = function (e) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (!(e.target instanceof HTMLElement)) {
                        throw new Error("onAdriftCardClick called when it shouldn't have been");
                    }
                    e.preventDefault();
                    e.stopPropagation();
                    if (!e.target.dataset['cardId'] ||
                        !e.target.dataset['cardNumber'] ||
                        !this.cardSetAdrift) {
                        throw new Error('id of card to draw or cardSetAdrift not set properly');
                    }
                    this.performAdriftAction(e.target.dataset['cardId'], e.target.dataset['cardNumber']);
                    return [2];
                });
            });
        };
        TetherGame.prototype.performAdriftAction = function (cardDrawnId, cardDrawnNum) {
            return __awaiter(this, void 0, void 0, function () {
                var e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.cardSetAdrift) {
                                throw new Error('performAdriftAction is missing required information');
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            this.clearSelectableCards();
                            this.clearSelectedCards();
                            this.clearEventListeners();
                            return [4, this.bgaPerformAction('actSetAdrift', {
                                    cardDrawnId: cardDrawnId,
                                    cardDrawnNum: cardDrawnNum,
                                    cardSetAdriftId: this.cardSetAdrift.id,
                                    cardSetAdriftNum: this.cardSetAdrift.number,
                                })];
                        case 2:
                            _a.sent();
                            this.cardSetAdrift = null;
                            return [3, 4];
                        case 3:
                            e_1 = _a.sent();
                            this.restoreServerGameState();
                            console.log('error while trying to perform actSetAdrift', e_1);
                            return [3, 4];
                        case 4: return [2];
                    }
                });
            });
        };
        TetherGame.prototype.notif_cardSetAdrift = function (notif) {
            var _a = notif.args, cardId = _a.card_id, cardNum = _a.card_num, playerId = _a.player_id;
            var cardEl = this.createAdriftCardElement(cardId, cardNum);
            var adriftZone = document.getElementById('adrift-zone');
            if (!adriftZone) {
                throw new Error('adrift-zone not found');
            }
            adriftZone.appendChild(cardEl);
            if (playerId !== this.player_id) {
                return;
            }
            var hand = document.getElementById('hand');
            if (!hand) {
                throw new Error('hand not found');
            }
            var cardSetAdrift = hand.querySelector("[data-card-id=\"".concat(cardId, "\"]"));
            if (!cardSetAdrift) {
                throw new Error('cardSetAdrift not found');
            }
            hand.removeChild(cardSetAdrift);
        };
        TetherGame.prototype.notif_drawFromDeck = function (notif) {
            console.log('notif_drawFromDeck', notif);
            var cardEl = this.createCardElement(notif.args.card_id, notif.args.card_num);
            var hand = document.getElementById('hand');
            if (!hand) {
                throw new Error('hand not found');
            }
            hand.appendChild(cardEl);
        };
        TetherGame.prototype.notif_drawOtherPlayer = function (notif) {
            console.log('this one is just going to increase the card hand count');
        };
        TetherGame.prototype.notif_drawFromAdrift = function (notif) {
            var adriftZone = document.getElementById('adrift-zone');
            if (!adriftZone) {
                throw new Error('adrift-zone not found');
            }
            var cardToRemove = adriftZone.querySelector("[data-card-id=\"".concat(notif.args.card_id, "\"]"));
            if (!cardToRemove) {
                throw new Error('card to remove not found');
            }
            adriftZone.removeChild(cardToRemove);
            if (notif.args.player_id !== this.player_id) {
                return;
            }
            var cardEl = this.createCardElement(notif.args.card_id, notif.args.card_num);
            var hand = document.getElementById('hand');
            if (!hand) {
                throw new Error('hand not found');
            }
            hand.appendChild(cardEl);
        };
        return TetherGame;
    }(Gamegui));
    window.bgagame = { tethergame: TetherGame };
});
