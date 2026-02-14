import { Group } from './connectCardToGroup';

/**
 * Counts the total number of cards in a group by iterating through the nested cards structure.
 *
 * @param group - The group to count cards in
 * @returns The total number of non-null cards in the group
 */
export function countCardsInGroup(group: Group): number {
  let count = 0;

  // Iterate through each x coordinate
  for (const x in group.cards) {
    if (!group.cards[x]) continue; // Skip if there are no cards at this x coordinate
    // Iterate through each y coordinate (array of cards)
    for (const card of group.cards[x]) {
      if (card !== null) {
        count++;
      }
    }
  }

  return count;
}
