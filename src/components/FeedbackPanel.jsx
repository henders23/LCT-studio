export default function FeedbackPanel({ response, explanation, expert, nextPrompt }) {
  return <aside className="card p-4 space-y-2"><p className="font-semibold">{response}</p><p className="text-sm">{explanation}</p><p className="text-sm italic">Expert view: {expert}</p>{nextPrompt && <p className="text-xs uppercase tracking-wide text-stone-500">Next: {nextPrompt}</p>}</aside>;
}
