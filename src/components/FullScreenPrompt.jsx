import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function FullScreenPrompt({
  title,
  subtext,
  onContinue,
  buttonLabel = "Let's make it teachable",
  children
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-black p-6 text-white"
    >
      <motion.div
        initial={reduceMotion ? false : { y: 18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.12, duration: 0.45 }}
        className="w-full max-w-5xl"
      >
        <p className="eyebrow mb-8 text-neutral-500">Conceptual jolt</p>
        <h2 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight md:text-8xl">{title}</h2>
        {subtext && <p className="mt-8 max-w-2xl text-xl leading-8 text-neutral-300">{subtext}</p>}
        {children && <div className="mt-8 max-w-2xl">{children}</div>}
        {onContinue && (
          <button onClick={onContinue} className="mt-10 inline-flex items-center gap-3 rounded-full border border-white bg-white px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
            {buttonLabel}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
