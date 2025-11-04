import { useState } from "react";
import { Send, Wand2 } from "lucide-react";

export default function QueryInput({ onSubmit, loading }) {
  const [value, setValue] = useState("");

  const examples = [
    "sqrt(49)",
    "square root of 144",
    "12 * 3",
    "Why does the sky look blue at noon?",
  ];

  function handleSubmit(e) {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit(value.trim());
    setValue("");
  }

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur p-4 md:p-6"
      >
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Ask ExplainMate to explain anything
            </label>
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={3}
              placeholder="e.g., sqrt(49) or \"How do vaccines work?\""
              className="w-full resize-none rounded-xl bg-slate-800/80 text-slate-100 placeholder:text-slate-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 px-4 py-3"
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {examples.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setValue(ex)}
                  className="text-xs md:text-sm rounded-full bg-slate-800/70 hover:bg-slate-800 border border-white/10 px-3 py-1.5 text-slate-300"
                >
                  <Wand2 className="inline h-3.5 w-3.5 mr-1 text-indigo-400" />
                  {ex}
                </button>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="self-end inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-3 font-medium"
          >
            <Send className="h-4 w-4" />
            Explain
          </button>
        </div>
      </form>
    </div>
  );
}
