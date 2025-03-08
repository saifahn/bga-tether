/*
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * TetherGame implementation : © Sean Li 9913851+saifahn@users.noreply.github.com
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 */
declare namespace BGA {
  /** Goto {@link Gamedatas} or hover name for info. */
  interface Gamedatas extends Record<string, any> {
    adrift: {
      [key: number]: {
        cardNum: string;
      };
    };
  }

  /** Goto {@link NotifTypes} or hover name for info. */
  interface NotifTypes {
    [name: string]: any; // RECOMMENDED: comment out this line to type notifications specific to it's name using BGA.Notif<"name">.
  }

  /** Goto {@link GameSpecificIdentifiers} or hover name for info. */
  interface GameSpecificIdentifiers {
    // CounterNames: 'foo' | 'bar' | 'bread' | 'butter';
  }
}
