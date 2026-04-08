interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  accent: "amber" | "blue" | "white";
}

const ACCENT_STYLES = {
  amber: "text-amber-400 border-amber-400/20 bg-amber-400/5",
  blue: "text-blue-400 border-blue-400/20 bg-blue-400/5",
  white: "text-white border-slate-600 bg-slate-800/50",
} as const;

export function SummaryCard({ title, value, subtitle, accent }: SummaryCardProps) {
  const styles = ACCENT_STYLES[accent];
  return (
    <div className={`rounded-xl border p-5 ${styles}`}>
      <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">
        {title}
      </p>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      {subtitle && (
        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}
