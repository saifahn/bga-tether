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
define("connectCardToGroup", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.connectCardToGroup = connectCardToGroup;
    function connectCardToGroup(_a) {
        var _b, _c, _d, _e;
        var group = _a.group, card = _a.card, connection = _a.connection, orientation = _a.orientation;
        var cardNumShown = card.uprightFor === orientation
            ? parseInt(card.lowNum)
            : parseInt(card.lowNum.split('').reverse().join(''));
        var connectionCardNumShown = card.uprightFor === orientation
            ? parseInt(connection.card.lowNum)
            : parseInt(connection.card.lowNum.split('').reverse().join(''));
        var numCols = Object.keys(group.cards).length;
        if (((_c = (_b = group.cards[connection.x]) === null || _b === void 0 ? void 0 : _b[connection.y]) === null || _c === void 0 ? void 0 : _c.id) !== connection.card.id) {
            throw new Error('The connecting card details are not correct');
        }
        if (orientation === 'vertical') {
            for (var i = 0; i < numCols; i++) {
                var itemToAdd = i === connection.x ? card : null;
                var connectAtEnd_1 = cardNumShown > connectionCardNumShown;
                if (connectAtEnd_1) {
                    (_d = group.cards[i]) === null || _d === void 0 ? void 0 : _d.splice(connection.y + 1, 0, itemToAdd);
                }
                else {
                    (_e = group.cards[i]) === null || _e === void 0 ? void 0 : _e.splice(connection.y, 0, itemToAdd);
                }
            }
            return;
        }
        var numRows = group.cards[0].length;
        var connectAtEnd = connectionCardNumShown > cardNumShown;
        if (connectAtEnd) {
            group.cards[numCols] = [];
            for (var i = 0; i < numRows; i++) {
                var itemToAdd = i === connection.y ? card : null;
                group.cards[numCols].push(itemToAdd);
            }
            return;
        }
        for (var i = numCols; i >= 0; i--) {
            if (i === 0) {
                group.cards[0] = [];
                for (var i_1 = 0; i_1 < numRows; i_1++) {
                    var itemToAdd = i_1 === connection.y ? card : null;
                    group.cards[0].push(itemToAdd);
                }
                continue;
            }
            group.cards[i] = group.cards[i - 1];
        }
    }
});
define("generateGroupUI", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.generateGroupUI = generateGroupUI;
    function generateGroupUI(group) {
        var _a, _b;
        var numCols = Object.keys(group.cards).length;
        var numRows = (_a = group.cards[0]) === null || _a === void 0 ? void 0 : _a.length;
        if (!numRows) {
            throw new Error("somehow there are no rows in group: ".concat(group.number));
        }
        var boardSpaces = [];
        for (var x = 0; x < numCols; x++) {
            boardSpaces[x] = [];
            for (var y = 0; y < numRows; y++) {
                var card = (_b = group.cards[x]) === null || _b === void 0 ? void 0 : _b[y];
                if (card === null) {
                    boardSpaces[x][y] = null;
                }
                else {
                    if (!card) {
                        throw new Error("card was missing while creating the group: ".concat(card, ", at (").concat(x, ",").concat(y, ")"));
                    }
                    boardSpaces[x][y] = {
                        id: card.id,
                        lowNum: card.lowNum,
                        lowUprightForV: card.uprightFor === 'vertical',
                    };
                }
            }
        }
        return boardSpaces;
    }
});
define("bgagame/tethergame", ["require", "exports", "ebg/core/gamegui", "connectCardToGroup", "generateGroupUI", "dojo", "ebg/counter"], function (require, exports, Gamegui, connectCardToGroup_1, generateGroupUI_1, dojo_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TetherGame = (function (_super) {
        __extends(TetherGame, _super);
        function TetherGame() {
            var _this = _super.call(this) || this;
            _this.eventHandlers = [];
            _this.status = 'choosingAction';
            _this.cardSetAdrift = null;
            _this.cardForConnecting = null;
            _this.currentGroup = 0;
            _this.gameStateTurnStart = {
                adrift: {},
                board: {},
                hand: {},
            };
            _this.gameStateCurrent = {
                adrift: {},
                board: {},
                hand: {},
            };
            _this.playerDirection = null;
            _this.playableCardNumbers = [];
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
        TetherGame.prototype.createCardElement = function (_a) {
            var id = _a.id, number = _a.number, flipped = _a.flipped;
            var cardElement = document.createElement('div');
            cardElement.classList.add('card');
            cardElement.dataset['cardId'] = id;
            cardElement.dataset['cardNumber'] = number;
            cardElement.dataset['cardNumReversed'] = number
                .split('')
                .reverse()
                .join('');
            cardElement.id = "card-".concat(number);
            if (flipped) {
                cardElement.classList.add('card--flipped');
            }
            return cardElement;
        };
        TetherGame.prototype.createAdriftCardElement = function (id, number) {
            var cardElement = this.createCardElement({ id: id, number: number, flipped: false });
            cardElement.classList.add('card--adrift');
            cardElement.classList.add('js-adrift');
            return cardElement;
        };
        TetherGame.prototype.updateBoardUI = function () {
            console.log('updating board UI');
            console.log('current game state', this.gameStateCurrent);
            var adriftZone = document.getElementById('adrift-zone');
            if (!adriftZone) {
                throw new Error('adrift-zone not found');
            }
            adriftZone.innerHTML = '';
            var deck = document.createElement('div');
            deck.id = 'deck';
            deck.classList.add('deck');
            deck.classList.add('js-deck');
            adriftZone.appendChild(deck);
            for (var cardId in this.gameStateCurrent.adrift) {
                var cardEl = this.createAdriftCardElement(cardId, this.gameStateCurrent.adrift[cardId].cardNum);
                adriftZone.appendChild(cardEl);
            }
            var hand = document.getElementById('hand');
            if (!hand) {
                throw new Error('hand not found');
            }
            hand.innerHTML = '';
            for (var cardId in this.gameStateCurrent.hand) {
                var cardEl = this.createCardElement({
                    id: cardId,
                    number: this.gameStateCurrent.hand[cardId].type_arg,
                    flipped: false,
                });
                hand.appendChild(cardEl);
            }
            var groupsArea = document.getElementById('groups');
            if (!groupsArea) {
                throw new Error('groups not found');
            }
            groupsArea.innerHTML = '';
            for (var group in this.gameStateCurrent.board) {
                var generatedGroup = (0, generateGroupUI_1.generateGroupUI)(this.gameStateCurrent.board[group]);
                var groupEl = document.createElement('div');
                groupEl.classList.add('group');
                if (this.playerDirection === 'horizontal') {
                    groupEl.classList.add('group--flipped');
                }
                for (var _i = 0, generatedGroup_1 = generatedGroup; _i < generatedGroup_1.length; _i++) {
                    var row = generatedGroup_1[_i];
                    var columnEl = document.createElement('div');
                    columnEl.classList.add('column');
                    for (var _a = 0, row_1 = row; _a < row_1.length; _a++) {
                        var card = row_1[_a];
                        if (card) {
                            var cardEl = this.createCardElement({
                                id: card.id,
                                number: card.lowNum,
                                flipped: !card.lowUprightForV,
                            });
                            columnEl.appendChild(cardEl);
                        }
                    }
                    groupEl.appendChild(columnEl);
                }
                groupsArea.appendChild(groupEl);
            }
        };
        TetherGame.prototype.setup = function (gamedatas) {
            var _a;
            console.log('Starting game setup');
            var gamePlayArea = document.getElementById('game_play_area');
            if (!gamePlayArea) {
                throw new Error('game_play_area not found');
            }
            var adriftZone = document.createElement('div');
            adriftZone.id = 'adrift-zone';
            gamePlayArea.appendChild(adriftZone);
            var groupsArea = document.createElement('div');
            groupsArea.id = 'groups';
            groupsArea.classList.add('groups');
            gamePlayArea.appendChild(groupsArea);
            var hand = document.createElement('div');
            hand.id = 'hand';
            gamePlayArea.appendChild(hand);
            if (!this.player_id) {
                throw new Error('player_id not found');
            }
            this.playerDirection =
                ((_a = gamedatas.players[this.player_id]) === null || _a === void 0 ? void 0 : _a.turnOrder) === '1'
                    ? 'vertical'
                    : 'horizontal';
            this.gameStateTurnStart.adrift = gamedatas.adrift;
            this.gameStateTurnStart.board = Array.isArray(gamedatas.board)
                ? {}
                : gamedatas.board;
            this.gameStateTurnStart.hand = gamedatas.hand;
            this.gameStateCurrent = (0, dojo_1.clone)(this.gameStateTurnStart);
            console.log('game board', gamedatas.board);
            console.log('player direction', this.playerDirection);
            this.updateBoardUI();
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
                case 'playerTurn':
                    this.playableCardNumbers = state.args['_private'] || [];
                    break;
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
        TetherGame.prototype.onUpdateActionButtons = function () {
            var _this = this;
            var _a, _b, _c, _d, _e, _f, _g;
            var _h = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _h[_i] = arguments[_i];
            }
            var stateName = _h[0], args = _h[1];
            console.log('onUpdateActionButtons: ' + stateName, args);
            if (!this.isCurrentPlayerActive())
                return;
            switch (stateName) {
                case 'playerTurn':
                    this.playableCardNumbers = args['_private'] || [];
                    this.addActionButton('connect-astronauts-button', _('Connect Astronauts'), function () {
                        _this.highlightPlayableAstronauts('initial');
                    });
                    if (this.playableCardNumbers.length === 0) {
                        (_a = document
                            .getElementById('connect-astronauts-button')) === null || _a === void 0 ? void 0 : _a.classList.add('disabled');
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
                case 'client_connectAstronautInitial':
                    this.addActionButton('cancel-button', _('Restart turn'), function () {
                        _this.cancelConnectAstronautsAction();
                    }, undefined, false, 'red');
                    break;
                case 'client_chooseCardSideToPlay':
                    if (((_b = this.cardForConnecting) === null || _b === void 0 ? void 0 : _b.status) !== 'choosingFromHand' &&
                        ((_c = this.cardForConnecting) === null || _c === void 0 ? void 0 : _c.status) !== 'choosingFromAdrift') {
                        throw new Error('cardForConnecting not in correct state for this call');
                    }
                    var num = (_d = this.cardForConnecting) === null || _d === void 0 ? void 0 : _d.number;
                    this.addActionButton('play-upright-button', _("Play card as ".concat(num)), function () {
                        _this.handleChooseCardToPlay({
                            first: _this.status === 'connectingAstronautsInitial',
                            flipped: false,
                        });
                    });
                    var isNumPlayable = this.numberIsPlayable(num);
                    if (!isNumPlayable) {
                        (_e = document
                            .getElementById('play-upright-button')) === null || _e === void 0 ? void 0 : _e.classList.add('disabled');
                    }
                    var flippedNum = (_f = this.cardForConnecting) === null || _f === void 0 ? void 0 : _f.numReversed;
                    this.addActionButton('play-flipped-button', _("Play card as ".concat(flippedNum)), function () {
                        _this.handleChooseCardToPlay({
                            first: _this.status === 'connectingAstronautsInitial',
                            flipped: true,
                        });
                    });
                    var isFlippedNumPlayable = this.numberIsPlayable(flippedNum);
                    if (!isFlippedNumPlayable) {
                        (_g = document
                            .getElementById('play-flipped-button')) === null || _g === void 0 ? void 0 : _g.classList.add('disabled');
                    }
                    this.addActionButton('cancel-button', _('Restart turn'), function () {
                        _this.cancelConnectAstronautsAction();
                    }, undefined, false, 'red');
                    break;
                case 'client_connectAstronautChooseNextCard':
                    this.addActionButton('finish-connecting-button', _('Finish connecting astronauts'), function () {
                        _this.finishConnectingAstronauts();
                    });
                    this.addActionButton('cancel-button', _('Restart turn'), function () {
                        _this.cancelConnectAstronautsAction();
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
            this.clearEventListeners();
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
            this.clearEventListeners();
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
        TetherGame.prototype.restoreUIToTurnStart = function () {
            this.gameStateCurrent = (0, dojo_1.clone)(this.gameStateTurnStart);
            this.updateBoardUI();
        };
        TetherGame.prototype.cancelConnectAstronautsAction = function () {
            this.clearSelectedCards();
            this.clearSelectableCards();
            this.clearEventListeners();
            this.restoreServerGameState();
            this.status = 'choosingAction';
            this.restoreUIToTurnStart();
        };
        TetherGame.prototype.cardIsPlayable = function (card) {
            return (this.numberIsPlayable(card.dataset['cardNumber']) ||
                this.numberIsPlayable(card.dataset['cardNumReversed']));
        };
        TetherGame.prototype.numberIsPlayable = function (number) {
            return (typeof number === 'string' && this.playableCardNumbers.includes(number));
        };
        TetherGame.prototype.highlightPlayableAstronauts = function (call) {
            var _this = this;
            if (call === void 0) { call = 'further'; }
            var handler = function (e) { return _this.handleChooseCardFromHandConnect(e); };
            this.getCardElementsFromHand().forEach(function (card) {
                if (card instanceof HTMLElement) {
                    if (_this.cardIsPlayable(card)) {
                        card.classList.add('card--selectable');
                        card.addEventListener('click', handler);
                        _this.eventHandlers.push({
                            element: card,
                            event: 'click',
                            handler: handler,
                        });
                    }
                }
            });
            if (call === 'initial') {
                this.status = 'connectingAstronautsInitial';
                this.setClientState('client_connectAstronautInitial', {
                    descriptionmyturn: _('${you} must select an astronaut from your hand to begin connecting.'),
                });
                return;
            }
            else {
                this.status = 'connectingAstronautsNext';
                this.setClientState('client_connectAstronautChooseNextCard', {
                    descriptionmyturn: _('Select an astronaut from your hand or the adrift zone to continue connecting.'),
                });
            }
            var adriftCards = document.querySelectorAll('.js-adrift');
            var connectFromAdriftHandler = function (e) {
                return _this.handleChooseCardFromAdriftConnect(e);
            };
            adriftCards.forEach(function (card) {
                if (card instanceof HTMLElement) {
                    if (_this.cardIsPlayable(card)) {
                        card.classList.add('card--selectable');
                        card.addEventListener('click', connectFromAdriftHandler);
                        _this.eventHandlers.push({
                            element: card,
                            event: 'click',
                            handler: connectFromAdriftHandler,
                        });
                    }
                }
            });
        };
        TetherGame.prototype.handleChooseCardFromHandConnect = function (e) {
            if (!(e.target instanceof HTMLElement)) {
                throw new Error("handleChooseCardFromHandConnect called when it shouldn't have been");
            }
            this.clearSelectableCards();
            this.clearEventListeners();
            e.target.classList.add('card--selected');
            this.cardForConnecting = {
                status: 'choosingFromHand',
                id: e.target.dataset['cardId'],
                number: e.target.dataset['cardNumber'],
                numReversed: e.target.dataset['cardNumReversed'],
            };
            this.setClientState('client_chooseCardSideToPlay', {
                descriptionmyturn: _('${you} must choose which side of the card to play.'),
            });
        };
        TetherGame.prototype.handleChooseCardFromAdriftConnect = function (e) {
            if (!(e.target instanceof HTMLElement)) {
                throw new Error("handleChooseCardFromAdriftConnect called when it shouldn't have been");
            }
            this.clearSelectableCards();
            this.clearEventListeners();
            e.target.classList.add('card--selected');
            this.cardForConnecting = {
                status: 'choosingFromAdrift',
                id: e.target.dataset['cardId'],
                number: e.target.dataset['cardNumber'],
                numReversed: e.target.dataset['cardNumReversed'],
            };
            this.setClientState('client_chooseCardSideToPlay', {
                descriptionmyturn: _('${you} must choose which side of the card to play.'),
            });
        };
        TetherGame.prototype.createGroupFromCard = function (card) {
            var otherDirection = this.playerDirection === 'vertical' ? 'horizontal' : 'vertical';
            var uprightFor = card.flipped ? otherDirection : this.playerDirection;
            var newGroupNum = Object.keys(this.gameStateCurrent.board).length + 1;
            return {
                number: newGroupNum,
                cards: {
                    0: [{ id: card.id, lowNum: card.number, uprightFor: uprightFor }],
                },
            };
        };
        TetherGame.prototype.handleChooseCardToPlay = function (_a) {
            var _b = _a === void 0 ? { first: false, flipped: false } : _a, first = _b.first, flipped = _b.flipped;
            if (!this.cardForConnecting) {
                throw new Error('cardForConnecting not set');
            }
            if (this.cardForConnecting.status === 'choosingFromHand') {
                delete this.gameStateCurrent.hand[this.cardForConnecting.id];
            }
            else if (this.cardForConnecting.status === 'choosingFromAdrift') {
                delete this.gameStateCurrent.adrift[this.cardForConnecting.id];
            }
            else {
                throw new Error('cardForConnecting not in correct state for this call');
            }
            this.cardForConnecting = {
                status: 'played',
                id: this.cardForConnecting.id,
                number: this.cardForConnecting.number,
                flipped: flipped,
            };
            if (first) {
                var existingGroupsLen = Object.keys(this.gameStateCurrent.board).length;
                this.currentGroup = existingGroupsLen + 1;
                this.gameStateCurrent.board[this.currentGroup] = this.createGroupFromCard(this.cardForConnecting);
                this.updateBoardUI();
            }
            else {
                var group = this.gameStateCurrent.board[this.currentGroup];
                if (!group) {
                    throw new Error('current group not found');
                }
                if (!this.playerDirection) {
                    throw new Error('something is wrong, playerDirection was null');
                }
                var card = this.cardForConnecting;
                var otherDirection = this.playerDirection === 'vertical' ? 'horizontal' : 'vertical';
                var uprightFor = card.flipped ? otherDirection : this.playerDirection;
                (0, connectCardToGroup_1.connectCardToGroup)({
                    group: group,
                    card: {
                        id: card.id,
                        lowNum: card.number,
                        uprightFor: uprightFor,
                    },
                    connection: {
                        card: group.cards[0][0],
                        x: 0,
                        y: 0,
                    },
                    orientation: this.playerDirection,
                });
                this.updateBoardUI();
            }
            this.highlightPlayableAstronauts();
        };
        TetherGame.prototype.finishConnectingAstronauts = function () {
            this.bgaPerformAction('actConnectAstronauts', {
                boardStateJSON: JSON.stringify(this.gameStateCurrent.board),
            });
            this.clearSelectableCards();
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
            var cardEl = this.createCardElement({
                id: notif.args.card_id,
                number: notif.args.card_num,
                flipped: false,
            });
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
            var cardEl = this.createCardElement({
                id: notif.args.card_id,
                number: notif.args.card_num,
                flipped: false,
            });
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
