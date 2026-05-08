export default function StepCard({ title, instruction, children, feedback, onNext, step }) {
  return (
    <section className="card p-6 space-y-4">
      <p className="text-sm text-indigo-700 font-medium">{step}</p>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p>{instruction}</p>
      {children}
      {feedback && <div className="rounded-lg bg-indigo-50 p-4 text-sm">{feedback}</div>}
      {onNext && <button onClick={onNext} className="px-4 py-2 rounded-lg bg-accent text-white">Continue</button>}
    </section>
  );
}
