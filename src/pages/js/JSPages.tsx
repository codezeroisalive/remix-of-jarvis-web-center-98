import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Panel, Markdown, Loading, Chip } from "@/components/jscenter/JSUI";
import { streamMentor, loadDoc, saveDoc, MentorMode } from "@/lib/jscenter/mentor";
import { getProject, PROJECTS } from "@/lib/jscenter/projects";
import { CLASS_LABELS, DIFFICULTY_META } from "@/lib/jscenter/types";
import { useJSProfile } from "@/hooks/useJSProfile";
import { supabase } from "@/integrations/supabase/client";
import { Star, RefreshCw, Hammer, Mic2, Wallet, Ruler, Beaker, BookOpen, BarChart3, Trash2 } from "lucide-react";

/* ---------------- shared generator ---------------- */

function useMentorDoc(projectId: string | undefined, section: MentorMode, extra: Record<string, unknown> = {}) {
  const { profile } = useJSProfile();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    setText("");
    loadDoc(projectId, section).then((c) => c && setText(c));
  }, [projectId, section]);

  const generate = async (payloadExtra: Record<string, unknown> = {}) => {
    setBusy(true); setError(null); setText("");
    const project = projectId ? getProject(projectId) : undefined;
    try {
      const full = await streamMentor(
        section,
        {
          project,
          classLevel: profile.class_level ?? (project ? CLASS_LABELS[project.maxClass] : undefined),
          competition: profile.competition_level ?? project?.competition,
          budget: profile.budget ?? undefined,
          days: profile.days_available ?? project?.days,
          components: profile.components ?? undefined,
          ...extra, ...payloadExtra,
        },
        [],
        (c) => setText((t) => t + c),
      );
      if (projectId) await saveDoc(projectId, section, full);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed.");
    } finally { setBusy(false); }
  };

  return { text, busy, error, generate };
}

const SectionView: React.FC<{
  title: string; icon: React.ReactNode; projectId?: string; mode: MentorMode; cta: string;
}> = ({ title, icon, projectId, mode, cta }) => {
  const { text, busy, error, generate } = useMentorDoc(projectId, mode);
  return (
    <Panel
      title={title}
      icon={icon}
      action={
        <button onClick={() => generate()} disabled={busy}
          className="flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 text-[11px] text-primary disabled:opacity-50">
          <RefreshCw className={busy ? "h-3 w-3 animate-spin" : "h-3 w-3"} /> {text ? "Regenerate" : cta}
        </button>
      }
    >
      {error && <p className="text-sm text-destructive">{error}</p>}
      {!text && busy && <Loading />}
      {!text && !busy && <p className="text-sm text-muted-foreground">Press “{cta}” and JARVIS will generate this for your project, class level and budget.</p>}
      {text && <Markdown text={text} />}
    </Panel>
  );
};

/* ---------------- project detail workspace ---------------- */

const TABS: Array<{ key: MentorMode; label: string }> = [
  { key: "detail", label: "Workspace" },
  { key: "build", label: "Build Mode" },
  { key: "model", label: "Model Design" },
  { key: "budget", label: "Budget" },
  { key: "experiment", label: "Experiment" },
  { key: "judge", label: "Judge Q&A" },
  { key: "presentation", label: "Presentation" },
];

export function JSProjectDetail() {
  const { id } = useParams();
  const project = id ? getProject(id) : undefined;
  const [tab, setTab] = useState<MentorMode>("detail");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase.from("js_saved_projects").select("id").eq("project_id", id).maybeSingle()
      .then(({ data }) => setSaved(!!data));
  }, [id]);

  if (!project) return <Panel><p className="text-sm text-muted-foreground">Project not found.</p></Panel>;

  const toggleSave = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    if (saved) {
      await supabase.from("js_saved_projects").delete().eq("project_id", project.id).eq("user_id", u.user.id);
      setSaved(false);
    } else {
      await supabase.from("js_saved_projects").insert([{
        user_id: u.user.id, project_id: project.id, title: project.title, meta: project as unknown as never,
      }]);
      setSaved(true);
    }
  };

  return (
    <div className="space-y-4">
      <Panel>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-primary leading-snug">{project.title}</h1>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Chip tone="primary">{project.subject}</Chip>
              <Chip>{DIFFICULTY_META[project.difficulty].emoji} {project.difficulty}</Chip>
              <Chip>{CLASS_LABELS[project.minClass]}–{CLASS_LABELS[project.maxClass]}</Chip>
              <Chip>₹{project.costMin}–₹{project.costMax} (est.)</Chip>
              <Chip>{project.type} model</Chip>
              {project.ai && <Chip tone="accent">AI component</Chip>}
              <Chip>{project.competition} level</Chip>
              <Chip>~{project.days} days</Chip>
              <Chip tone="primary">Score {project.innovation}/100</Chip>
            </div>
          </div>
          <button onClick={toggleSave} className="shrink-0 rounded-lg border border-primary/40 p-2 text-primary hover:bg-primary/10" aria-label="Save project">
            <Star className={saved ? "h-4 w-4 fill-current" : "h-4 w-4"} />
          </button>
        </div>
      </Panel>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition ${tab === t.key ? "border-primary/60 bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-primary"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <SectionView
        key={tab}
        title={TABS.find((t) => t.key === tab)!.label}
        icon={<Hammer className="h-3.5 w-3.5 text-primary" />}
        projectId={project.id}
        mode={tab}
        cta="Generate"
      />
      <p className="text-[11px] text-muted-foreground/70 pb-6">
        Costs are estimates. Any result shown is an expected result — it must be experimentally verified by you.
      </p>
    </div>
  );
}

/* ---------------- picker used by tool pages ---------------- */

const ProjectPicker: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-muted/40 rounded-md px-2 py-2 text-xs">
    <option value="">Select a project…</option>
    {PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
  </select>
);

function ToolPage({ title, icon, mode, cta }: { title: string; icon: React.ReactNode; mode: MentorMode; cta: string }) {
  const [pid, setPid] = useState("");
  return (
    <div className="space-y-4">
      <Panel title="Choose project" icon={icon}><ProjectPicker value={pid} onChange={setPid} /></Panel>
      {pid && <SectionView key={pid + mode} title={title} icon={icon} projectId={pid} mode={mode} cta={cta} />}
    </div>
  );
}

export const JSBuild = () => <ToolPage title="Build Mode — 20 steps" icon={<Hammer className="h-3.5 w-3.5 text-primary" />} mode="build" cta="Build this project" />;
export const JSBudget = () => <ToolPage title="Budget Planner" icon={<Wallet className="h-3.5 w-3.5 text-primary" />} mode="budget" cta="Plan budget" />;
export const JSDesigner = () => <ToolPage title="Model Designer" icon={<Ruler className="h-3.5 w-3.5 text-primary" />} mode="model" cta="Design my model" />;
export const JSExperiment = () => <ToolPage title="Experiment Lab" icon={<Beaker className="h-3.5 w-3.5 text-primary" />} mode="experiment" cta="Design experiment" />;

/* ---------------- knowledge ---------------- */

export function JSKnowledge() {
  const { profile, save } = useJSProfile();
  const [topic, setTopic] = useState("");
  const { text, busy, error, generate } = useMentorDoc(undefined, "explain");
  return (
    <div className="space-y-4">
      <Panel title="Knowledge Engine" icon={<BookOpen className="h-3.5 w-3.5 text-primary" />}>
        <div className="space-y-2">
          <select value={profile.class_level ?? ""} onChange={(e) => save({ class_level: e.target.value })} className="w-full bg-muted/40 rounded-md px-2 py-2 text-xs">
            <option value="">Select your class…</option>
            {Object.values(CLASS_LABELS).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex gap-2">
            <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Electromagnetic induction"
              className="flex-1 bg-muted/40 rounded-md px-2 py-2 text-xs outline-none" />
            <button onClick={() => generate({ topic, classLevel: profile.class_level })} disabled={!topic || busy}
              className="rounded-md border border-primary/40 bg-primary/10 px-3 text-xs text-primary disabled:opacity-50">Explain</button>
          </div>
        </div>
      </Panel>
      {error && <Panel className="border-destructive/50"><p className="text-sm text-destructive">{error}</p></Panel>}
      {busy && !text && <Panel><Loading /></Panel>}
      {text && <Panel title={topic}><Markdown text={text} /></Panel>}
    </div>
  );
}

/* ---------------- judge simulation ---------------- */

const JUDGE_QUESTIONS = [
  "Why is this project needed?",
  "What is the scientific principle behind it?",
  "What is your hypothesis?",
  "What makes your project innovative?",
  "What are your independent and dependent variables?",
  "How did you collect your data?",
  "How accurate is your model?",
  "What are the limitations?",
  "What happens if a sensor fails?",
  "Can this work in the real world, and at what cost?",
];

export function JSJudge() {
  const [pid, setPid] = useState("");
  const [qi, setQi] = useState(0);
  const [answer, setAnswer] = useState("");
  const { text, busy, error, generate } = useMentorDoc(undefined, "judge-eval");
  const project = pid ? getProject(pid) : undefined;

  return (
    <div className="space-y-4">
      <Panel title="Judge Simulation" icon={<Mic2 className="h-3.5 w-3.5 text-primary" />}>
        <ProjectPicker value={pid} onChange={setPid} />
        {project && (
          <div className="mt-3 space-y-2">
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
              <span className="text-[10px] tracking-widest text-primary">JUDGE</span>
              <p className="mt-1">{JUDGE_QUESTIONS[qi]}</p>
            </div>
            <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={4} placeholder="Answer in your own words…"
              className="w-full bg-muted/40 rounded-md p-2 text-sm outline-none" />
            <div className="flex gap-2">
              <button onClick={() => generate({ project, question: JUDGE_QUESTIONS[qi], answer })} disabled={!answer || busy}
                className="rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs text-primary disabled:opacity-50">Evaluate my answer</button>
              <button onClick={() => { setQi((qi + 1) % JUDGE_QUESTIONS.length); setAnswer(""); }}
                className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground">Next question</button>
            </div>
          </div>
        )}
      </Panel>
      {error && <Panel className="border-destructive/50"><p className="text-sm text-destructive">{error}</p></Panel>}
      {busy && !text && <Panel><Loading label="Judge is evaluating" /></Panel>}
      {text && <Panel title="Feedback"><Markdown text={text} /></Panel>}
      {pid && <SectionView title="Likely judge questions" icon={<Mic2 className="h-3.5 w-3.5 text-primary" />} projectId={pid} mode="judge" cta="Prepare me for judges" />}
    </div>
  );
}

/* ---------------- data lab ---------------- */

interface Row { trial: string; independent: string; dependent: string }

export function JSDataLab() {
  const [title, setTitle] = useState("");
  const [iv, setIv] = useState("");
  const [dv, setDv] = useState("");
  const [rows, setRows] = useState<Row[]>([{ trial: "1", independent: "", dependent: "" }]);
  const [status, setStatus] = useState("");

  const save = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setStatus("Sign in to save experiments."); return; }
    const { error } = await supabase.from("js_experiments").insert([{
      user_id: u.user.id, title: title || "Untitled experiment",
      independent_var: iv, dependent_var: dv, rows: rows as unknown as never,
    }]);
    setStatus(error ? error.message : "Experiment data saved.");
  };

  const nums = rows.map((r) => Number(r.dependent)).filter((n) => !Number.isNaN(n));
  const mean = nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2) : "—";
  const max = nums.length ? Math.max(...nums) : 0;

  return (
    <div className="space-y-4">
      <Panel title="Data Lab" icon={<BarChart3 className="h-3.5 w-3.5 text-primary" />}>
        <div className="grid gap-2 sm:grid-cols-3 text-xs">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Experiment title" className="bg-muted/40 rounded-md px-2 py-2 outline-none" />
          <input value={iv} onChange={(e) => setIv(e.target.value)} placeholder="Independent variable" className="bg-muted/40 rounded-md px-2 py-2 outline-none" />
          <input value={dv} onChange={(e) => setDv(e.target.value)} placeholder="Dependent variable" className="bg-muted/40 rounded-md px-2 py-2 outline-none" />
        </div>

        <div className="mt-3 space-y-2">
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 text-xs">
              <input value={r.trial} onChange={(e) => setRows(rows.map((x, k) => k === i ? { ...x, trial: e.target.value } : x))} className="bg-muted/40 rounded-md px-2 py-1.5" />
              <input value={r.independent} onChange={(e) => setRows(rows.map((x, k) => k === i ? { ...x, independent: e.target.value } : x))} placeholder={iv || "IV"} className="bg-muted/40 rounded-md px-2 py-1.5" />
              <input value={r.dependent} onChange={(e) => setRows(rows.map((x, k) => k === i ? { ...x, dependent: e.target.value } : x))} placeholder={dv || "DV"} className="bg-muted/40 rounded-md px-2 py-1.5" />
            </div>
          ))}
          <button onClick={() => setRows([...rows, { trial: String(rows.length + 1), independent: "", dependent: "" }])}
            className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground">+ Add trial</button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <Chip tone="primary">Mean {mean}</Chip>
          <Chip>Trials {rows.length}</Chip>
          <button onClick={save} className="ml-auto rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-primary">Save data</button>
        </div>
        {status && <p className="mt-2 text-xs text-muted-foreground">{status}</p>}
      </Panel>

      <Panel title="Quick chart">
        <div className="flex h-40 items-end gap-1.5">
          {rows.map((r, i) => {
            const v = Number(r.dependent);
            const h = !Number.isNaN(v) && max > 0 ? Math.max(4, (v / max) * 100) : 4;
            return <div key={i} className="flex-1 rounded-t bg-primary/60" style={{ height: `${h}%` }} title={`${r.independent}: ${r.dependent}`} />;
          })}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground/70">Expected trends only — conclusions must come from your own verified measurements.</p>
      </Panel>
    </div>
  );
}

/* ---------------- saved ---------------- */

export function JSSaved() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Array<{ id: string; project_id: string; title: string }>>([]);

  const load = () => supabase.from("js_saved_projects").select("id,project_id,title").order("created_at", { ascending: false })
    .then(({ data }) => setItems(data ?? []));
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-3">
      <Panel title="Saved Projects" icon={<Star className="h-3.5 w-3.5 text-primary" />}>
        {items.length === 0 && <p className="text-sm text-muted-foreground">Nothing saved yet — star a project in the Project Lab.</p>}
        <div className="space-y-2">
          {items.map((it) => (
            <div key={it.id} className="flex items-center gap-2 rounded-lg border border-primary/25 bg-background/40 px-3 py-2">
              <button className="flex-1 text-left text-sm" onClick={() => navigate(`/js-center/project/${it.project_id}`)}>{it.title}</button>
              <button onClick={async () => { await supabase.from("js_saved_projects").delete().eq("id", it.id); load(); }}
                className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
