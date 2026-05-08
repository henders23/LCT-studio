import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Brain,
  FlaskConical,
  Gauge,
  NotebookPen,
  PenLine,
  Waves
} from 'lucide-react';
import StepCard from './components/StepCard';
import SentenceSelector from './components/SentenceSelector';
import FeedbackPanel from './components/FeedbackPanel';
import SemanticWaveChart from './components/SemanticWaveChart';
import FullScreenPrompt from './components/FullScreenPrompt';
import ReflectionBox from './components/ReflectionBox';
import TeachingPack, { TeachingPackSaver } from './components/TeachingPack';
import DragToPlane from './components/DragToPlane';
import { loadState, saveState } from './utils/storage';
import { glossary } from './data/glossary';

const navItems = ['Home', 'Concepts', 'Analysis Labs', 'Teaching Studio', 'My Teaching Pack', 'Glossary'];

const diagnosticOptions = [
  'My students describe but do not analyse.',
  'My students struggle to connect evidence and theory.',
  'I want better language for feedback.',
  'I want to design more discipline-specific EAP teaching.',
  'I want to understand LCT properly.',
  'I am just LCT-curious.'
];

const microSentences = [
  'In the interviews, three students described avoiding seminar discussion after receiving critical feedback on their essays.',
  'One student said she felt "exposed" when asked to explain her argument in class.',
  'This suggests that feedback is not merely a response to completed work but part of the social conditions through which students come to see themselves as legitimate academic participants.'
];

const gravityQuestions = [
  {
    step: 'Step 1 of 4: Find the concrete anchor',
    title: 'Which sentence is closest to a specific example?',
    best: [1],
    partial: [0],
    feedback: {
      best: 'Excellent. The direct quotation makes this sentence strongly tied to a specific student experience.',
      partial: 'Good. This sentence is grounded in interview data, although the next sentence is even more specific.',
      miss: 'Not quite. This sentence is doing broader interpretive work rather than anchoring the paragraph in a specific case.'
    },
    expert: 'The key clue is voice: a named student experience appears through a direct quotation.'
  },
  {
    step: 'Step 2 of 4: Move towards abstraction',
    title: 'Which sentence moves furthest towards abstraction?',
    best: [2],
    partial: [],
    feedback: {
      best: 'Yes. This sentence zooms out from the student quotation into a broader interpretation about academic participation.',
      partial: '',
      miss: 'Useful sentence, but it is not the furthest move away from the concrete student experience.'
    },
    expert: 'Look for conceptual nouns and broader claims: social conditions, legitimacy and participation all lift the sentence away from the event.'
  },
  {
    step: 'Step 3 of 4: Name the movement',
    title: 'Where does the paragraph connect evidence back to argument?',
    best: [2],
    partial: [0],
    feedback: {
      best: 'Exactly. This is where the paragraph asks the example to do analytical work.',
      partial: 'Partly. This sentence supplies evidence, but the argumentative connection happens later.',
      miss: 'Not quite. The direct quote is powerful, but it still needs interpretation.'
    },
    expert: 'This is the teachable move: evidence becomes useful when the writer explains what pattern it reveals.'
  }
];

const waveSentences = [
  'In a study of first-year biology students, many participants copied definitions from lecture slides into their lab reports.',
  'For example, one student defined osmosis accurately but did not explain how it related to the potato cylinder experiment.',
  'This pattern suggests that students may reproduce scientific terminology without connecting it to observed phenomena.',
  'In this sense, successful lab writing requires not only accurate terminology but movement between conceptual understanding and empirical evidence.'
];

const expectedWave = [2, 1, 3, 4];

const feedbackChoices = [
  'Be more critical.',
  'Develop your argument.',
  'Use evidence better.',
  'Avoid description.',
  'Engage more with theory.'
];

const transformedFeedback = {
  'Be more critical.': 'You describe the example clearly, but the paragraph needs to move beyond what happened. After presenting the example, explain what broader pattern it reveals and connect that pattern to the concept of academic identity.',
  'Develop your argument.': 'Your main claim is visible, but each paragraph needs to show how the evidence changes or sharpens that claim. After each example, add one sentence that explains the implication for the argument.',
  'Use evidence better.': 'The evidence is relevant, but it is currently arriving as a list. Select the most important detail, explain what pattern it shows, and connect that pattern back to your central claim.',
  'Avoid description.': 'The paragraph gives the reader events and details, but it needs a move upwards into interpretation. After the description, explain what the example suggests about the wider issue.',
  'Engage more with theory.': 'The theory is named, but it needs to do more work. Briefly unpack the concept, then show how it changes your interpretation of the evidence.'
};

const specializationCards = [
  { id: 'lab', label: 'Lab report', ideal: 'knowledge code' },
  { id: 'journal', label: 'Reflective journal', ideal: 'knower code' },
  { id: 'case', label: 'Clinical case analysis', ideal: 'elite code' },
  { id: 'pitch', label: 'Business pitch', ideal: 'elite code' }
];

function createInitialState() {
  return {
    started: false,
    diagnostic: '',
    pack: [],
    completed: [],
    badges: [],
    dismissedJolts: [],
    ...loadState()
  };
}

function sentenceStatuses(selected, question) {
  return microSentences.map((_, index) => {
    if (selected !== index) return undefined;
    if (question.best.includes(index)) return 'best';
    if (question.partial.includes(index)) return 'partial';
    return 'miss';
  });
}

function getQuestionFeedback(selected, question) {
  if (selected === null || selected === undefined) return null;
  const type = question.best.includes(selected) ? 'best' : question.partial.includes(selected) ? 'partial' : 'miss';
  return {
    type,
    text: question.feedback[type],
    response: type === 'best' ? 'Strong move.' : type === 'partial' ? 'Partly.' : 'Not quite.'
  };
}

function buttonClass(active = false) {
  return active ? 'border-black bg-black text-white' : 'border-neutral-300 bg-white text-black hover:border-black';
}

export default function App() {
  const initial = useMemo(createInitialState, []);
  const [state, setState] = useState(initial);
  const [view, setView] = useState(initial.started ? 'Home' : 'Welcome');
  const [gravityStep, setGravityStep] = useState(0);
  const [gravityChoices, setGravityChoices] = useState({});
  const [waveIndex, setWaveIndex] = useState(0);
  const [waveRatings, setWaveRatings] = useState([]);
  const [feedbackChoice, setFeedbackChoice] = useState(feedbackChoices[0]);
  const [feedbackMove, setFeedbackMove] = useState('');
  const [feedbackDraft, setFeedbackDraft] = useState('');
  const [teachingDraft, setTeachingDraft] = useState('');
  const [specializationPlacements, setSpecializationPlacements] = useState({});
  const [reflection, setReflection] = useState('');
  const dismissedJolts = state.dismissedJolts ?? [];
  const completed = state.completed ?? [];
  const badges = state.badges ?? [];
  const pack = state.pack ?? [];

  function updateState(next) {
    setState((previous) => {
      const patch = typeof next === 'function' ? next(previous) : next;
      const merged = { ...previous, ...patch };
      saveState(merged);
      return merged;
    });
  }

  function dismissJolt(id) {
    updateState((previous) => ({ dismissedJolts: [...new Set([...(previous.dismissedJolts ?? []), id])] }));
  }

  function complete(id, badge) {
    updateState((previous) => ({
      completed: [...new Set([...(previous.completed ?? []), id])],
      badges: badge ? [...new Set([...(previous.badges ?? []), badge])] : previous.badges
    }));
  }

  function saveToPack(type, title, content) {
    updateState((previous) => ({
      pack: [
        ...(previous.pack ?? []),
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          type,
          title,
          content,
          ts: new Date().toISOString()
        }
      ]
    }));
  }

  function downloadPack() {
    const text = pack
      .map((item) => `## ${item.title}\nType: ${item.type}\nSaved: ${item.ts}\n\n${item.content}\n`)
      .join('\n---\n\n');
    const blob = new Blob([text || '# My LCT Teaching Pack\n'], { type: 'text/markdown' });
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = 'my-lct-teaching-pack.md';
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  }

  function navActive(item) {
    return view === item || (item === 'Analysis Labs' && ['Semantic Waves', 'Feedback Transformer'].includes(view));
  }

  const activeJolt = (() => {
    if (view === 'Analysis Labs' && !dismissedJolts.includes('gravity')) {
      return {
        id: 'gravity',
        title: 'The example is not the analysis.',
        subtext: 'But without the example, the analysis floats away.',
        label: 'Test the gravity'
      };
    }
    if (view === 'Semantic Waves' && !dismissedJolts.includes('waves')) {
      return {
        id: 'waves',
        title: 'Some student paragraphs do not fail because they are wrong.',
        subtext: 'They fail because they stay in one place.',
        label: 'Build the wave'
      };
    }
    if (view === 'Feedback Transformer' && !dismissedJolts.includes('feedback')) {
      return {
        id: 'feedback',
        title: 'Needs more analysis.',
        subtext: 'The most common feedback spell in the university. Powerful. Mysterious. Frequently useless.',
        label: 'Make it teachable'
      };
    }
    return null;
  })();

  if (view === 'Welcome') {
    return <Welcome onStart={() => setView('Diagnostic')} onDemo={() => { updateState({ started: true }); setView('Analysis Labs'); }} onContinue={() => { updateState({ started: true }); setView('Home'); }} />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {activeJolt && (
        <FullScreenPrompt title={activeJolt.title} subtext={activeJolt.subtext} buttonLabel={activeJolt.label} onContinue={() => dismissJolt(activeJolt.id)} />
      )}

      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-white/10 bg-black p-4 lg:border-b-0 lg:border-r lg:p-6">
          <button type="button" onClick={() => setView('Home')} className="mb-8 text-left">
            <span className="eyebrow text-neutral-500">LCT Studio</span>
            <span className="mt-2 block text-2xl font-black leading-none tracking-tight">Practice the hidden rules.</span>
          </button>

          <nav className="grid gap-2" aria-label="Main navigation">
            {navItems.map((item) => (
              <button key={item} type="button" onClick={() => setView(item)} className={`nav-item ${navActive(item) ? 'nav-item-active' : ''}`}>
                {item}
              </button>
            ))}
          </nav>

          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="eyebrow text-neutral-500">Progress</p>
            <div className="mt-3 h-1 bg-white/10">
              <div className="h-full bg-white" style={{ width: `${Math.min(100, (completed.length / 5) * 100)}%` }} />
            </div>
            <p className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-neutral-500">{completed.length} of 5 core moves completed</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {badges.map((badge) => <Badge key={badge}>{badge}</Badge>)}
            </div>
          </div>
        </aside>

        <main className="bg-neutral-50 text-black">
          {view === 'Diagnostic' && <Diagnostic state={state} updateState={updateState} setView={setView} />}
          {view === 'Home' && <Dashboard state={state} setView={setView} />}
          {view === 'Concepts' && <Concepts setView={setView} />}
          {view === 'Analysis Labs' && (
            <GravityLab
              step={gravityStep}
              setStep={setGravityStep}
              choices={gravityChoices}
              setChoices={setGravityChoices}
              saveToPack={saveToPack}
              complete={complete}
              setView={setView}
            />
          )}
          {view === 'Semantic Waves' && (
            <WaveLab
              waveIndex={waveIndex}
              setWaveIndex={setWaveIndex}
              ratings={waveRatings}
              setRatings={setWaveRatings}
              saveToPack={saveToPack}
              complete={complete}
            />
          )}
          {view === 'Feedback Transformer' && (
            <FeedbackTransformer
              choice={feedbackChoice}
              setChoice={setFeedbackChoice}
              move={feedbackMove}
              setMove={setFeedbackMove}
              draft={feedbackDraft}
              setDraft={setFeedbackDraft}
              saveToPack={saveToPack}
              complete={complete}
            />
          )}
          {view === 'Teaching Studio' && (
            <TeachingStudio
              draft={teachingDraft}
              setDraft={setTeachingDraft}
              saveToPack={saveToPack}
              complete={complete}
            />
          )}
          {view === 'My Teaching Pack' && <PackPage items={pack} onDownload={downloadPack} reflection={reflection} setReflection={setReflection} saveToPack={saveToPack} />}
          {view === 'Glossary' && <GlossaryPage placements={specializationPlacements} setPlacements={setSpecializationPlacements} />}
        </main>
      </div>
    </div>
  );
}

function Welcome({ onStart, onContinue, onDemo }) {
  const wavePoints = [
    { sentence: 'Notice', level: 3 },
    { sentence: 'Example', level: 1 },
    { sentence: 'Interpret', level: 2 },
    { sentence: 'Concept', level: 4 }
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto grid min-h-screen w-full max-w-7xl content-center gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
        <div>
          <p className="eyebrow text-neutral-500">Studio 01 - Semantic Practice</p>
          <h1 className="mt-8 max-w-4xl text-6xl font-black leading-[0.9] tracking-tight md:text-8xl">
            Legitimation Code Theory Studio
          </h1>
          <p className="mt-8 max-w-2xl text-xl leading-8 text-neutral-300">
            Make the hidden rules of academic writing visible, analysable and teachable.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <button type="button" onClick={onStart} className="button-invert">
              Start the Studio <ArrowRight size={18} aria-hidden="true" />
            </button>
            <button type="button" onClick={onContinue} className="button-dark">
              Continue My Work
            </button>
            <button type="button" onClick={onDemo} className="button-dark">
              Explore a Demo
            </button>
          </div>
        </div>

        <div className="self-end text-black">
          <SemanticWaveChart points={wavePoints} title="A paragraph learning to move" />
        </div>
      </section>
    </main>
  );
}

function Diagnostic({ state, updateState, setView }) {
  return (
    <section className="content-shell">
      <p className="eyebrow text-neutral-500">Welcome / Diagnostic</p>
      <h1 className="page-title">What brings you here?</h1>
      <p className="lead-copy">Your answer tunes the examples and feedback tone. No personality quiz theatrics. Just a useful first signal.</p>
      <div className="mt-10 grid gap-3 md:grid-cols-2">
        {diagnosticOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => updateState({ diagnostic: option })}
            className={`min-h-28 border p-5 text-left text-xl font-black leading-7 transition ${buttonClass(state.diagnostic === option)}`}
          >
            {option}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => { updateState({ started: true }); setView('Analysis Labs'); }}
        disabled={!state.diagnostic}
        className="button-primary mt-8 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Begin with a micro-analysis <ArrowRight size={18} aria-hidden="true" />
      </button>
    </section>
  );
}

function Dashboard({ state, setView }) {
  const completed = state.completed ?? [];
  const pack = state.pack ?? [];
  const cards = [
    { title: 'Start with Semantic Gravity', copy: 'Learn to spot when writing zooms in and out.', icon: Gauge, time: '8 min', view: 'Analysis Labs', focus: 'Semantic gravity' },
    { title: 'Build Semantic Waves', copy: 'Analyse how evidence and theory move together.', icon: Waves, time: '10 min', view: 'Semantic Waves', focus: 'Semantic waves' },
    { title: 'Unpack Dense Concepts', copy: 'Help students handle difficult academic terminology.', icon: Brain, time: '7 min', view: 'Concepts', focus: 'Semantic density' },
    { title: 'Specialization Codes', copy: 'Explore what different disciplines value.', icon: FlaskConical, time: '9 min', view: 'Glossary', focus: 'Codes' },
    { title: 'Feedback Transformer', copy: 'Turn vague feedback into teachable guidance.', icon: NotebookPen, time: '12 min', view: 'Feedback Transformer', focus: 'Feedback' },
    { title: 'Teaching Design Studio', copy: 'Build an LCT-informed activity for your own context.', icon: PenLine, time: '15 min', view: 'Teaching Studio', focus: 'Design' }
  ];

  return (
    <section className="content-shell">
      <div className="black-hero">
        <p className="eyebrow text-neutral-500">Studio Dashboard</p>
        <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">A practice studio, not a theory wall.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-300">
          Notice, choose, commit, compare, then try again. The work stays small enough to think with.
        </p>
        <div className="mt-8 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/10 pt-6">
          <Metric value="6" label="Available moves" />
          <Metric value={completed.length} label="Completed" />
          <Metric value={pack.length} label="Saved items" />
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ title, copy, icon: Icon, time, view, focus }) => (
          <button key={title} type="button" onClick={() => setView(view)} className="studio-panel group p-5 text-left transition hover:-translate-y-1 hover:border-black hover:shadow-[8px_8px_0_#000]">
            <div className="mb-8 flex items-start justify-between">
              <Icon size={26} aria-hidden="true" />
              <span className="mono-label text-neutral-500">{time}</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">{title}</h2>
            <p className="mt-3 min-h-12 text-sm leading-6 text-neutral-600">{copy}</p>
            <div className="mt-6 flex items-center justify-between border-t border-neutral-200 pt-4">
              <span className="mono-label text-neutral-500">{focus}</span>
              <span className="font-black">Open -></span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function Concepts({ setView }) {
  return (
    <section className="content-shell">
      <p className="eyebrow text-neutral-500">Core Concepts</p>
      <h1 className="page-title">The map is simple. The moves are subtle.</h1>
      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <ConceptPanel title="Semantic gravity" kicker="Zooming in / zooming out">
          How closely meaning is tied to a specific context, example, case, event, object or piece of data.
        </ConceptPanel>
        <ConceptPanel title="Semantic density" kicker="Packing / unpacking">
          How much meaning is condensed into words, phrases, symbols or concepts. "Neoliberal performativity" is carrying a suspiciously heavy suitcase.
        </ConceptPanel>
        <ConceptPanel title="Semantic waves" kicker="Movement matters">
          Strong academic writing often moves between concrete examples and more abstract ideas. It does not stay only in description and it does not float only in theory.
        </ConceptPanel>
        <ConceptPanel title="Specialization codes" kicker="What is being valued?">
          Different disciplines value different achievements: specialist procedures, cultivated interpretation, or both.
        </ConceptPanel>
      </div>
      <button type="button" onClick={() => setView('Analysis Labs')} className="button-primary mt-8">
        Practise with sentences <ArrowRight size={18} aria-hidden="true" />
      </button>
    </section>
  );
}

function GravityLab({ step, setStep, choices, setChoices, saveToPack, complete, setView }) {
  const question = gravityQuestions[step];
  const selected = choices[step];
  const feedback = getQuestionFeedback(selected, question);
  const statuses = sentenceStatuses(selected, question);
  const done = step >= gravityQuestions.length - 1 && selected !== undefined;
  const points = [
    { sentence: 'S1', level: 2 },
    { sentence: 'S2', level: 1 },
    { sentence: 'S3', level: 4 }
  ];

  return (
    <section className="activity-shell">
      <article className="passage-panel">
        <p className="eyebrow text-neutral-500">Sample - Feedback and Participation</p>
        <h1>Critical feedback and belonging</h1>
        <p className="passage-meta">excerpted from a qualitative analysis - 63 words - 3 sentences</p>
        <div className="passage-copy">
          {microSentences.map((sentence, index) => <p key={sentence}><sup>{index + 1}</sup> {sentence}</p>)}
        </div>
      </article>

      <aside className="activity-panel">
        <StepCard step={question.step} title={question.title} instruction="Click one sentence. You will get feedback before the next move appears.">
          <SentenceSelector
            sentences={microSentences}
            selected={selected}
            statuses={statuses}
            onSelect={(index) => setChoices((previous) => ({ ...previous, [step]: index }))}
          />
          {feedback && (
            <FeedbackPanel
              response={feedback.response}
              explanation={feedback.text}
              expert={question.expert}
              nextPrompt={done ? 'Reveal the semantic wave' : 'Commit, then continue'}
            />
          )}
          {selected !== undefined && !done && (
            <button type="button" onClick={() => setStep(step + 1)} className="button-primary">
              Next move <ArrowRight size={18} aria-hidden="true" />
            </button>
          )}
        </StepCard>

        {done && (
          <div className="space-y-5">
            <SemanticWaveChart points={points} />
            <FeedbackPanel
              response="The paragraph has movement."
              explanation="It drops into student experience, then rises into interpretation. That is the teachable pattern."
              expert="Academic writing often needs all three moves: concrete anchor, interpretation and broader claim. The problem is getting stuck."
            />
            <div className="flex flex-wrap gap-3">
              <TeachingPackSaver
                onSave={() => {
                  saveToPack('analysis', 'Semantic gravity micro-analysis', 'Sentence 2 anchors the paragraph in a direct student quotation; sentence 3 moves upward into interpretation.');
                  complete('gravity', 'Gravity Spotter');
                }}
              />
              <button type="button" onClick={() => setView('Semantic Waves')} className="button-secondary">
                Continue to waves
              </button>
            </div>
          </div>
        )}
      </aside>
    </section>
  );
}

function WaveLab({ waveIndex, setWaveIndex, ratings, setRatings, saveToPack, complete }) {
  const currentSentence = waveSentences[waveIndex];
  const selected = ratings[waveIndex];
  const completeWave = ratings.length === waveSentences.length && ratings.every(Boolean);
  const points = waveSentences.map((_, index) => ({ sentence: `S${index + 1}`, level: ratings[index] || expectedWave[index] }));
  const levelOptions = [
    [1, 'Concrete example'],
    [2, 'Specific interpretation'],
    [3, 'General claim'],
    [4, 'Theoretical abstraction']
  ];

  return (
    <section className="content-shell">
      <p className="eyebrow text-neutral-500">Analysis Lab - Semantic Waves</p>
      <h1 className="page-title">Build the wave one sentence at a time.</h1>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <StepCard
          step={`Step ${Math.min(waveIndex + 1, waveSentences.length)} of ${waveSentences.length}: Rate abstraction`}
          title={completeWave ? 'The wave is visible.' : `Rate sentence ${waveIndex + 1}`}
          instruction={completeWave ? 'Now compare the shape with the expert expectation.' : currentSentence}
        >
          {!completeWave && (
            <div className="grid gap-3">
              {levelOptions.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRatings((previous) => {
                    const next = [...previous];
                    next[waveIndex] = value;
                    return next;
                  })}
                  className={`border p-4 text-left text-lg font-black transition ${buttonClass(selected === value)}`}
                >
                  <span className="mono-label mr-3 text-current opacity-60">Level {value}</span>{label}
                </button>
              ))}
              {selected && (
                <FeedbackPanel
                  response={selected === expectedWave[waveIndex] ? 'That fits the movement.' : 'Useful, but compare the role.'}
                  explanation={selected === expectedWave[waveIndex] ? 'You are reading the sentence by what it does, not just what it mentions.' : 'Ask whether the sentence depends on a concrete case or lifts into a broader pattern.'}
                  expert={`Expert rating: ${expectedWave[waveIndex]}. ${selected === expectedWave[waveIndex] ? 'Good eye.' : 'This is the kind of judgement students need to practise explicitly.'}`}
                />
              )}
              {selected && (
                <button type="button" onClick={() => setWaveIndex(Math.min(waveIndex + 1, waveSentences.length - 1))} className="button-primary">
                  {waveIndex === waveSentences.length - 1 ? 'Reveal wave' : 'Rate next sentence'} <ArrowRight size={18} aria-hidden="true" />
                </button>
              )}
            </div>
          )}
          {completeWave && (
            <div className="space-y-4">
              <FeedbackPanel
                response="A real wave, not a flatline."
                explanation="The paragraph moves down into the potato cylinder example, then climbs back through pattern and conceptual claim."
                expert="This is why students need more than 'use evidence'. They need to learn where evidence sits in the movement of an argument."
              />
              <TeachingPackSaver
                onSave={() => {
                  saveToPack('wave', 'Biology lab report semantic wave', `Ratings: ${ratings.join(', ')}. The paragraph moves from study context to concrete experiment, then back towards pattern and conceptual claim.`);
                  complete('waves', 'Wave Builder');
                }}
              />
            </div>
          )}
        </StepCard>

        <div className="space-y-5">
          <article className="studio-panel p-5">
            <p className="eyebrow text-neutral-500">Paragraph</p>
            <div className="mt-4 space-y-4 text-lg leading-8">
              {waveSentences.map((sentence, index) => (
                <p key={sentence} className={index === waveIndex && !completeWave ? 'bg-neutral-100 p-3' : ''}><sup>{index + 1}</sup> {sentence}</p>
              ))}
            </div>
          </article>
          <SemanticWaveChart points={points} />
        </div>
      </div>
    </section>
  );
}

function FeedbackTransformer({ choice, setChoice, move, setMove, draft, setDraft, saveToPack, complete }) {
  const finalFeedback = draft || transformedFeedback[choice];

  return (
    <section className="content-shell">
      <p className="eyebrow text-neutral-500">Feedback Transformer</p>
      <h1 className="page-title">Turn academic fog into teachable movement.</h1>
      <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <StepCard step="Step 1 of 5: Name the fog" title="Choose the vague feedback spell" instruction="Pick one comment, then make it do actual teaching work.">
          <div className="grid gap-3">
            {feedbackChoices.map((item) => (
              <button key={item} type="button" onClick={() => setChoice(item)} className={`border p-4 text-left text-xl font-black transition ${buttonClass(choice === item)}`}>
                {item}
              </button>
            ))}
          </div>
          <FeedbackPanel
            response="Academic fog detected."
            explanation="The comment may be true, but it does not yet tell a student what movement to make in the paragraph."
            expert="Good feedback identifies the current move, the missing move and a next sentence the student could actually write."
          />
        </StepCard>

        <StepCard step="Step 2 of 5: Specify the missing movement" title="What movement is missing?" instruction="Choose the move the student needs to practise.">
          <div className="grid gap-3">
            {['from example to concept', 'from concept to evidence', 'from source to evaluation', 'from claim to implication'].map((item) => (
              <button key={item} type="button" onClick={() => setMove(item)} className={`border p-4 text-left font-black uppercase tracking-[0.12em] transition ${buttonClass(move === item)}`}>
                {item}
              </button>
            ))}
          </div>
          {move && (
            <>
              <FeedbackPanel
                response="Now it can teach."
                explanation={`Instead of asking for more analysis in general, the feedback can ask for movement ${move}.`}
                expert="This turns judgement into guidance: the student can see what to do next."
              />
              <ReflectionBox value={draft} onChange={setDraft} placeholder={transformedFeedback[choice]} />
              <TeachingPackSaver
                onSave={() => {
                  saveToPack('feedback', `Transformed feedback: ${choice}`, finalFeedback);
                  complete('feedback', 'Fog Disperser');
                }}
              />
            </>
          )}
        </StepCard>
      </div>
    </section>
  );
}

function TeachingStudio({ draft, setDraft, saveToPack, complete }) {
  const template = `Title: From Example to Argument: Building a Semantic Wave

Learning outcome: Students will be able to move from a concrete example to a broader analytical claim and back to evidence.

Activity stages:
1. Notice the example.
2. Identify the broader claim.
3. Add a concept.
4. Return to the evidence.
5. Write a revised analytical sentence.`;

  return (
    <section className="content-shell">
      <p className="eyebrow text-neutral-500">Teaching Design Studio</p>
      <h1 className="page-title">Build an activity your students could actually do.</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="studio-panel p-5">
          <p className="eyebrow text-neutral-500">Brief</p>
          <h2 className="mt-2 text-2xl font-black">Too descriptive / 30 minutes / Semantic waves</h2>
          <p className="mt-4 text-sm leading-6 text-neutral-700">
            The app has generated a compact teaching activity. Edit it into your own voice, then save it to the pack.
          </p>
        </div>
        <StepCard step="Step 1 of 1: Edit and save" title="Activity template" instruction="Keep the moves small: notice, choose, commit, feedback, compare.">
          <ReflectionBox value={draft || template} onChange={setDraft} />
          <TeachingPackSaver
            onSave={() => {
              saveToPack('teaching activity', 'From Example to Argument', draft || template);
              complete('teaching', 'Feedback Alchemist');
            }}
          />
        </StepCard>
      </div>
    </section>
  );
}

function PackPage({ items, onDownload, reflection, setReflection, saveToPack }) {
  return (
    <section className="content-shell">
      <TeachingPack items={items ?? []} onDownload={onDownload} />
      <div className="mt-6 studio-panel p-6">
        <p className="eyebrow text-neutral-500">Reflection</p>
        <h2 className="mt-2 text-2xl font-black">How could you use this with your students?</h2>
        <div className="mt-4">
          <ReflectionBox value={reflection} onChange={setReflection} />
        </div>
        <TeachingPackSaver onSave={() => saveToPack('reflection', 'Teaching reflection', reflection || 'No reflection text entered.')} />
      </div>
    </section>
  );
}

function GlossaryPage({ placements, setPlacements }) {
  function handlePlace(cardId, position) {
    setPlacements((previous) => ({ ...previous, [cardId]: position }));
  }

  const lastPlaced = Object.keys(placements).at(-1);
  const placedCard = specializationCards.find((card) => card.id === lastPlaced);

  return (
    <section className="content-shell">
      <p className="eyebrow text-neutral-500">Glossary + Specialization Codes</p>
      <h1 className="page-title">Definitions, then a small placement problem.</h1>
      <div className="mt-8 grid gap-3 lg:grid-cols-2">
        {glossary.map(([term, definition]) => (
          <details key={term} className="studio-panel p-5">
            <summary className="cursor-pointer text-xl font-black">{term}</summary>
            <p className="mt-3 text-sm leading-6 text-neutral-700">{definition}</p>
          </details>
        ))}
      </div>
      <div className="mt-8">
        <StepCard step="Specialization codes: place one card at a time" title="What kind of achievement is being valued?" instruction="Drag a card onto the plane. Immediate feedback appears after each placement.">
          <DragToPlane cards={specializationCards} placements={placements} onPlace={handlePlace} />
          {placedCard && (
            <FeedbackPanel
              response={`${placedCard.label}: ${placedCard.ideal}`}
              explanation="This is an approximation, not a personality test for disciplines. The point is to ask what the task rewards."
              expert="Students often need these expectations made explicit: method, evidence, gaze, stance or some combination."
            />
          )}
        </StepCard>
      </div>
    </section>
  );
}

function Metric({ value, label }) {
  return (
    <div>
      <p className="text-4xl font-black">{value}</p>
      <p className="mono-label mt-1 text-neutral-500">{label}</p>
    </div>
  );
}

function Badge({ children }) {
  return <span className="border border-white/20 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-300">{children}</span>;
}

function ConceptPanel({ title, kicker, children }) {
  return (
    <article className="studio-panel p-6">
      <p className="eyebrow text-neutral-500">{kicker}</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight">{title}</h2>
      <p className="mt-4 text-base leading-7 text-neutral-700">{children}</p>
    </article>
  );
}
