# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Board Game Arena (BGA) implementation of a card game called Tether. The project uses the BGA TypeScript Template for development.

## Build and Development Commands

```bash
# Build the project (compiles TypeScript and SCSS)
npm run build

# Watch mode for continuous building during development
npm run watch

# Run tests
npm test

# Run tests in watch mode
npm test:watch

# Type checking (without emitting files)
npm run typecheck
```

## Architecture

### Technology Stack

- **Client-side**: TypeScript (compiled to ES5 AMD modules), SCSS
- **Server-side**: PHP (using BGA framework)
- **Build tool**: bga-ts-template (handles TypeScript/SCSS compilation)
- **Testing**: uvu with tsm (TypeScript loader)

### Key File Structure

**Build outputs (generated, do NOT edit directly):**

- `tethergame.js` - Compiled client-side JavaScript
- `tethergame.css` - Compiled styles
- `gameinfos.inc.php`, `states.inc.php` - Generated from JSONC source files

**Source files (edit these):**

- `source/client/tethergame.ts` - Main client-side game logic
- `source/client/tethergame.scss` - Styles
- `source/client/*.ts` - Pure functions for game logic (e.g., connectCardToGroup, connectGroups)
- `source/client/*.spec.ts` - Unit tests for client-side logic
- `source/shared/*.jsonc` - Game configuration (gameinfos, gamestates, gameoptions, gamepreferences, stats)
- `modules/php/Game.php` - Main server-side game logic
- `tethergame.action.php` - Action handlers (routes client actions to Game.php methods)
- `dbmodel.sql` - Database schema

### BGA Framework Patterns

**Game State Machine:**
The game uses BGA's state machine pattern defined in `source/shared/gamestates.jsonc`:

1. State 1: `gameSetup` (manager state)
2. State 10: `playerTurn` (active player state) - player can `actConnectAstronauts` or `actSetAdrift`
3. State 25: `drawAtEndOfTurn` (game state) - automatic draw logic
4. State 30: `nextPlayer` (game state) - switches to next player
5. State 99: `gameEnd` (manager state)

Each game state can have an associated PHP method in `modules/php/Game.php` (e.g., `stPlayerTurn()`, `stDrawAtEndOfTurn()`).

**Client-Server Communication:**

1. Client calls `this.bgaPerformAction` with an action name
2. Request goes to `tethergame.action.php` which validates and forwards to `Game.php`
3. Server processes and sends notifications using `$this->notify->player()` or `$this->notify->all()`
4. Client handles notifications in `setupNotifications()` and associated handlers

**Database:**

- Uses BGA's deck module (`module.common.deck`) for card management
- Custom `card` table stores card state with locations: `deck`, `hand`, `adrift`, `group`
- Group cards stored with `card_location_arg` format: `{groupNum}_{x}_{y}`

### Client-Side Architecture

The client maintains two parallel game states:

- `gameStateTurnStart`: State at the beginning of the turn (for reset/cancel)
- `gameStateCurrent`: Current state with player's tentative moves

Client state machine (`clientState`) tracks UI flow:

- `choosingAction` - Initial state
- `choosingCardSideToPlay` - Player selecting which side of card to play
- `connectingAstronautsInitial` - First card placement
- `connectingAstronautsNext` - Subsequent card placements
- `settingAdrift` - Setting a card adrift

Pure functions in separate files handle game logic validation and can be unit tested.

### Game Logic

**Cards:**

- Double-sided cards with two numbers (e.g., "01/10", "23/32")
- Stored by lower number (e.g., "01", "23")
- Orientation tracked via `card_type`: `none`, `horizontal`, `vertical`

**Board State:**

- Cards organized into groups with 2D coordinates
- The board state is correct from the vertical player's perspective, and flipped for the horizontal player's
- Groups can be connected when they share consecutive numbers
- Scoring triggers at 6, 10, and 14 cards in a group
- Horizontal player scores from width, vertical player scores from height

## Important Notes

### Auto-Generated Files

Files with the header `THIS FILE HAS BEEN AUTOMATICALLY GENERATED` are built from source files in `source/shared/`. Never edit these directly:

- `gameinfos.inc.php` - Generated from `source/shared/gameinfos.jsonc`
- `states.inc.php` - Generated from `source/shared/gamestates.jsonc`
- `stats.json`, `gameoptions.json`, `gamepreferences.json` - Generated from corresponding JSONC files

### TypeScript Configuration

- Target: ES5 (BGA framework requirement)
- Module: AMD (BGA framework requirement)
- Strict mode enabled with additional strictness flags
- Never modify the `target` or `module` compiler options

### Game State Updates

When modifying game states, edit `source/shared/gamestates.jsonc`, then run `npm run build` to regenerate `states.inc.php`.

### Testing

**Client-Side Testing:**

- Tests use uvu framework and are colocated with source files (\*.spec.ts)
- Run with: `npm test`

**Server-Side Testing:**

- PHPUnit tests for extracted business logic
- Test files in `tests/Unit/` directory
- Setup requires Composer: `composer install`
- Run with: `./vendor/bin/phpunit`
- BGA mock framework available at `node_modules/bga-ts-template/server/module/table/table.game.php`

### PHP Code Architecture (Refactored for Testability)

The server-side PHP code has been refactored to separate pure business logic from framework dependencies:

**Extracted Logic Classes (Testable):**

- `modules/php/GroupLogic.php` - Group dimension calculations and UI data transformation
  - `calculateGroupDimensions()` - Pure function to calculate group sizes and coordinates
  - `createGroupObjectForUI()` - Pure function to build nested array structure for client
- `modules/php/ScoringLogic.php` - Scoring rules and end-game conditions
  - `calculateScoringThreshold()` - Determines if group triggers scoring (6, 10, or 14)
  - `calculateScores()` - Calculates points for horizontal/vertical players
  - `checkEndGameCondition()` - Checks for game-ending conditions
- `modules/php/CardUpdateHelper.php` - Bulk SQL query generation
  - `buildCardUpdates()` - Builds update list from board state
  - `generateBulkUpdateSQL()` - Creates single CASE-WHEN UPDATE query (fixes N+1 problem)

**Framework Integration Layer:**

- `modules/php/Game.php` - Main game class (extends BGA Table)
  - Uses extracted logic classes for business rules
  - Handles database operations, notifications, and state transitions
  - Methods delegate to extracted classes where possible

**Key Refactoring:**

- `handleScoring()` - Now uses GroupLogic and ScoringLogic classes
- `actConnectAstronauts()` - Now uses CardUpdateHelper for bulk updates (single query instead of N queries)
- `createGroupObjectForUI()` - Delegates to GroupLogic class

This architecture makes business logic testable in isolation while maintaining BGA framework compatibility.
