import { CheckCircle2, Circle, MinusCircle } from 'lucide-react';

function statusCopy(status) {
  if (status === 'best') return { label: 'Strong pick', Icon: CheckCircle2, className: 'border-black bg-black text-white' };
  if (status === 'partial') return { label: 'Partly', Icon: MinusCircle, className: 'border-black bg-neutral-100 text-black' };
  if (status === 'miss') return { label: 'Reconsider', Icon: Circle, className: 'border-neutral-400 bg-white text-neutral-500' };
  return { label: 'Choose', Icon: Circle, className: 'border-neutral-200 bg-white text-black hover:border-black hover:bg-neutral-50' };
}

export default function SentenceSelector({ sentences, selected, onSelect, statuses = [] }) {
  return (
    <div className="grid gap-3">
      {sentences.map((sentence, index) => {
        const active = selected === index;
        const status = active ? statuses[index] : undefined;
        const { label, Icon, className } = statusCopy(status);

        return (
          <button
            key={sentence}
            type="button"
            onClick={() => onSelect(index)}
            className={`group rounded-none border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${className}`}
            aria-pressed={active}
          >
            <span className="mb-3 flex items-center justify-between gap-3">
              <span className="mono-label">Sentence {index + 1}</span>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em]">
                <Icon size={16} aria-hidden="true" />
                {active ? label : 'Select'}
              </span>
            </span>
            <span className="block text-lg leading-8">{sentence}</span>
          </button>
        );
      })}
    </div>
  );
}
