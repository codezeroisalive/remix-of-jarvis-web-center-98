import { supabase } from "@/integrations/supabase/client";

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/js-mentor`;

export type MentorMode =
  | "chat" | "recommend" | "detail" | "build" | "judge" | "judge-eval"
  | "explain" | "presentation" | "budget" | "model" | "experiment"
  | "code" | "code-explain" | "code-debug" | "code-viva" | "code-hardware";

export interface MentorContext {
  classLevel?: string;
  subject?: string;
  competition?: string;
  budget?: string;
  days?: number | string;
  components?: string;
  project?: unknown;
  query?: string;
  topic?: string;
  question?: string;
  answer?: string;
  platform?: string;
  language?: string;
  feature?: string;
  code?: string;
  errorText?: string;
}

/** Streams JARVIS output. Calls onDelta with each text chunk. */
export async function streamMentor(
  mode: MentorMode,
  payload: MentorContext,
  messages: Array<{ role: string; content: string }>,
  onDelta: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const { data: sess } = await supabase.auth.getSession();
  const res = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${sess.session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ mode, payload, messages }),
    signal,
  });

  if (!res.ok || !res.body) {
    let msg = "JARVIS could not reach its knowledge core.";
    try { msg = (await res.json()).error ?? msg; } catch { /* ignore */ }
    throw new Error(msg);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (data === "[DONE]") continue;
      try {
        const json = JSON.parse(data);
        const delta = json.choices?.[0]?.delta?.content ?? "";
        if (delta) { full += delta; onDelta(delta); }
      } catch { /* partial frame */ }
    }
  }
  return full;
}

/** Cached per-user generated documents so a section is generated once. */
export async function loadDoc(projectId: string, section: string): Promise<string | null> {
  const { data } = await supabase
    .from("js_project_docs")
    .select("content")
    .eq("project_id", projectId)
    .eq("section", section)
    .maybeSingle();
  return data?.content ?? null;
}

export async function saveDoc(projectId: string, section: string, content: string) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return;
  await supabase
    .from("js_project_docs")
    .upsert({ user_id: u.user.id, project_id: projectId, section, content }, { onConflict: "user_id,project_id,section" });
}
