"use client";

import { useEffect, useState } from "react";

const STEPS = [
  { n: 1, label: "Select lists",    id: "step-1" },
  { n: 2, label: "Coverage",        id: "step-2" },
  { n: 3, label: "Your profile",    id: "step-3" },
  { n: 4, label: "What to watch",   id: "step-4" },
  { n: 5, label: "Explore by list", id: "step-5" },
];

export default function StepSidebar({ show }: { show: boolean }) {
  const [activeId, setActiveId] = useState(STEPS[0].id);

  useEffect(() => {
    if (!show) return;

    function update() {
      // The active step is the last section whose top edge is above a
      // trigger line ~30% down the viewport.
      const trigger = window.scrollY + window.innerHeight * 0.3;
      let current = STEPS[0].id;
      for (const step of STEPS) {
        const el = document.getElementById(step.id);
        if (el && el.offsetTop <= trigger) current = step.id;
      }
      setActiveId(current);
    }

    window.addEventListener("scroll", update, { passive: true });
    // Run once after mount so the initial section is highlighted immediately
    update();
    return () => window.removeEventListener("scroll", update);
  }, [show]);

  if (!show) return null;

  return (
    <nav className="hidden xl:flex w-36 shrink-0 flex-col sticky top-20 self-start">
      {STEPS.map((step) => {
        const active = activeId === step.id;
        return (
          <div key={step.id}>
            <button
              onClick={() =>
                document.getElementById(step.id)?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className={`w-full flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors ${
                active
                  ? "text-zinc-900 dark:text-zinc-50"
                  : "text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums transition-colors ${
                  active
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "border border-zinc-200 dark:border-zinc-700 text-zinc-400 dark:text-zinc-600"
                }`}
              >
                {step.n}
              </span>
              <span className="text-xs leading-tight">{step.label}</span>
            </button>
          </div>
        );
      })}
    </nav>
  );
}
