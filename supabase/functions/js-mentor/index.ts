// JARVIS Science Mentor — AI engine for the JS Center (streaming)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODEL = "google/gemini-3.6-flash";

const BASE_PERSONA = `You are JARVIS, a personal AI science mentor for Indian students (Class 1 to 2nd PUC / Diploma beginners).
Voice: calm, futuristic, precise, encouraging — but always educational, never theatrical. Never quote copyrighted movie dialogue.
Rules you must always follow:
- Adapt vocabulary and depth to the student's class level.
- Costs are ESTIMATES in INR and must be labelled as estimates.
- Never invent experimental results. Say "Expected result — must be experimentally verified."
- Never guarantee a competition win. Scores are internal recommendation estimates only.
- Refuse unsafe builds (explosives, toxic chemicals, weapons, mains-voltage hacks) and offer a safe alternative.
- For computer-vision projects: no facial recognition of real people, no biometric storage, no surveillance of unaware people; use synthetic/demo data and explain privacy.
- Medical projects are educational prototypes, never diagnostic devices.
- Use clean markdown with short headings, bullet points and ASCII diagrams where a layout helps.`;

const CODE_PERSONA = `
CODE MODE RULES (apply whenever you produce programming output):
- Never claim the code was compiled, uploaded or physically tested. Say "This code is untested on your hardware — verify pins and thresholds before running."
- Always label pin numbers, calibration values and sensor thresholds as values the student MUST verify against their own wiring and sensor.
- Clearly distinguish simple threshold / rule-based logic from real machine learning. Never call an if-else a "trained AI model".
- Code must be complete and runnable-looking: all includes/imports, pin definitions, setup(), loop() or main(), comments in simple student English on every important line.
- Give library names with exact install instructions (Arduino Library Manager name, or pip install line).
- Add a wiring / pin-map table for any hardware code.
- Add a "How to upload / run" section with the exact IDE steps and board+port settings.
- Add a "Common errors and fixes" section.
- End hardware or AI code with 5 code-related viva questions a judge could ask, each with a short model answer.
- Never write code for weapons, jamming, mains-voltage switching without an opto-isolated relay warning, credential harvesting, surveillance of unaware people, or facial recognition of real people.`;

function prompt(mode: string, p: Record<string, unknown>): string {
  const ctx = `Student context: class=${p.classLevel ?? "unspecified"}, subject=${p.subject ?? "any"}, competition=${p.competition ?? "school/district"}, budget=${p.budget ?? "flexible"}, days=${p.days ?? "unspecified"}, components owned=${p.components ?? "unknown"}.`;
  const proj = p.project ? `\nProject under discussion:\n${JSON.stringify(p.project)}` : "";
  const plat = `Target platform: ${p.platform ?? "Arduino UNO (C/C++)"}. Language: ${p.language ?? "auto-pick the standard language for that platform"}.`;
  switch (mode) {

    case "recommend":
      return `${ctx}\nStudent request: "${p.query}"\nRecommend EXACTLY 5 physical/hybrid science-exhibition projects ranked best-first. For each give: Title, Subject mix, Class fit, Difficulty, Estimated cost (INR range), Competition suitability, Physical model YES/NO, AI component YES/NO, Innovation score /100, and a 2-line "Why JARVIS recommends it" tied to this student's constraints. End with one short question that would sharpen the recommendation.`;
    case "detail":
      return `${ctx}${proj}\nProduce the FULL project workspace for this project, with these sections in order, each as a markdown heading:
Problem statement, Scientific principle, AI component, Objectives, Hypothesis, Required components (table: component, qty, approx ₹, why needed, cheaper alternative), Estimated cost, Physical model design (dimensions + ASCII top view + component placement), Circuit / block diagram (ASCII), How it works, Construction steps, Software requirements, AI model requirements, Dataset requirements, Testing procedure, Variables (independent/dependent/controlled), Experimental procedure, Expected results, Graphs to collect, Advantages, Limitations, Real-world applications, Future improvements, Safety precautions, Innovation points, Questions judges may ask, Model explanation, 1-minute explanation, 3-minute explanation, 5-minute presentation, Viva questions and answers (10 Q&A).`;
    case "build":
      return `${ctx}${proj}\nGenerate BUILD MODE: the 20 numbered steps (Problem definition, Scientific principle, Objectives, Hypothesis, Materials, Budget, Physical model design, Circuit/block diagram, Construction, Programming, AI model, Training/testing, Experiment, Data collection, Graphs, Results, Conclusion, Limitations, Future scope, Competition presentation). Each step: what to do, how long it takes, and the exact checklist for this project. Include real starter code for Arduino/ESP32/Python where the step needs it.`;
    case "judge":
      return `${ctx}${proj}\nJUDGE MODE. Give 15 likely judge questions with a model student answer written in natural student language at this class level. Cover: need, principle, hypothesis, innovation, variables, data collection, accuracy, limitations, sensor failure, real-world viability, cost, improvements.`;
    case "judge-eval":
      return `${ctx}${proj}\nYou are simulating a science-fair judge. Question asked: "${p.question}". Student answer: "${p.answer}".
Reply with: Score /10, What was good, What was missing, A model answer at this student's level (max 120 words), and the next question you would ask.`;
    case "explain":
      return `${ctx}\nExplain "${p.topic}" for a student in ${p.classLevel ?? "Class 10"}. Structure: Simple explanation, Detailed explanation, Formulae (if any), Examples, Practical demonstration you can do at home/school, Common mistakes, Real-world applications, Related project ideas, Competition project opportunities.`;
    case "presentation":
      return `${ctx}${proj}\nWrite "EXPLAIN MY PROJECT" scripts in natural spoken student language, not academic language: a 30-second version, 1-minute, 3-minute, and a 5-minute competition presentation with stage directions for the physical model demo.`;
    case "budget":
      return `${ctx}${proj}\nBuild a bill of materials for budget band ${p.budget}. Markdown table: Component | Qty | Approx ₹ (estimate) | Why required | Cheaper alternative. Then total estimated cost, a "stretch it further" list, and a "what to buy first" order. Label all prices as estimates.`;
    case "model":
      return `${ctx}${proj}\nDESIGN MY MODEL. Give board dimensions, materials for the base, then ASCII TOP VIEW, FRONT VIEW and SIDE VIEW diagrams with labels, component placement list (x/y zones), wiring blocks, sensor positions, input→process→output flow, and the demonstration triggers a judge can watch.`;
    case "experiment":
      return `${ctx}${proj}\nEXPERIMENT LAB. Define the scientific question, independent variable, dependent variable, controlled variables, number of trials, a blank data table (markdown) sized for those trials, the recommended graph type and why, and how to interpret the result honestly. Remind that results must be experimentally verified.`;
    default:
      return `${ctx}${proj}\n${p.query ?? ""}`;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) {
      return new Response(JSON.stringify({ error: "AI is not configured." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const body = await req.json();
    const mode: string = body.mode ?? "chat";
    const payload = body.payload ?? {};
    const history: Array<{ role: string; content: string }> = body.messages ?? [];

    const messages = [
      { role: "system", content: BASE_PERSONA },
      ...history.slice(-12).map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: prompt(mode, payload) },
    ];

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({ model: MODEL, messages, stream: true }),
    });

    if (!res.ok) {
      const text = await res.text();
      const status = res.status === 429 || res.status === 402 ? res.status : 500;
      const msg = res.status === 429
        ? "JARVIS is receiving too many requests right now. Please retry in a moment."
        : res.status === 402
          ? "AI credits are exhausted. Please top up to continue using JARVIS."
          : `AI error: ${text.slice(0, 200)}`;
      return new Response(JSON.stringify({ error: msg }), {
        status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(res.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
