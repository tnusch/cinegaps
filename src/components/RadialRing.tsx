"use client";

const R = 36;
const CIRCUMFERENCE = 2 * Math.PI * R; // ≈ 226.2

interface Props {
  percent: number;
  label: string;
  seen: number;
  total: number;
  size?: number;
  darkMode?: boolean;
}

export default function RadialRing({ percent, label, seen, total, size = 104, darkMode = false }: Props) {
  const offset = CIRCUMFERENCE * (1 - percent / 100);

  const trackColor  = darkMode ? "#3f3f46" : "#e4e4e7";
  const fillColor   = darkMode ? "#e4e4e7" : "#18181b";
  const mutedColor  = darkMode ? "#71717a" : "#a1a1aa";

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        aria-label={`${label}: ${percent}% coverage`}
      >
        {/* Track */}
        <circle
          cx="50" cy="50" r={R}
          fill="none" stroke={trackColor} strokeWidth="8"
        />
        {/* Progress arc */}
        <circle
          cx="50" cy="50" r={R}
          fill="none"
          stroke={fillColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        {/* Percent */}
        <text
          x="50" y="46"
          textAnchor="middle"
          fontSize="17"
          fontWeight="700"
          fill={fillColor}
        >
          {percent}%
        </text>
        {/* seen/total */}
        <text
          x="50" y="62"
          textAnchor="middle"
          fontSize="9"
          fill={mutedColor}
        >
          {seen}/{total}
        </text>
      </svg>
      <span className="max-w-22 text-center text-xs font-medium leading-tight text-zinc-600 dark:text-zinc-400">
        {label}
      </span>
    </div>
  );
}
