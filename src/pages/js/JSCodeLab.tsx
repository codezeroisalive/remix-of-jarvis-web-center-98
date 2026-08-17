import React, { useEffect, useMemo, useState } from "react";
import { Panel, Markdown, Loading, Chip } from "@/components/jscenter/JSUI";
import { streamMentor, loadDoc, saveDoc, MentorMode } from "@/lib/jscenter/mentor";
import { getProject, PROJECTS } from "@/lib/jscenter/projects";
import { ScienceProject, CLASS_LABELS } from "@/lib/jscenter/types";
import { useJSProfile } from "@/hooks/useJSProfile";
import { PlatformReference } from "@/components/jscenter/KnowledgeRef";
import { Code2, Copy, Check, Cpu, GraduationCap, Bug, Mic2, RefreshCw } from "lucide-react";

/* ---------------- platforms ---------------- */

export const PLATFORMS: Array<{ id: string; label: string; language: string; hardware: boolean }> = [
  { id: "arduino-uno", label: "Arduino UNO / Nano", language: "C/C++ (Arduino)", hardware: true },
  { id: "arduino-mega", label: "Arduino Mega", language: "C/C++ (Arduino)", hardware: true },
  { id: "esp32", label: "ESP32 (WiFi / IoT)", language: "C/C++ (Arduino core)", hardware: true },
  { id: "esp8266", label: "ESP8266 / NodeMCU", language: "C/C++ (Arduino core)", hardware: true },
  { id: "raspberry-pi", label: "Raspberry Pi", language: "Python 3 (GPIO)", hardware: true },
  { id: "micropython", label: "MicroPython (ESP / Pico)", language: "MicroPython", hardware: true },
  { id: "python", label: "Python (laptop / Colab)", language: "Python 3", hardware: false },
  { id: "ml-python", label: "AI / ML model (Python)", language: "Python 3 + scikit-learn / TensorFlow Lite", hardware: false },
  { id: "opencv", label: "Computer Vision (OpenCV)", language: "Python 3 + OpenCV", hardware: false },
  { id: "web", label: "Web dashboard", language: "HTML + CSS + JavaScript", hardware: false },
  { id: "app-inventor", label: "MIT App Inventor / Blynk app", language: "Blocks + Blynk config", hardware: false },
  { id: "scratch", label: "Scratch (junior classes)", language: "Scratch blocks", hardware: false },
];

/** Does this project need software at all? */
export function needsCode(p: ScienceProject): boolean {
  if (p.type !== "Physical") return true;
  if (p.ai || p.sensors) return true;
  const t = p.tags.join(" ");
  return /arduino|esp|sensor|iot|automat|robot|micro|code|program|data|display|app|ml|ai|vision/i.test(t);
}

/** Suggest a default platform from the project profile. */
export function suggestPlatform(p?: ScienceProject): string {
  if (!p) return "arduino-uno";
  const t = p.tags.join(" ").toLowerCase();
  if (/vision|camera|image/.test(t)) return "opencv";
  if (/ml|ai|model|predict|dataset/.test(t) || (p.ai && p.type === "Software")) return "ml-python";
  if (/iot|wifi|cloud|blynk|thingspeak/.test(t)) return "esp32";
  if (p.type === "Software") return "python";
  if (p.maxClass <= 7) return "scratch";
  return "arduino-uno";
}

function extractCode(md: string): string {
  const blocks = [...md.matchAll(/```[a-zA-Z+#]*\n([\s\S]*?)```/g)].map((m) => m[1]);
  if (!blocks.length) return "";
  return blocks.sort((a, b) => b.length - a.length)[0].trim();
}

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [done, setDone] = useState(false);
  if (!text) return null;
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1600);
      }}
      className="flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 text-[11px] text-primary"
    >
      {done ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} {done ? "Copied" : "Copy code"}
    </button>
  );
};

/* ---------------- main panel (reused in project workspace) ---------------- */

type Stage = "code" | "code-explain" | "code-viva" | "code-debug" | "code-hardware";

export const CodeGenPanel: React.FC<{ projectId?: string }> = ({ projectId }) => {
  const { profile } = useJSProfile();
  const project = projectId ? getProject(projectId) : undefined;

  const [platform, setPlatform] = useState(() => suggestPlatform(project));
  const [feature, setFeature] = useState("");
  const [stage, setStage] = useState<Stage>("code");
  const [out, setOut] = useState<Record<Stage, string>>({
    code: "", "code-explain": "", "code-viva": "", "code-debug": "", "code-hardware": "",
  });
  const [busy, setBusy] = useState<Stage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorText, setErrorText] = useState("");
  const [pastedCode, setPastedCode] = useState("");

  useEffect(() => { setPlatform(suggestPlatform(project)); }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    setOut({ code: "", "code-explain": "", "code-viva": "", "code-debug": "", "code-hardware": "" });
    loadDoc(projectId, "code").then((c) => c && setOut((o) => ({ ...o, code: c })));
  }, [projectId]);

  const plat = PLATFORMS.find((p) => p.id === platform)!;
  const generated = out.code;
  const codeText = useMemo(() => extractCode(generated), [generated]);
  const workingCode = pastedCode.trim() || codeText;

  const run = async (mode: Stage, extra: Record<string, unknown> = {}) => {
    setBusy(mode); setError(null); setStage(mode);
    setOut((o) => ({ ...o, [mode]: "" }));
    try {
      const full = await streamMentor(
        mode as MentorMode,
        {
          project,
          platform: plat.label,
          language: plat.language,
          feature: feature || undefined,
          classLevel: profile.class_level ?? (project ? CLASS_LABELS[project.maxClass] : undefined),
          competition: profile.competition_level ?? project?.competition,
          components: profile.components ?? undefined,
          ...extra,
        },
        [],
        (c) => setOut((o) => ({ ...o, [mode]: o[mode] + c })),
      );
      if (mode === "code" && projectId) await saveDoc(projectId, "code", full);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed.");
    } finally { setBusy(null); }
  };

  const STEPS: Array<{ n: string; label: string; done: boolean }> = [
    { n: "1", label: "Choose platform", done: true },
    { n: "2", label: "Generate code", done: !!out.code },
    { n: "3", label: "Wiring & upload", done: !!out["code-hardware"] },
    { n: "4", label: "Understand it", done: !!out["code-explain"] },
    { n: "5", label: "Code viva ready", done: !!out["code-viva"] },
  ];

  return (
    <div className="space-y-4">
      {project && !needsCode(project) && (
        <Panel>
          <p className="text-sm text-muted-foreground">
            This project is a purely physical model — it does not need code. You can still generate an optional
            sensor/data-logging add-on below to make it stronger for higher-level competitions.
          </p>
        </Panel>
      )}

      <Panel title="Code Generation & Hardware Build" icon={<Code2 className="h-3.5 w-3.5 text-primary" />}>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {STEPS.map((s) => (
              <Chip key={s.n} tone={s.done ? "primary" : "muted"}>{s.done ? "✔" : s.n} {s.label}</Chip>
            ))}
          </div>

          <label className="block text-[11px] uppercase tracking-widest text-muted-foreground">Platform</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)}
            className="w-full bg-muted/40 rounded-md px-2 py-2 text-xs">
            {PLATFORMS.map((p) => <option key={p.id} value={p.id}>{p.label} — {p.language}</option>)}
          </select>

          <input value={feature} onChange={(e) => setFeature(e.target.value)}
            placeholder="Optional: extra behaviour, e.g. buzzer alert + OLED display + WiFi upload"
            className="w-full bg-muted/40 rounded-md px-2 py-2 text-xs outline-none" />

          <button onClick={() => run("code")} disabled={busy !== null}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-primary/60 bg-primary/15 px-4 py-3 text-sm font-semibold tracking-wide text-primary shadow-[0_0_25px_-8px_hsl(var(--primary))] disabled:opacity-50">
            {busy === "code" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Code2 className="h-4 w-4" />}
            💻 {out.code ? "REGENERATE CODE" : "GENERATE CODE"}
          </button>

          {out.code && (
            <div className="grid gap-2 sm:grid-cols-2">
              <button onClick={() => run("code-hardware")} disabled={busy !== null}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-primary/30 px-3 py-2 text-xs text-primary hover:bg-primary/10 disabled:opacity-50">
                <Cpu className="h-3.5 w-3.5" /> Wiring & Upload Guide
              </button>
              <button onClick={() => run("code-explain", { code: workingCode })} disabled={busy !== null || !workingCode}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-primary/30 px-3 py-2 text-xs text-primary hover:bg-primary/10 disabled:opacity-50">
                <GraduationCap className="h-3.5 w-3.5" /> 🧠 Teach Me This Code
              </button>
              <button onClick={() => run("code-viva", { code: workingCode })} disabled={busy !== null || !workingCode}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-primary/30 px-3 py-2 text-xs text-primary hover:bg-primary/10 disabled:opacity-50">
                <Mic2 className="h-3.5 w-3.5" /> Code Viva Questions
              </button>
              <button onClick={() => setStage("code-debug")} disabled={busy !== null}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-primary/30 px-3 py-2 text-xs text-primary hover:bg-primary/10 disabled:opacity-50">
                <Bug className="h-3.5 w-3.5" /> Fix My Error
              </button>
            </div>
          )}
        </div>
      </Panel>

      <PlatformReference platformId={platform} />

      {error && <Panel className="border-destructive/50"><p className="text-sm text-destructive">{error}</p></Panel>}

      {stage === "code-debug" && (
        <Panel title="Debug Assistant" icon={<Bug className="h-3.5 w-3.5 text-primary" />}>
          <div className="space-y-2">
            <textarea value={pastedCode} onChange={(e) => setPastedCode(e.target.value)} rows={6}
              placeholder="Paste your current code here (leave blank to use the generated code)…"
              className="w-full bg-muted/40 rounded-md p-2 text-[11px] font-mono outline-none" />
            <textarea value={errorText} onChange={(e) => setErrorText(e.target.value)} rows={3}
              placeholder="Paste the error message, or describe what is going wrong…"
              className="w-full bg-muted/40 rounded-md p-2 text-xs outline-none" />
            <button onClick={() => run("code-debug", { code: workingCode, errorText })}
              disabled={busy !== null || (!workingCode && !errorText)}
              className="rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs text-primary disabled:opacity-50">
              Diagnose & fix
            </button>
          </div>
        </Panel>
      )}

      {(["code", "code-hardware", "code-explain", "code-viva", "code-debug"] as Stage[]).map((s) =>
        out[s] || busy === s ? (
          <Panel
            key={s}
            title={{
              code: "Generated Code",
              "code-hardware": "Wiring & Upload Guide",
              "code-explain": "Teach Me This Code",
              "code-viva": "Code Viva",
              "code-debug": "Debug Result",
            }[s]}
            icon={<Code2 className="h-3.5 w-3.5 text-primary" />}
            action={<CopyButton text={extractCode(out[s])} />}
          >
            {!out[s] && busy === s ? <Loading /> : <Markdown text={out[s]} />}
          </Panel>
        ) : null,
      )}

      <p className="text-[11px] text-muted-foreground/70 pb-6">
        Generated code is untested on your hardware. Verify every pin number, library version and sensor threshold
        before powering your model. Threshold logic is not machine learning — JARVIS labels the difference.
      </p>
    </div>
  );
};

/* ---------------- standalone page ---------------- */

export default function JSCodeLab() {
  const [pid, setPid] = useState("");
  return (
    <div className="space-y-4">
      <Panel title="Code Lab" icon={<Code2 className="h-3.5 w-3.5 text-primary" />}>
        <select value={pid} onChange={(e) => setPid(e.target.value)} className="w-full bg-muted/40 rounded-md px-2 py-2 text-xs">
          <option value="">Select a project (or generate standalone code)…</option>
          {PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </Panel>
      <CodeGenPanel key={pid} projectId={pid || undefined} />
    </div>
  );
}
