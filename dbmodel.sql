-- ------
-- BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
-- TetherGame implementation : © Sean Li <9913851+saifahn@users.noreply.github.com>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-- -----
-- dbmodel.sql
-- This is the file where you are describing the database schema of your game
-- Basically, you just have to export from PhpMyAdmin your table structure and copy/paste
-- this export here.
-- Note that the database itself and the standard tables ("global", "stats", "gamelog" and "player") are
-- already created and must not be created here
-- Note: The database schema is created from this file when the game starts. If you modify this file,
--       you have to restart a game to see your changes in database.
CREATE TABLE IF NOT EXISTS `card` (
  `card_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  -- `card_type`
  -- orientation of cards, upright, uprightV, uprightH for vertical and horizontal players
  -- upright is the default orientation for the hand
  -- uprightV means that the card is on the board and shown with its number (card_type_arg) to the vertical player
  -- uprightH is the same but for the horizontal player
  `card_type` varchar(16) NOT NULL,
  -- `card_type_arg`
  -- the lower number of the card e.g. 01, 02, 23, 45
  -- NOT 10, 20, 32, 54 etc.
  `card_type_arg` varchar(11) NOT NULL,
  -- `card_location`
  -- deck, hand, adrift, board
  `card_location` varchar(16) NOT NULL,
  -- `card_location_arg`
  -- if hand, player_id of the hand. if board, the group number
  `card_location_arg` int(11) NOT NULL,
  PRIMARY KEY (`card_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8 AUTO_INCREMENT = 1;