import { ArrowRight } from 'lucide-react';

export default function StepCard({
  step,
  title,
  instruction,
  children,
  feedback,
  onNext,
  nextLabel = 'Continue'
}) {
  return (
    <section className="studio-panel p-5 md:p-7">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-neutral-200 pb-5">
        <div className="max-w-2xl">
          <p className="eyebrow text-neutral-500">{step}</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-black md:text-3xl">{title}</h2>
          {instruction && <p className="mt-3 max-w-2xl text-base leading-7 text-neutral-700">{instruction}</p>}
        </div>
      </div>

      <div className="space-y-5">{children}</div>

      {feedback && (
        <div className="mt-6 border-l-4 border-black bg-neutral-100 p-4 text-sm leading-6 text-neutral-800">
          {typeof feedback === 'string' ? feedback : feedback}
        </div>
      )}

      {onNext && (
        <button onClick={onNext} className="button-primary mt-6">
          {nextLabel}
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      )}
    </section>
  );
}
