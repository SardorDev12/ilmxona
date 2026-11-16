import type { Block } from "./types";

/**
 * A lesson body is stored as blocks, but nobody wants to click "add
 * paragraph" eleven times to write eleven paragraphs. So the editor also
 * offers a plain writing surface, and this converts between the two.
 *
 * The syntax is the small subset of Markdown people already type by
 * habit — headings, lists, code fences, quotes — and nothing more. Tables
 * and interactive examples have no sensible plain-text form here, so they
 * survive the round trip as opaque markers rather than being mangled.
 */

const KEEP_PREFIX = "::block";

/** Blocks that have no plain-text spelling and are edited structurally. */
function isOpaque(block: Block): boolean {
  return block.type === "table" || block.type === "playground";
}

export function blocksToText(blocks: Block[]): string {
  return blocks
    .map((block, index) => {
      switch (block.type) {
        case "heading":
          return `## ${block.text}`;
        case "paragraph":
          return block.text;
        case "list":
          return block.items
            .map((item, i) => (block.ordered ? `${i + 1}. ${item}` : `- ${item}`))
            .join("\n");
        case "code":
          return `\`\`\`${block.lang}\n${block.code}\n\`\`\``;
        case "note":
          return `> ${block.text.split("\n").join("\n> ")}`;
        case "warning":
          return `! ${block.text.split("\n").join("\n! ")}`;
        default:
          // Opaque: a placeholder line the writer can move or delete, but
          // whose content stays in the block list keyed by this index.
          return `${KEEP_PREFIX}:${index}`;
      }
    })
    .join("\n\n");
}

/**
 * `previous` supplies the blocks the text was last rendered from, so the
 * opaque ones can be put back where their markers sit.
 */
export function textToBlocks(text: string, previous: Block[] = []): Block[] {
  const blocks: Block[] = [];
  const lines = text.replace(/\r\n/g, "\n").split("\n");

  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i += 1;
      continue;
    }

    // Fenced code runs to its closing fence, or to the end of the text if
    // the writer has not typed one yet.
    const fence = /^```(\w*)\s*$/.exec(line);
    if (fence) {
      const lang = fence[1] || "text";
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        body.push(lines[i]);
        i += 1;
      }
      i += 1;
      blocks.push({ type: "code", lang, code: body.join("\n") });
      continue;
    }

    const keep = new RegExp(`^${KEEP_PREFIX}:(\\d+)$`).exec(line.trim());
    if (keep) {
      const original = previous[Number(keep[1])];
      if (original && isOpaque(original)) blocks.push(original);
      i += 1;
      continue;
    }

    const heading = /^#{1,6}\s+(.*)$/.exec(line);
    if (heading) {
      blocks.push({ type: "heading", text: heading[1].trim() });
      i += 1;
      continue;
    }

    // Quotes and warnings absorb their following marked lines.
    const marked = /^([>!])\s?(.*)$/.exec(line);
    if (marked) {
      const marker = marked[1];
      const body = [marked[2]];
      i += 1;
      while (i < lines.length) {
        const next = new RegExp(`^\\${marker}\\s?(.*)$`).exec(lines[i]);
        if (!next) break;
        body.push(next[1]);
        i += 1;
      }
      blocks.push({
        type: marker === ">" ? "note" : "warning",
        text: body.join("\n").trim(),
      });
      continue;
    }

    const bullet = /^[-*+]\s+(.*)$/.exec(line);
    const numbered = /^\d+[.)]\s+(.*)$/.exec(line);
    if (bullet || numbered) {
      const ordered = numbered !== null;
      const items: string[] = [(bullet ?? numbered)![1].trim()];
      i += 1;
      while (i < lines.length) {
        const more = ordered
          ? /^\d+[.)]\s+(.*)$/.exec(lines[i])
          : /^[-*+]\s+(.*)$/.exec(lines[i]);
        if (!more) break;
        items.push(more[1].trim());
        i += 1;
      }
      blocks.push(
        ordered
          ? { type: "list", items, ordered: true }
          : { type: "list", items },
      );
      continue;
    }

    // Anything else is a paragraph, running until a blank line so that a
    // wrapped sentence does not become several paragraphs.
    const paragraph: string[] = [line.trim()];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(```|#{1,6}\s|[-*+]\s|\d+[.)]\s|[>!]\s?)/.test(lines[i]) &&
      !new RegExp(`^${KEEP_PREFIX}:\\d+$`).test(lines[i].trim())
    ) {
      paragraph.push(lines[i].trim());
      i += 1;
    }
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
  }

  return blocks;
}

/** Shown under the writing surface as a reminder of the syntax. */
export const SYNTAX_HINTS = [
  { syntax: "## Sarlavha", label: "Sarlavha" },
  { syntax: "- ro'yxat", label: "Ro'yxat" },
  { syntax: "1. ro'yxat", label: "Raqamli ro'yxat" },
  { syntax: "> eslatma", label: "Eslatma" },
  { syntax: "! ogohlantirish", label: "Ogohlantirish" },
  { syntax: "```kod```", label: "Kod" },
];
