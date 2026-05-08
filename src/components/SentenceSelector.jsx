export default function SentenceSelector({ sentences, onSelect, selected }) {
  return <div className="grid gap-3">{sentences.map((s, i) => <button key={i} onClick={() => onSelect(i)} className={`text-left p-3 rounded-xl border ${selected===i?'border-indigo-600 bg-indigo-50':'border-stone-300 hover:border-stone-500'}`}>{s}</button>)}</div>;
}
