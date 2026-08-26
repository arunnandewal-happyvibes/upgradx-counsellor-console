export type PolicyBlock =
  | { type: "h2"; text: string }
  | { type: "h4"; text: string }
  | { type: "strong"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "p"; text: string };

/**
 * Parses the small line-based markup used for CareerServicesPolicy.body:
 *   "## heading"   -> section heading
 *   "### heading"  -> sub-heading
 *   "**label**"    -> standalone bold label line
 *   "- item"       -> bullet list item (consecutive lines group into one list)
 *   anything else  -> a paragraph
 * Blank lines are ignored (purely for readability when editing).
 */
export function parsePolicyBody(body: string): PolicyBlock[] {
  const blocks: PolicyBlock[] = [];
  let pendingList: string[] | null = null;

  const flushList = () => {
    if (pendingList && pendingList.length > 0) {
      blocks.push({ type: "ul", items: pendingList });
    }
    pendingList = null;
  };

  for (const rawLine of body.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith("### ")) {
      flushList();
      blocks.push({ type: "h4", text: line.slice(4).trim() });
    } else if (line.startsWith("## ")) {
      flushList();
      blocks.push({ type: "h2", text: line.slice(3).trim() });
    } else if (line.startsWith("- ")) {
      if (!pendingList) pendingList = [];
      pendingList.push(line.slice(2).trim());
    } else if (/^\*\*(.+)\*\*$/.test(line)) {
      flushList();
      blocks.push({ type: "strong", text: line.slice(2, -2).trim() });
    } else {
      flushList();
      blocks.push({ type: "p", text: line });
    }
  }
  flushList();

  return blocks;
}
