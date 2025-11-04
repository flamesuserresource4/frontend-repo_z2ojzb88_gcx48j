import { BookOpen, Sparkles } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full border-b border-white/10 bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600/20 ring-1 ring-indigo-500/40 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">ExplainMate</h1>
            <p className="text-sm text-slate-400">Step-by-step explanations. No steps skipped.</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-slate-300 text-sm">
          <Sparkles className="h-4 w-4 text-yellow-300" />
          <span>Clear. Complete. Understandable.</span>
        </div>
      </div>
    </header>
  );
}
