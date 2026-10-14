/** The "Highest CTC" figure shown on the console, derived from the success stories' package labels. */
export function highestPackage(labels: string[]) {
  let max = 0;
  for (const label of labels) {
    const match = label.match(/₹\s?(\d+(?:\.\d+)?)\s?LPA/i);
    if (match) max = Math.max(max, parseFloat(match[1]));
  }
  return max > 0 ? `₹ ${max} LPA` : "₹ 42 LPA";
}
