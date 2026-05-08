import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SemanticWaveChart({ points }) {
  return <div className="card p-4 h-72"><h4 className="font-semibold mb-2">Semantic Wave</h4><ResponsiveContainer width="100%" height="90%"><LineChart data={points}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="sentence"/><YAxis domain={[1,4]} ticks={[1,2,3,4]} /><Tooltip /><Line type="monotone" dataKey="level" stroke="#4338ca" strokeWidth={3}/></LineChart></ResponsiveContainer><p className="text-xs">1=Concrete example, 4=Theoretical abstraction</p></div>;
}
