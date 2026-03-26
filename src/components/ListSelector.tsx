"use client";

import type { CanonicalList } from "../lib/types";

interface Props {
  lists: CanonicalList[];
  selected: Set<string>;
  onChange: (selected: Set<string>) => void;
}

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

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
        Compare against
      </h2>
      <div className="flex flex-wrap gap-2">
        {lists.map((list) => {
          const active = selected.has(list.id);
          return (
            <button
              key={list.id}
              onClick={() => toggle(list.id)}
              title={list.description}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-300 text-zinc-600 hover:border-zinc-500"
              }`}
            >
              {list.shortName}
            </button>
          );
        })}
      </div>
    </div>
  );
}
