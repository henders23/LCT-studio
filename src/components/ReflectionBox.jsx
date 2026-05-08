export default function ReflectionBox({ value, onChange, placeholder = 'Write a short reflection...' }) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="min-h-32 w-full resize-y rounded-none border border-neutral-300 bg-white p-4 text-base leading-7 text-black transition placeholder:text-neutral-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
      placeholder={placeholder}
    />
  );
}
