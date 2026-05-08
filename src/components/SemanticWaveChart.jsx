import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const labels = {
  1: 'Concrete example',
  2: 'Specific interpretation',
  3: 'General claim',
  4: 'Theoretical abstraction'
};

export default function SemanticWaveChart({ points, title = 'Semantic Wave' }) {
  return (
    <section className="studio-panel p-5">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-neutral-500">Visualisation</p>
          <h3 className="text-2xl font-black tracking-tight">{title}</h3>
        </div>
        <p className="hidden max-w-xs text-right text-xs leading-5 text-neutral-500 sm:block">
          Down means closer to examples. Up means broader theory or generalisation.
        </p>
      </div>
      <div className="h-80" role="img" aria-label="Line chart showing movement between concrete examples and theoretical abstraction.">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 16, right: 18, bottom: 10, left: 8 }}>
            <CartesianGrid stroke="#e5e5e5" strokeDasharray="4 4" />
            <XAxis dataKey="sentence" tick={{ fill: '#111', fontSize: 12, fontWeight: 700 }} axisLine={{ stroke: '#111' }} tickLine={false} />
            <YAxis
              domain={[1, 4]}
              ticks={[1, 2, 3, 4]}
              width={128}
              tickFormatter={(value) => labels[value]}
              tick={{ fill: '#444', fontSize: 11 }}
              axisLine={{ stroke: '#111' }}
              tickLine={false}
            />
            <ReferenceLine y={2.5} stroke="#cfcfcf" strokeDasharray="3 3" />
            <Tooltip
              contentStyle={{ borderRadius: 0, border: '1px solid #111', boxShadow: 'none' }}
              formatter={(value) => [labels[value], 'Level']}
            />
            <Line type="monotone" dataKey="level" stroke="#050505" strokeWidth={4} dot={{ r: 5, fill: '#fff', stroke: '#050505', strokeWidth: 3 }} activeDot={{ r: 7 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
