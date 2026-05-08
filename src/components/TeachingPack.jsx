export default function TeachingPack({ items, onDownload }) {
  return <section className="card p-6"><h3 className="text-xl font-semibold mb-3">My LCT Teaching Pack</h3><ul className="list-disc ml-5 space-y-1">{items.map((i,idx)=><li key={idx}>{i.title}</li>)}</ul><button onClick={onDownload} className="mt-4 px-4 py-2 rounded-lg bg-accent text-white">Download My Teaching Pack</button></section>;
}
