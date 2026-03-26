"use client";

const R = 36;
const CIRCUMFERENCE = 2 * Math.PI * R; // ≈ 226.2

interface Props {
  percent: number;
  label: string;
  seen: number;
  total: number;
  size?: number;
}

export default function RadialRing({ percent, label, seen, total, size = 104 }: Props) {
  const offset = CIRCUMFERENCE * (1 - percent / 100);

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
          fill="none" stroke="#e4e4e7" strokeWidth="8"
        />
        {/* Progress arc */}
        <circle
          cx="50" cy="50" r={R}
          fill="none"
          stroke="#18181b"
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
          fill="#18181b"
        >
          {percent}%
        </text>
        {/* seen/total */}
        <text
          x="50" y="62"
          textAnchor="middle"
          fontSize="9"
          fill="#a1a1aa"
        >
          {seen}/{total}
        </text>
      </svg>
      <span className="max-w-[88px] text-center text-xs font-medium leading-tight text-zinc-600">
        {label}
      </span>
    </div>
  );
}
