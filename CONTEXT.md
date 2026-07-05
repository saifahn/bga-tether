# Tether — Domain Glossary

Canonical language for the Tether card game. Terms here are about the game
domain, not the implementation.

- **Card / Astronaut**: A double-sided card with two numbers that are digit
  reversals of each other (e.g. 05/50). A card is identified by its **low
  number** (the lesser of the two).
- **Shown Number**: The number a card displays to a given player. A card
  upright for a player's orientation shows its low number to them; otherwise
  it shows the reversed digits.
- **Orientation**: Which player a card is upright for: _vertical_ (first
  player) or _horizontal_ (second player). Playing a card **flipped** makes it
  upright for the opponent.
- **Connection**: The pairing of a played card with a specific card already in
  a group whose shown numbers differ by exactly 1. Any rules-valid connection
  point is legal — not only the first one a UI happens to find. A connection
  is rules-valid only if it is also physically placeable: the played card's
  **landing cell** must be empty, and a merge must not make the two groups
  overlap.
- **Landing Cell**: The grid cell a played card would occupy for a given
  connection — directly on the far side of the connection card (above/below
  for the vertical player, left/right for the horizontal player, higher shown
  number on the higher side). Two connections with the same landing cell are
  the same choice.
- **Group**: A set of connected cards laid out on a rectangular grid. The grid
  is always described from the vertical player's perspective; the higher shown
  number sits above (vertical) or to the right (horizontal) of its connection.
- **Current Group**: The group started by the first card of the active
  player's Connect Astronauts turn. Later cards this turn attach only to it.
- **Starting a Group**: The first card played each turn always begins a new
  group; pre-existing groups can only be extended by merging into them.
- **Merge (Connect Groups)**: Joining the current group with another group at
  a valid connection between one card of each. The merged group keeps the
  higher of the two group identities. A turn may include any number of merges.
- **Connect Astronauts**: The turn action of playing one or more cards
  (from hand or the adrift zone, in any mix, at least one) and optionally
  merging groups.
- **Adrift Zone**: The shared face-up pool of cards. **Setting Adrift** is the
  alternative turn action: discard a card from hand to the adrift zone, then
  draw either from the deck or from the adrift zone — but never the card just
  set adrift. Once the deck is empty, the draw can only come from the adrift
  zone; if no other card is there to draw, the draw is skipped and the player
  ends the turn a card down.
- **Scoring Threshold**: A group triggers scoring when it reaches 6, 10, or 14
  cards. The horizontal player scores the group's width, the vertical player
  its height.
- **Tiebreaker**: When the game ends with equal scores, the player with the
  fewest cards in hand wins. If hand counts are also equal, the game is a
  tie. Applies to every end condition.
- **Deck Exhaustion / Final Round**: The moment the last card is drawn from
  the deck (whether by the automatic end-of-turn draw or a Set Adrift
  replacement draw), each player takes exactly one more turn (starting with
  the opponent of whoever emptied the deck), then the game ends and the
  higher score wins. The 14-card group and 6-point lead end conditions still
  end the game immediately if they occur during the final round.
