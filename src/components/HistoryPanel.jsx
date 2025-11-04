import { Clock } from "lucide-react";

export default function HistoryPanel({ items = [], onSelect }) {
  if (!items.length) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-medium text-slate-300">Recent explanations</h3>
      </div>
      <ul className="space-y-2">
        {items.map((it, idx) => (
          <li key={idx}>
            <button
              onClick={() => onSelect?.(it)}
              className="w-full text-left rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-white/10 px-3 py-2 text-sm text-slate-200"
            >
              {it.query.length > 90 ? it.query.slice(0, 90) + "…" : it.query}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
