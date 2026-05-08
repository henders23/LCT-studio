import { motion } from 'framer-motion';

export default function FullScreenPrompt({ title, subtext, onContinue }) {
  return <motion.div initial={{opacity:0}} animate={{opacity:1}} className="fixed inset-0 bg-ink text-stone-50 grid place-items-center p-8 z-50"><div className="text-center space-y-6"><h2 className="text-4xl font-semibold">{title}</h2><p>{subtext}</p><button onClick={onContinue} className="px-5 py-2 rounded-lg bg-indigo-500">Let’s make it teachable</button></div></motion.div>;
}
