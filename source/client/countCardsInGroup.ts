import { Group } from './connectCardToGroup';

/**
 * Counts the total number of cards in a group by iterating through the nested cards structure.
 *
 * @param group - The group to count cards in
 * @returns The total number of non-null cards in the group
 */
export function countCardsInGroup(group: Group): number {
  let count = 0;

  // Iterate through each column
  for (const x in group.cards) {
    if (!group.cards[x]) continue; // Skip if there are no cards in this column

    // Iterate through each row
    for (const card of group.cards[x]) {
      if (card !== null) {
        count++;
      }
    }
  }

  return count;
}
