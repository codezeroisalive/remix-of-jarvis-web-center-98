import React, { useState } from "react";
import { Panel, Chip } from "./JSUI";
import {
  BoardRef, ComponentRef, SnippetRef, boardForPlatform, componentsForPlatform, snippetsForPlatform,
} from "@/lib/jscenter/knowledge";
import { BookOpen, ChevronDown, Copy, Check, Cpu } from "lucide-react";

export const CodeBlock: React.FC<{ code: string }> = ({ code }) => {
  const [done, setDone] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={async () => { await navigator.clipboard.writeText(code); setDone(true); setTimeout(() => setDone(false), 1500); }}
        className="absolute right-2 top-2 rounded-md border border-primary/40 bg-background/80 p-1.5 text-primary"
        aria-label="Copy snippet"
      >
        {done ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </button>
      <pre className="overflow-x-auto rounded-lg border border-primary/20 bg-black/50 p-3 pr-10 text-[11px] leading-relaxed text-primary/90">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export const BoardCard: React.FC<{ board: BoardRef }> = ({ board }) => (
  <div className="rounded-xl border border-primary/20 bg-background/40 p-3 space-y-2">
    <h3 className="text-sm font-semibold text-primary">{board.name}</h3>
    <dl className="grid gap-1 text-xs sm:grid-cols-2">
      {[["Logic", board.logic], ["Power in", board.input], ["Digital", board.digital], ["Analog", board.analog], ["PWM", board.pwm]].map(([k, v]) => (
        <div key={k as string}>
          <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">{k}</dt>
          <dd className="text-foreground/90">{v}</dd>
        </div>
      ))}
    </dl>
    <div className="flex flex-wrap gap-1.5">{board.special.map((s) => <Chip key={s} tone="primary">{s}</Chip>)}</div>
    <ul className="space-y-1 pl-4">
      {board.notes.map((n) => (
        <li key={n} className="relative text-xs text-muted-foreground before:absolute before:-left-3 before:top-1.5 before:h-1 before:w-1 before:rounded-full before:bg-primary">{n}</li>
      ))}
    </ul>
  </div>
);

export const ComponentCard: React.FC<{ item: ComponentRef }> = ({ item }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-primary/20 bg-background/40">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-2 p-3 text-left">
        <div className="min-w-0">
          <div className="text-sm font-medium text-primary truncate">{item.name}</div>
          <div className="text-xs text-muted-foreground truncate">{item.purpose}</div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Chip>{item.priceINR}</Chip>
          <ChevronDown className={`h-4 w-4 text-primary transition ${open ? "rotate-180" : ""}`} />
        </div>
      </button>
      {open && (
        <div className="space-y-2 border-t border-primary/15 p-3">
          <dl className="grid gap-1 text-xs sm:grid-cols-2">
            {[["Category", item.category], ["Voltage", item.voltage], ["Interface", item.interface], ["Wiring", item.pins], ["Library", item.library]].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">{k}</dt>
                <dd className="text-foreground/90">{v}</dd>
              </div>
            ))}
          </dl>
          <ul className="space-y-1 pl-4">
            {item.gotchas.map((g) => (
              <li key={g} className="relative text-xs text-muted-foreground before:absolute before:-left-3 before:top-1.5 before:h-1 before:w-1 before:rounded-full before:bg-destructive">{g}</li>
            ))}
          </ul>
          {item.snippet && <CodeBlock code={item.snippet} />}
        </div>
      )}
    </div>
  );
};

export const SnippetCard: React.FC<{ item: SnippetRef }> = ({ item }) => (
  <div className="space-y-2 rounded-xl border border-primary/20 bg-background/40 p-3">
    <div className="flex items-center justify-between gap-2">
      <h3 className="text-sm font-medium text-primary">{item.title}</h3>
      <Chip>{item.language}</Chip>
    </div>
    <p className="text-xs text-muted-foreground">{item.what}</p>
    <CodeBlock code={item.code} />
  </div>
);

/** Inline offline reference shown inside the Code Lab for the selected platform. */
export const PlatformReference: React.FC<{ platformId: string }> = ({ platformId }) => {
  const [open, setOpen] = useState(false);
  const board = boardForPlatform(platformId);
  const snippets = snippetsForPlatform(platformId);
  const parts = componentsForPlatform(platformId);

  return (
    <Panel
      title="Offline reference"
      icon={<BookOpen className="h-3.5 w-3.5 text-primary" />}
      action={
        <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 text-[11px] text-primary">
          <Cpu className="h-3 w-3" /> {open ? "Hide" : "Show"} pinout & parts
        </button>
      }
    >
      {!open ? (
        <p className="text-xs text-muted-foreground">
          Pin maps, module wiring, library names and tested snippets for this platform — available without asking JARVIS.
        </p>
      ) : (
        <div className="space-y-3">
          {board ? <BoardCard board={board} /> : <p className="text-xs text-muted-foreground">This platform runs on a computer — no board pinout needed.</p>}
          {snippets.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground">Ready snippets</h4>
              {snippets.map((s) => <SnippetCard key={s.id} item={s} />)}
            </div>
          )}
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground">Common parts ({parts.length})</h4>
            {parts.map((c) => <ComponentCard key={c.id} item={c} />)}
          </div>
        </div>
      )}
    </Panel>
  );
};
