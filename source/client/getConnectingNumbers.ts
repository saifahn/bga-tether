export function getConnectingNumbers(num: string) {
  if (num.length !== 2) {
    throw new Error('the number string should be exactly 2 characters long');
  }
  const parsedNum = parseInt(num);
  if (parsedNum < 1 || parsedNum > 98) {
    throw new Error('the number must be between 01 and 98');
  }

  const decremented = (parsedNum - 1).toString().padStart(2, '0');
  const incremented = (parsedNum + 1).toString().padStart(2, '0');

  return [decremented, incremented];
}
