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
        var _b, _c, _d, _e, _f, _g;
        var group = _a.group, card = _a.card, connection = _a.connection, orientation = _a.orientation;
        var cardNumShown = card.uprightFor === orientation
            ? parseInt(card.lowNum)
            : parseInt(card.lowNum.split('').reverse().join(''));
        var connectionCardNumShown = connection.card.uprightFor === orientation
            ? parseInt(connection.card.lowNum)
            : parseInt(connection.card.lowNum.split('').reverse().join(''));
        var numCols = Object.keys(group.cards).length;
        if (((_c = (_b = group.cards[connection.x]) === null || _b === void 0 ? void 0 : _b[connection.y]) === null || _c === void 0 ? void 0 : _c.id) !== connection.card.id) {
            throw new Error('The connecting card details are not correct');
        }
        if (orientation === 'vertical') {
            for (var i = 0; i < numCols; i++) {
                if (!group.cards[i]) {
                    throw new Error("something has gone wrong - cards for the column don't exist for some reason");
                }
                var itemToAdd = i === connection.x ? card : null;
                var connectAfter_1 = cardNumShown > connectionCardNumShown;
                var itemAdjacentToConnectionIndex = group.cards[i][connectAfter_1 ? connection.y + 1 : connection.y - 1];
                if (itemAdjacentToConnectionIndex === null) {
                    group.cards[i][connectAfter_1 ? connection.y + 1 : connection.y - 1] =
                        itemToAdd;
                }
                else if (itemAdjacentToConnectionIndex === undefined) {
                    if (connectAfter_1) {
                        (_d = group.cards[i]) === null || _d === void 0 ? void 0 : _d.push(itemToAdd);
                    }
                    else {
                        (_e = group.cards[i]) === null || _e === void 0 ? void 0 : _e.unshift(itemToAdd);
                    }
                }
            }
            return;
        }
        var numRows = group.cards[0].length;
        var connectAfter = connectionCardNumShown > cardNumShown;
        if (connectAfter) {
            if (((_f = group.cards[connection.x + 1]) === null || _f === void 0 ? void 0 : _f[connection.y]) === null) {
                group.cards[connection.x + 1][connection.y] = card;
                return;
            }
            group.cards[numCols] = [];
            for (var i = 0; i < numRows; i++) {
                var itemToAdd = i === connection.y ? card : null;
                group.cards[numCols].push(itemToAdd);
            }
            return;
        }
        if (((_g = group.cards[connection.x - 1]) === null || _g === void 0 ? void 0 : _g[connection.y]) === null) {
            group.cards[connection.x - 1][connection.y] === card;
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
define("getConnectingNumbers", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getConnectingNumbers = getConnectingNumbers;
    function getConnectingNumbers(num) {
        if (num.length !== 2) {
            throw new Error('the number string should be exactly 2 characters long');
        }
        var parsedNum = parseInt(num);
        if (parsedNum < 1 || parsedNum > 98) {
            throw new Error('the number must be between 01 and 98');
        }
        var decremented = (parsedNum - 1).toString().padStart(2, '0');
        var incremented = (parsedNum + 1).toString().padStart(2, '0');
        return [decremented, incremented];
    }
});
define("getConnection", ["require", "exports", "getConnectingNumbers"], function (require, exports, getConnectingNumbers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getConnection = getConnection;
    function getConnection(card, group, orientation) {
        var numToConnect = card.uprightFor === orientation
            ? card.lowNum
            : card.lowNum.split('').toReversed().join('');
        var possibleNumbers = (0, getConnectingNumbers_1.getConnectingNumbers)(numToConnect);
        for (var x in group.cards) {
            for (var y = 0; y < group.cards[x].length; y++) {
                var card_1 = group.cards[x][y];
                if (card_1 === null) {
                    continue;
                }
                var uprightNum = card_1.uprightFor === orientation
                    ? card_1.lowNum
                    : card_1.lowNum.split('').toReversed().join('');
                if (possibleNumbers.includes(uprightNum)) {
                    return { card: card_1, x: parseInt(x, 10), y: y };
                }
            }
        }
        throw new Error('the card is not a valid option to connect to the group');
    }
});
define("bgagame/tethergame", ["require", "exports", "ebg/core/gamegui", "connectCardToGroup", "generateGroupUI", "getConnectingNumbers", "getConnection", "dojo", "ebg/counter"], function (require, exports, Gamegui, connectCardToGroup_1, generateGroupUI_1, getConnectingNumbers_2, getConnection_1, dojo_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TetherGame = (function (_super) {
        __extends(TetherGame, _super);
        function TetherGame() {
            var _this = _super.call(this) || this;
            _this.eventHandlers = [];
            _this.clientState = {
                status: 'choosingAction',
            };
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
            _this.cardMap = {};
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
                dojo.subscribe('updateGameState', _this, 'notif_updateGameState');
                _this.notifqueue.setSynchronous('updateGameState', 500);
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
            console.log('player direction', this.playerDirection);
            console.log(gamedatas.board);
            this.generateCardMap();
            this.setInitialPlayableCards();
            this.updateBoardUI();
            this.setupNotifications();
            console.log('Ending game setup');
        };
        TetherGame.prototype.generateCardMap = function () {
            this.cardMap = {};
            for (var cardId in this.gameStateTurnStart.hand) {
                var lowNum = this.gameStateTurnStart.hand[cardId].type_arg;
                this.cardMap[lowNum] = cardId;
                var numReversed = lowNum.split('').reverse().join('');
                this.cardMap[numReversed] = cardId;
            }
            for (var cardId in this.gameStateTurnStart.adrift) {
                var lowNum = this.gameStateTurnStart.adrift[cardId].cardNum;
                this.cardMap[lowNum] = cardId;
                var numReversed = lowNum.split('').reverse().join('');
                this.cardMap[numReversed] = cardId;
            }
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
                    this.clientState = { status: 'choosingAction' };
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
        TetherGame.prototype.setInitialPlayableCards = function () {
            var playableCardNums = [];
            for (var cardId in this.gameStateTurnStart.hand) {
                var lowNum = this.gameStateTurnStart.hand[cardId].type_arg;
                for (var _i = 0, _a = (0, getConnectingNumbers_2.getConnectingNumbers)(lowNum); _i < _a.length; _i++) {
                    var possibleConnectNum = _a[_i];
                    if (this.cardMap[possibleConnectNum]) {
                        playableCardNums.push(lowNum);
                        break;
                    }
                }
                var numReversed = lowNum.split('').reverse().join('');
                for (var _b = 0, _c = (0, getConnectingNumbers_2.getConnectingNumbers)(numReversed); _b < _c.length; _b++) {
                    var possibleConnectNum = _c[_b];
                    if (this.cardMap[possibleConnectNum]) {
                        playableCardNums.push(numReversed);
                        break;
                    }
                }
            }
            this.playableCardNumbers = playableCardNums;
        };
        TetherGame.prototype.onUpdateActionButtons = function () {
            var _this = this;
            var _a, _b, _c;
            var _d = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _d[_i] = arguments[_i];
            }
            var stateName = _d[0], args = _d[1];
            console.log('onUpdateActionButtons: ' + stateName, args);
            if (!this.isCurrentPlayerActive())
                return;
            switch (stateName) {
                case 'playerTurn':
                    this.addActionButton('connect-astronauts-button', _('Connect Astronauts'), function () {
                        _this.highlightPlayableAstronauts();
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
                    if (this.clientState.status !== 'choosingCardSideToPlay') {
                        throw new Error('cardForConnecting not in correct state for this call');
                    }
                    var _e = this.clientState.card, first_1 = _e.first, number = _e.number, numReversed = _e.numReversed;
                    this.addActionButton('play-upright-button', _("Play card as ".concat(number)), function () {
                        _this.handleChooseCardToPlay({
                            first: first_1,
                            flipped: false,
                        });
                    });
                    var isNumPlayable = this.isNumPlayable(number);
                    if (!isNumPlayable) {
                        (_b = document
                            .getElementById('play-upright-button')) === null || _b === void 0 ? void 0 : _b.classList.add('disabled');
                    }
                    this.addActionButton('play-flipped-button', _("Play card as ".concat(numReversed)), function () {
                        _this.handleChooseCardToPlay({
                            first: first_1,
                            flipped: true,
                        });
                    });
                    var isFlippedNumPlayable = this.isNumPlayable(numReversed);
                    if (!isFlippedNumPlayable) {
                        (_c = document
                            .getElementById('play-flipped-button')) === null || _c === void 0 ? void 0 : _c.classList.add('disabled');
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
            this.clientState = {
                status: 'choosingAction',
            };
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
            this.clientState = {
                status: 'settingAdrift',
                card: {
                    id: e.target.dataset['cardId'],
                    number: e.target.dataset['cardNumber'],
                },
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
                        this.clientState.status !== 'settingAdrift') {
                        throw new Error('id of card to draw or adrift status not set properly');
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
                            if (this.clientState.status !== 'settingAdrift') {
                                throw new Error('performAdriftAction called in the wrong state');
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
                                    cardSetAdriftId: this.clientState.card.id,
                                    cardSetAdriftNum: this.clientState.card.number,
                                })];
                        case 2:
                            _a.sent();
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
            this.clientState = {
                status: 'choosingAction',
            };
            this.setInitialPlayableCards();
            this.restoreUIToTurnStart();
        };
        TetherGame.prototype.isCardPlayable = function (card) {
            return (this.isNumPlayable(card.dataset['cardNumber']) ||
                this.isNumPlayable(card.dataset['cardNumReversed']));
        };
        TetherGame.prototype.isNumPlayable = function (number) {
            return (typeof number === 'string' && this.playableCardNumbers.includes(number));
        };
        TetherGame.prototype.highlightPlayableAstronauts = function () {
            var _this = this;
            var handler = function (e) { return _this.handleChooseCardFromHandConnect(e); };
            this.getCardElementsFromHand().forEach(function (card) {
                if (card instanceof HTMLElement) {
                    if (_this.isCardPlayable(card)) {
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
            if (this.clientState.status === 'choosingAction') {
                this.clientState = { status: 'connectingAstronautsInitial' };
                this.setClientState('client_connectAstronautInitial', {
                    descriptionmyturn: _('${you} must select an astronaut from your hand to begin connecting.'),
                });
                return;
            }
            else {
                this.clientState = { status: 'connectingAstronautsNext' };
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
                    if (_this.isCardPlayable(card)) {
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
            var firstCardPlayed = this.clientState.status === 'connectingAstronautsInitial';
            this.clientState = {
                status: 'choosingCardSideToPlay',
                card: {
                    first: firstCardPlayed,
                    from: 'hand',
                    id: e.target.dataset['cardId'],
                    number: e.target.dataset['cardNumber'],
                    numReversed: e.target.dataset['cardNumReversed'],
                },
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
            this.clientState = {
                status: 'choosingCardSideToPlay',
                card: {
                    first: false,
                    from: 'adrift',
                    id: e.target.dataset['cardId'],
                    number: e.target.dataset['cardNumber'],
                    numReversed: e.target.dataset['cardNumReversed'],
                },
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
        TetherGame.prototype.updatePlayableCards = function () {
            var currentGroup = this.gameStateCurrent.board[this.currentGroup];
            if (!currentGroup) {
                throw new Error('there was no current group found in updatePlayableCards');
            }
            var playableNumbers = [];
            for (var col in currentGroup.cards) {
                for (var _i = 0, _a = currentGroup.cards[col]; _i < _a.length; _i++) {
                    var card = _a[_i];
                    if (!card)
                        continue;
                    var uprightNum = card.uprightFor === this.playerDirection
                        ? card.lowNum
                        : card.lowNum.split('').toReversed().join('');
                    for (var _b = 0, _c = (0, getConnectingNumbers_2.getConnectingNumbers)(uprightNum); _b < _c.length; _b++) {
                        var possibleConnectNum = _c[_b];
                        if (this.cardMap[possibleConnectNum]) {
                            playableNumbers.push(possibleConnectNum);
                        }
                    }
                }
            }
            this.playableCardNumbers = playableNumbers;
        };
        TetherGame.prototype.handleChooseCardToPlay = function (_a) {
            var _b = _a === void 0 ? { first: false, flipped: false } : _a, first = _b.first, flipped = _b.flipped;
            if (this.clientState.status !== 'choosingCardSideToPlay') {
                throw new Error('handleChooseCardToPlay was called in the wrong state');
            }
            var _c = this.clientState.card, from = _c.from, id = _c.id, number = _c.number;
            delete this.gameStateCurrent[from][id];
            var card = { id: id, number: number, flipped: flipped };
            if (first) {
                var existingGroupsLen = Object.keys(this.gameStateCurrent.board).length;
                this.currentGroup = existingGroupsLen + 1;
                this.gameStateCurrent.board[this.currentGroup] =
                    this.createGroupFromCard(card);
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
                var otherDirection = this.playerDirection === 'vertical' ? 'horizontal' : 'vertical';
                var uprightFor = card.flipped ? otherDirection : this.playerDirection;
                var cardToConnect = {
                    id: card.id,
                    lowNum: card.number,
                    uprightFor: uprightFor,
                };
                (0, connectCardToGroup_1.connectCardToGroup)({
                    group: group,
                    card: cardToConnect,
                    connection: (0, getConnection_1.getConnection)(cardToConnect, group, this.playerDirection),
                    orientation: this.playerDirection,
                });
                this.updateBoardUI();
            }
            this.updatePlayableCards();
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
        TetherGame.prototype.notif_updateGameState = function (notif) {
            var _a;
            this.gameStateTurnStart.adrift = notif.args.adrift;
            this.gameStateTurnStart.board = notif.args.board;
            this.gameStateTurnStart.hand = notif.args.hand;
            this.gameStateCurrent = (0, dojo_1.clone)(this.gameStateTurnStart);
            this.generateCardMap();
            this.setInitialPlayableCards();
            if (this.playableCardNumbers.length === 0) {
                (_a = document
                    .getElementById('connect-astronauts-button')) === null || _a === void 0 ? void 0 : _a.classList.add('disabled');
            }
            this.updateBoardUI();
        };
        return TetherGame;
    }(Gamegui));
    window.bgagame = { tethergame: TetherGame };
});
