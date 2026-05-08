import { ArrowRight, Sparkles } from 'lucide-react';

export default function FeedbackPanel({ response, explanation, expert, nextPrompt, tone = 'light' }) {
  const dark = tone === 'dark';

  return (
    <aside className={dark ? 'border border-white/15 bg-black p-5 text-white' : 'border border-neutral-200 bg-neutral-50 p-5'}>
      <div className="flex items-start gap-3">
        <div className={dark ? 'grid h-9 w-9 place-items-center bg-white text-black' : 'grid h-9 w-9 place-items-center bg-black text-white'}>
          <Sparkles size={17} aria-hidden="true" />
        </div>
        <div className="space-y-3">
          <p className="text-lg font-black tracking-tight">{response}</p>
          <p className={dark ? 'text-sm leading-6 text-neutral-300' : 'text-sm leading-6 text-neutral-700'}>{explanation}</p>
          {expert && (
            <div className={dark ? 'border-t border-white/15 pt-3 text-sm leading-6 text-white' : 'border-t border-neutral-200 pt-3 text-sm leading-6 text-neutral-900'}>
              <span className="mono-label mr-2">Expert view</span>
              {expert}
            </div>
          )}
          {nextPrompt && (
            <p className={dark ? 'flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-neutral-300' : 'flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-neutral-500'}>
              Next <ArrowRight size={14} aria-hidden="true" /> {nextPrompt}
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
