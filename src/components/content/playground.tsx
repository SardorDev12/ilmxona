"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type Tab = "html" | "css" | "js";

type Props = {
  html?: string;
  css?: string;
  js?: string;
};

function toDocument({ html, css, js }: Required<Props>) {
  return (
    `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}</style></head>` +
    `<body>${html}<script>${js}<\/script></body></html>`
  );
}

/**
 * Runs the learner's HTML/CSS/JS in a sandboxed iframe (docs/PRD.md §15).
 * `sandbox="allow-scripts"` without `allow-same-origin` gives the frame a
 * unique opaque origin: it can run the code but cannot reach cookies,
 * storage, or the parent document.
 */
export function Playground({ html = "", css = "", js = "" }: Props) {
  const initial = useMemo(() => ({ html, css, js }), [html, css, js]);

  const [code, setCode] = useState(initial);
  const [srcDoc, setSrcDoc] = useState(() => toDocument(initial));
  const [tab, setTab] = useState<Tab>(html ? "html" : css ? "css" : "js");

  const available = useMemo(
    () =>
      (["html", "css", "js"] as const).filter(
        (t) => initial[t].length > 0,
      ),
    [initial],
  );

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted px-2 py-1.5">
        <div className="flex gap-1">
          {available.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={
                "cursor-pointer rounded px-2.5 py-1 text-xs font-medium uppercase transition-colors " +
                (tab === t
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setCode(initial);
              setSrcDoc(toDocument(initial));
            }}
          >
            Tiklash
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => setSrcDoc(toDocument(code))}
          >
            Ishga tushirish
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2">
        <textarea
          value={code[tab]}
          onChange={(e) => setCode({ ...code, [tab]: e.target.value })}
          spellCheck={false}
          aria-label={`${tab.toUpperCase()} kodi`}
          className="min-h-56 resize-y border-b border-border bg-background p-3 font-mono text-xs leading-relaxed text-foreground outline-none md:border-b-0 md:border-r"
        />
        <iframe
          title="Natija"
          srcDoc={srcDoc}
          sandbox="allow-scripts"
          className="min-h-56 w-full bg-white"
        />
      </div>
    </div>
  );
}
