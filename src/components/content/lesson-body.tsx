import type { Block } from "@/lib/content/types";
import { Playground } from "./playground";

export function LessonBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="flex flex-col gap-5">
      {blocks.map((block, i) => (
        <BlockView key={i} block={block} />
      ))}
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "heading":
      return (
        <h2 className="mt-4 text-xl font-semibold tracking-tight">
          {block.text}
        </h2>
      );

    case "paragraph":
      return (
        <p className="leading-relaxed text-foreground/90">{block.text}</p>
      );

    case "list":
      return block.ordered ? (
        <ol className="ml-5 flex list-decimal flex-col gap-2 leading-relaxed text-foreground/90">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      ) : (
        <ul className="ml-5 flex list-disc flex-col gap-2 leading-relaxed text-foreground/90">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );

    case "code":
      return (
        <figure className="flex flex-col gap-2">
          <div className="overflow-hidden rounded-lg border border-border">
            <div className="flex items-center justify-between border-b border-border bg-muted px-3 py-1.5">
              <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                {block.lang}
              </span>
            </div>
            <pre className="overflow-x-auto bg-background p-4 text-xs leading-relaxed">
              <code>{block.code}</code>
            </pre>
          </div>
          {block.caption && (
            <figcaption className="text-xs text-muted-foreground">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "note":
      return (
        <aside className="rounded-lg border-l-4 border-primary bg-primary/5 px-4 py-3">
          <p className="text-sm leading-relaxed">
            <strong className="font-semibold">Eslatma. </strong>
            {block.text}
          </p>
        </aside>
      );

    case "warning":
      return (
        <aside className="rounded-lg border-l-4 border-destructive bg-destructive/5 px-4 py-3">
          <p className="text-sm leading-relaxed">
            <strong className="font-semibold">Diqqat. </strong>
            {block.text}
          </p>
        </aside>
      );

    case "table":
      return (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted">
                {block.headers.map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-4 py-2.5 text-left font-semibold"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className="border-t border-border">
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={
                        "px-4 py-2.5 align-top " +
                        (j === 0 ? "font-mono text-xs" : "text-foreground/90")
                      }
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "playground":
      return (
        <Playground html={block.html} css={block.css} js={block.js} />
      );
  }
}
