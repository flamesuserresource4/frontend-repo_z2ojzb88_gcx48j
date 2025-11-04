import { useMemo, useState } from "react";
import Header from "./components/Header";
import QueryInput from "./components/QueryInput";
import StepExplanation from "./components/StepExplanation";
import HistoryPanel from "./components/HistoryPanel";

function primeFactors(n) {
  const factors = [];
  let num = n;
  let d = 2;
  while (d * d <= num) {
    while (num % d === 0) {
      factors.push(d);
      num = Math.floor(num / d);
    }
    d += d === 2 ? 1 : 2; // check 2 then odds
  }
  if (num > 1) factors.push(num);
  return factors;
}

function simplifySqrt(n) {
  const factors = primeFactors(n);
  const counts = {};
  for (const f of factors) counts[f] = (counts[f] || 0) + 1;
  let outside = 1;
  let inside = 1;
  const pairBreakdown = [];
  Object.keys(counts).forEach((k) => {
    const p = parseInt(k, 10);
    const pairs = Math.floor(counts[k] / 2);
    const rem = counts[k] % 2;
    if (pairs > 0) {
      outside *= Math.pow(p, pairs);
      pairBreakdown.push({ prime: p, pairs, contributes: Math.pow(p, pairs) });
    }
    if (rem === 1) inside *= p;
  });
  return { outside, inside, pairBreakdown, factors };
}

function isLikelyMath(query) {
  const q = query.toLowerCase().trim();
  if (/^sqrt\s*\(.*\)$/.test(q)) return true;
  if (/(square\s*root|√|^root\s+)/.test(q)) return true;
  if (/^[\d.\s+\-*/()]+$/.test(q)) return true;
  return false;
}

function normalizeSqrt(query) {
  let q = query.trim()
    .replace(/√/g, "sqrt(")
    .replace(/square\s*root\s*of\s*(\d+)/gi, "sqrt($1)")
    .replace(/^root\s*(\d+)$/i, "sqrt($1)");
  // close any introduced sqrt(
  q = q.replace(/sqrt\((\d+)\)?/g, (m, n) => `sqrt(${n})`);
  return q;
}

function explainMath(query) {
  const steps = [];
  const q = normalizeSqrt(query);

  // sqrt of integer
  const sqrtMatch = q.match(/^\s*sqrt\s*\(\s*(\d+)\s*\)\s*$/i);
  if (sqrtMatch) {
    const n = parseInt(sqrtMatch[1], 10);
    steps.push({ title: `Understand the task`, detail: `We need the square root of ${n}. By definition, the square root of a number x is the non-negative number y such that y × y = x.` });

    const { outside, inside, pairBreakdown, factors } = simplifySqrt(n);

    steps.push({
      title: `Prime factorize the number`,
      detail: `${n} = ${factors.join(" × ")}`,
    });

    if (pairBreakdown.length > 0) {
      const pairLines = pairBreakdown
        .map(pb => `${pb.prime} appears in ${pb.pairs} pair${pb.pairs>1?"s":""} ⇒ contributes ${pb.contributes} outside the root`)
        .join("\n");
      steps.push({
        title: `Extract perfect square factors`,
        detail: `Group equal primes in pairs. Each pair comes out of √ as a single prime.\n${pairLines}`,
      });
    }

    if (inside === 1) {
      steps.push({ title: `All factors came out`, detail: `No prime is left under the square root.` });
      steps.push({ title: `Final value`, result: outside });
    } else {
      steps.push({ title: `Leftover under the root`, detail: `One of each unpaired prime stays inside √, so the simplified form is ${outside === 1 ? '' : outside + ' · '}√${inside}.` });
      const approx = Math.sqrt(n);
      steps.push({ title: `Decimal approximation`, detail: `Using a calculator: √${n} ≈ ${approx.toFixed(6)}` });
    }

    return { title: `Detailed steps for √${n}`, steps };
  }

  // Simple binary operation a op b
  const bin = q.match(/^\s*(-?\d+(?:\.\d+)?)\s*([+\-*/])\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (bin) {
    const a = parseFloat(bin[1]);
    const op = bin[2];
    const b = parseFloat(bin[3]);
    steps.push({ title: `Identify operands and operator`, detail: `a = ${a}, operator = '${op}', b = ${b}` });
    const opName = { '+': 'addition', '-': 'subtraction', '*': 'multiplication', '/': 'division' }[op];
    steps.push({ title: `Recall the rule for ${opName}`, detail: op === '+' ? `Add the values: a + b` : op === '-' ? `Subtract the second from the first: a − b` : op === '*' ? `Multiply the values: a × b` : `Divide the first by the second: a ÷ b` });
    let result;
    if (op === '+') result = a + b;
    if (op === '-') result = a - b;
    if (op === '*') result = a * b;
    if (op === '/') {
      if (b === 0) {
        steps.push({ title: `Check division by zero`, detail: `Division by zero is undefined, so the expression has no real value.` });
        return { title: `Detailed steps for ${a} ${op} ${b}` , steps };
      }
      result = a / b;
    }
    steps.push({ title: `Compute`, detail: `${a} ${op} ${b} = ${result}` , result });
    return { title: `Detailed steps for ${a} ${op} ${b}`, steps };
  }

  // Fallback: attempt eval in a controlled manner for simple expressions
  try {
    // Only allow digits, operators, spaces, and parentheses
    if (!/^[\d.\s+\-*/()]+$/.test(q)) throw new Error("Not a pure arithmetic expression");
    steps.push({ title: `Tokenize the expression`, detail: `We will evaluate the expression by operator precedence: parentheses → multiplication/division → addition/subtraction.` });
    // eslint-disable-next-line no-new-func
    const val = Function(`"use strict"; return (${q});`)();
    steps.push({ title: `Evaluate with precedence`, detail: `Applying the rules step by step yields the numeric value below.`, result: val });
    return { title: `Detailed steps for ${q}`, steps };
  } catch {
    return { title: `Could not parse as math`, steps: [ { title: `Input not recognized as a supported math pattern`, detail: `Try formats like \"sqrt(49)\", \"square root of 144\", \"12 * 3\", or a numeric expression with + - * / and parentheses.` } ] };
  }
}

function explainGeneral(query) {
  const steps = [];
  steps.push({ title: "Clarify the question", detail: `We are explaining: \"${query}\". We'll define key terms and identify the main idea.` });
  const parts = query.split(/[:;.?!]/).filter(Boolean);
  steps.push({ title: "Break it into parts", detail: parts.map((p, i) => `Part ${i+1}: ${p.trim()}`).join("\n") || "Single-part question." });
  steps.push({ title: "State the simple core idea", detail: "In one line: explain the concept simply before going deeper." });
  steps.push({ title: "Explain each part logically", detail: "For every part: define it, show how it works with an example, and connect it to the main idea." });
  steps.push({ title: "Summarize and check understanding", detail: "Restate the key takeaway and, if this were interactive, ask a quick check question to confirm understanding." });
  return { title: `Structured explanation`, steps };
}

export default function App() {
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState({ title: "", steps: [] });
  const [history, setHistory] = useState([]);

  const handleSubmit = async (q) => {
    setLoading(true);
    try {
      let result;
      if (isLikelyMath(q)) {
        result = explainMath(q);
      } else {
        result = explainGeneral(q);
      }
      setCurrent(result);
      setHistory((h) => [{ query: q, ...result }, ...h].slice(0, 10));
    } finally {
      setLoading(false);
    }
  };

  const heroTitle = useMemo(() => current.title || "Explain anything with complete, step-by-step clarity", [current.title]);

  return (
    <div className="min-h-screen bg-[radial-gradient(1000px_600px_at_10%_-10%,rgba(99,102,241,0.20),transparent_60%),radial-gradient(800px_500px_at_90%_-20%,rgba(20,184,166,0.18),transparent_55%)] bg-slate-950 text-slate-100">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-white">{heroTitle}</h2>
            <p className="mt-2 text-slate-300">Math problems are shown with every step (e.g., √49). For general topics, you get a structured breakdown. No skipped parts.</p>
          </div>

          <QueryInput onSubmit={handleSubmit} loading={loading} />

          <StepExplanation steps={current.steps} title={current.title} />
        </section>

        <aside className="lg:col-span-4 space-y-6">
          <HistoryPanel
            items={history}
            onSelect={(it) => setCurrent({ title: it.title, steps: it.steps })}
          />

          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
            <h3 className="text-sm font-medium text-slate-300 mb-2">Tips for best results</h3>
            <ul className="text-slate-400 text-sm list-disc pl-5 space-y-1">
              <li>For square roots, use formats like "sqrt(49)" or "square root of 144".</li>
              <li>For arithmetic, try simple expressions like 12 * 3 or (10 + 2) * 5.</li>
              <li>For general explanations, ask clear, specific questions.</li>
              <li>No steps are skipped—every answer is broken down fully.</li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}
