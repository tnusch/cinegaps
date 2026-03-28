"use client";

import type { CanonicalList, ListCategory } from "../lib/types";

interface Props {
  lists: CanonicalList[];
  selected: Set<string>;
  onChange: (selected: Set<string>) => void;
}

const CATEGORY_META: Record<ListCategory, { label: string; description: string }> = {
  critics: { label: "Critics' Consensus", description: "Curated by critics and film scholars" },
  fans:    { label: "Fan Favorites",      description: "Rated and loved by audiences" },
  awards:  { label: "Award Winners",      description: "Recognised by major film institutions" },
};

const CATEGORY_ORDER: ListCategory[] = ["critics", "fans", "awards"];

export default function ListSelector({ lists, selected, onChange }: Props) {
  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onChange(next);
  }

  function toggleCategory(category: ListCategory) {
    const categoryIds = lists.filter((l) => l.category === category).map((l) => l.id);
    const allActive = categoryIds.every((id) => selected.has(id));
    const next = new Set(selected);
    if (allActive) {
      categoryIds.forEach((id) => next.delete(id));
    } else {
      categoryIds.forEach((id) => next.add(id));
    }
    onChange(next);
  }

  return (
    <div className="space-y-6">
      {CATEGORY_ORDER.map((category) => {
        const categoryLists = lists.filter((l) => l.category === category);
        if (categoryLists.length === 0) return null;
        const allActive = categoryLists.every((l) => selected.has(l.id));
        const someActive = categoryLists.some((l) => selected.has(l.id));

        return (
          <div key={category}>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {CATEGORY_META[category].label}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {CATEGORY_META[category].description}
                </p>
              </div>
              <button
                onClick={() => toggleCategory(category)}
                className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
              >
                {allActive ? "Deselect all" : someActive ? "Select all" : "Select all"}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {categoryLists.map((list) => {
                const active = selected.has(list.id);
                return (
                  <button
                    key={list.id}
                    onClick={() => toggle(list.id)}
                    className={`text-left rounded-xl border-2 p-3 transition-colors ${
                      active
                        ? "border-zinc-900 bg-zinc-900 dark:border-zinc-100 dark:bg-zinc-100"
                        : "border-zinc-200 bg-white hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-500"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-xs font-semibold leading-tight ${
                        active ? "text-white dark:text-zinc-900" : "text-zinc-900 dark:text-zinc-100"
                      }`}>
                        {list.name}
                      </p>
                      <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium tabular-nums ${
                        active
                          ? "bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900"
                          : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}>
                        {list.films.length}
                      </span>
                    </div>
                    <p className={`mt-1 text-[10px] leading-snug ${
                      active ? "text-white/70 dark:text-zinc-900/70" : "text-zinc-500 dark:text-zinc-400"
                    }`}>
                      {list.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
