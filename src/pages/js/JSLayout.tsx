import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Brain, FlaskConical, BookOpen, Hammer, Beaker, Mic2, Wallet,
  Ruler, BarChart3, Star, Menu, X, ArrowLeft, GraduationCap, Code2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/js-center", end: true, label: "JARVIS Chat", icon: Brain },
  { to: "/js-center/lab", label: "Project Lab", icon: FlaskConical },
  { to: "/js-center/knowledge", label: "Knowledge", icon: BookOpen },
  { to: "/js-center/build", label: "Build Mode", icon: Hammer },
  { to: "/js-center/code", label: "Code Lab", icon: Code2 },
  { to: "/js-center/experiment", label: "Experiment Lab", icon: Beaker },
  { to: "/js-center/judge", label: "Judge Mode", icon: Mic2 },
  { to: "/js-center/budget", label: "Budget Planner", icon: Wallet },
  { to: "/js-center/designer", label: "Model Designer", icon: Ruler },
  { to: "/js-center/data", label: "Data Lab", icon: BarChart3 },
  { to: "/js-center/saved", label: "Saved Projects", icon: Star },
];

export default function JSLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const nav = (
    <nav className="flex flex-col gap-1 p-3">
      {NAV.map((n) => (
        <NavLink
          key={n.to}
          to={n.to}
          end={n.end}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all border",
              isActive
                ? "bg-primary/15 text-primary border-primary/40 shadow-[0_0_15px_hsla(195,100%,55%,0.2)]"
                : "text-muted-foreground border-transparent hover:bg-primary/5 hover:text-primary",
            )
          }
        >
          <n.icon className="h-4 w-4 shrink-0" />
          <span className="truncate">{n.label}</span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <div className="pointer-events-none fixed inset-0 opacity-40 [background:radial-gradient(circle_at_20%_0%,hsl(var(--primary)/0.18),transparent_45%),radial-gradient(circle_at_80%_100%,hsl(var(--primary)/0.12),transparent_45%)]" />

      {/* Desktop nav */}
      <aside className="hidden md:flex w-[240px] shrink-0 flex-col border-r border-primary/20 bg-background/60 backdrop-blur-xl relative z-10">
        <div className="flex items-center gap-2 px-4 py-4 border-b border-primary/20">
          <GraduationCap className="h-5 w-5 text-primary" />
          <div>
            <div className="text-sm font-bold tracking-widest text-primary">JS CENTER</div>
            <div className="text-[10px] tracking-widest text-muted-foreground">SCIENCE MENTOR</div>
          </div>
        </div>
        {nav}
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-auto m-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to JARVIS
        </button>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-background/80 backdrop-blur" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[260px] bg-background border-r border-primary/25 overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-4 border-b border-primary/20">
              <span className="text-sm font-bold tracking-widest text-primary">JS CENTER</span>
              <button onClick={() => setOpen(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            {nav}
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 relative z-10 flex flex-col">
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-primary/20 bg-background/70 backdrop-blur-xl sticky top-0 z-20">
          <button onClick={() => setOpen(true)}><Menu className="h-5 w-5 text-primary" /></button>
          <span className="text-sm font-bold tracking-widest text-primary">JS CENTER</span>
        </header>
        <main className="flex-1 p-4 md:p-6 max-w-5xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
