import { CheckCircle2 } from "lucide-react";

export default function StepExplanation({ steps, title }) {
  if (!steps || steps.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 text-slate-400">
        No explanation yet. Ask something above to see the full breakdown.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 md:p-6">
      {title && (
        <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
      )}
      <ol className="space-y-4">
        {steps.map((step, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <div className="mt-0.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="font-medium text-slate-100">Step {idx + 1}: {step.title}</p>
              {step.detail && (
                <p className="text-slate-300 whitespace-pre-wrap mt-1">{step.detail}</p>
              )}
              {step.result !== undefined && (
                <div className="mt-2 rounded-lg bg-slate-800/80 border border-white/10 p-3">
                  <p className="text-sm text-slate-200"><span className="text-slate-400">Result:</span> {String(step.result)}</p>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
