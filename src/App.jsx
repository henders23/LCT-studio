import { useMemo, useState } from 'react';
import { BookOpen, FlaskConical, Home, Layers, NotebookPen } from 'lucide-react';
import StepCard from './components/StepCard';
import SentenceSelector from './components/SentenceSelector';
import FeedbackPanel from './components/FeedbackPanel';
import SemanticWaveChart from './components/SemanticWaveChart';
import FullScreenPrompt from './components/FullScreenPrompt';
import ReflectionBox from './components/ReflectionBox';
import TeachingPack from './components/TeachingPack';
import { loadState, saveState } from './utils/storage';
import { glossary } from './data/glossary';

const sentences = [
  'In the interviews, three students described avoiding seminar discussion after receiving critical feedback on their essays.',
  'One student said she felt “exposed” when asked to explain her argument in class.',
  'This suggests that feedback is not merely a response to completed work but part of the social conditions through which students come to see themselves as legitimate academic participants.'
];

export default function App() {
  const initial = useMemo(() => loadState(), []);
  const [nav, setNav] = useState('Home');
  const [choice, setChoice] = useState(null);
  const [abstractChoice, setAbstractChoice] = useState(null);
  const [jolt, setJolt] = useState(!initial.seenJolt);
  const [reflection, setReflection] = useState(initial.reflection ?? '');
  const [pack, setPack] = useState(initial.pack ?? []);

  const feedback = choice === null ? '' : choice === 1 ? 'Excellent. This is most concrete because it includes a direct student quote.' : choice === 0 ? 'Good choice. Grounded in interview evidence, though sentence 2 is even more concrete.' : 'Not quite. This moves into broader interpretation.';
  const abstractFeedback = abstractChoice === null ? '' : abstractChoice === 2 ? 'Yes. This sentence zooms out most strongly into interpretation.' : 'Useful sentence, but not the furthest abstraction.';

  function persist(next = {}) {
    saveState({ seenJolt: !jolt, reflection, pack, ...next });
  }

  function addToPack(title, content) {
    const next = [...pack, { title, content, ts: new Date().toISOString() }];
    setPack(next);
    saveState({ seenJolt: true, reflection, pack: next });
  }

  function downloadPack() {
    const text = pack.map((p) => `## ${p.title}\n${p.content}\n`).join('\n');
    const blob = new Blob([text], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'my-lct-teaching-pack.md';
    a.click();
  }

  const points = [
    { sentence: 'S1', level: 2 },
    { sentence: 'S2', level: 1 },
    { sentence: 'S3', level: 4 }
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-ink flex">
      {jolt && <FullScreenPrompt title="Be more critical." subtext="Helpful feedback? Or academic fog machine?" onContinue={() => { setJolt(false); persist({ seenJolt: true }); }} />}
      <aside className="w-64 border-r p-4 hidden md:block">
        {['Home','Concepts','Analysis Labs','Teaching Studio','My Teaching Pack','Glossary'].map((n)=><button key={n} onClick={()=>setNav(n)} className={`w-full text-left p-2 rounded-lg mb-1 ${nav===n?'bg-indigo-100':'hover:bg-stone-100'}`}>{n}</button>)}
      </aside>
      <main className="flex-1 p-6 space-y-6 max-w-5xl">
        <h1 className="text-3xl font-bold">Legitimation Code Theory Studio</h1>
        <p className="text-stone-600">Make hidden rules of academic writing visible, analysable and teachable.</p>

        <div className="grid md:grid-cols-3 gap-4">
          {[['Semantic Gravity','8 min',Home],['Semantic Waves','10 min',Layers],['Feedback Transformer','12 min',NotebookPen]].map(([t,m,Icon])=><div key={t} className="card p-4"><Icon className="mb-2" /><h3 className="font-semibold">{t}</h3><p className="text-sm text-stone-500">{m}</p></div>)}
        </div>

        <StepCard step="Step 1 of 3: Find the concrete anchor" title="First micro-analysis" instruction="Which sentence is closest to a specific example?" feedback={feedback}>
          <SentenceSelector sentences={sentences} selected={choice} onSelect={setChoice} />
        </StepCard>

        {choice !== null && <StepCard step="Step 2 of 3: Move toward abstraction" title="Build the wave" instruction="Which sentence moves furthest towards abstraction?" feedback={abstractFeedback}>
          <SentenceSelector sentences={sentences} selected={abstractChoice} onSelect={setAbstractChoice} />
        </StepCard>}

        {abstractChoice !== null && <div className="grid md:grid-cols-2 gap-4"><SemanticWaveChart points={points} /><FeedbackPanel response="You are building a wave." explanation="Strong writing often moves down into evidence and up into interpretation." expert="Look for named contexts, observable actions, and then conceptual claims." nextPrompt="How might you use this move with students?" /></div>}

        <section className="card p-6 space-y-4">
          <h3 className="text-xl font-semibold">Reflection</h3>
          <p>“What is this paragraph actually doing?”</p>
          <ReflectionBox value={reflection} onChange={(v)=>{ setReflection(v); saveState({ seenJolt: true, reflection: v, pack }); }} />
          <button onClick={() => addToPack('Reflection: Paragraph work', reflection || 'No reflection text entered.')} className="px-4 py-2 rounded-lg bg-accent text-white">Save to My Teaching Pack</button>
        </section>

        <TeachingPack items={pack} onDownload={downloadPack} />

        <section className="card p-6"><h3 className="text-xl font-semibold mb-3">Glossary</h3>{glossary.map(([term,def])=><details key={term} className="mb-2"><summary className="font-medium cursor-pointer">{term}</summary><p className="text-sm mt-1">{def}</p></details>)}</section>
      </main>
    </div>
  );
}
