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
define("bgagame/tethergame", ["require", "exports", "ebg/core/gamegui", "ebg/counter"], function (require, exports, Gamegui) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TetherGame = (function (_super) {
        __extends(TetherGame, _super);
        function TetherGame() {
            var _this = _super.call(this) || this;
            _this.setupNotifications = function () {
                console.log('notifications subscriptions setup');
            };
            console.log('tethergame constructor');
            return _this;
        }
        TetherGame.prototype.setup = function (gamedatas) {
            console.log('Starting game setup');
            var gamePlayArea = document.getElementById('game_play_area');
            if (!gamePlayArea) {
                throw new Error('game_play_area not found');
            }
            var adriftZone = document.createElement('div');
            adriftZone.id = 'adrift-zone';
            gamePlayArea.appendChild(adriftZone);
            var hand = document.createElement('div');
            hand.id = 'hand';
            gamePlayArea.appendChild(hand);
            for (var cardNum in gamedatas.adrift) {
                var cardElement = document.createElement('div');
                cardElement.classList.add('card');
                cardElement.classList.add('card--adrift');
                cardElement.innerText = cardNum.toString();
                adriftZone.appendChild(cardElement);
            }
            for (var cardId in gamedatas.hand) {
                var cardElement = document.createElement('div');
                cardElement.classList.add('card');
                cardElement.innerText = gamedatas.hand[cardId].type_arg;
                hand.appendChild(cardElement);
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
            console.log('Entering state: ' + stateName);
            switch (stateName) {
                case 'dummmy':
                    break;
            }
        };
        TetherGame.prototype.onLeavingState = function (stateName) {
            console.log('Leaving state: ' + stateName);
            switch (stateName) {
                case 'dummmy':
                    break;
            }
        };
        TetherGame.prototype.onUpdateActionButtons = function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var stateName = _a[0], args = _a[1];
            console.log('onUpdateActionButtons: ' + stateName, args);
            if (!this.isCurrentPlayerActive())
                return;
            switch (stateName) {
                case 'dummmy':
                    break;
            }
        };
        return TetherGame;
    }(Gamegui));
    window.bgagame = { tethergame: TetherGame };
});
