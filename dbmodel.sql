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
  -- orientation of cards, none, horizontal, vertical - indicating who it is upright for
  -- none is used in adrift and hand
  -- horizontal and vertical are used for the board
  `card_type` varchar(16) NOT NULL,
  -- `card_type_arg`
  -- the lower number of the card e.g. 01, 02, 23, 45
  -- NOT 10, 20, 32, 54 etc.
  `card_type_arg` varchar(11) NOT NULL,
  -- `card_location`
  -- deck, hand, adrift, board
  `card_location` varchar(10) NOT NULL,
  -- `card_location_arg`
  -- if hand, player_id of the hand. if board, the group number and x/y coord in the format group_x_y
  `card_location_arg` varchar(16) NOT NULL,
  -- `scored_at`
  -- the size threshold at which the card was last scored. Can be empty, 6, 10, or 14.
  `scored_at` int(10) unsigned,
  PRIMARY KEY (`card_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8 AUTO_INCREMENT = 1;