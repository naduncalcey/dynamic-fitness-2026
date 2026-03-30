"use client";

interface NestedArrayFieldProps {
  label: string;
  items: { text: string; accent?: boolean }[];
  onChange: (items: { text: string; accent?: boolean }[]) => void;
}

export default function NestedArrayField({ label, items, onChange }: NestedArrayFieldProps) {
  const addItem = () => {
    onChange([...items, { text: "", accent: false }]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, key: string, value: unknown) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [key]: value } : item
    );
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] text-zinc-500">{label}</label>
        <button
          type="button"
          onClick={addItem}
          className="text-[11px] text-red-400 hover:text-red-300 cursor-pointer"
        >
          + Add
        </button>
      </div>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="text"
            value={item.text}
            onChange={(e) => updateItem(index, "text", e.target.value)}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-600"
            placeholder="Feature text"
          />
          <label className="flex items-center gap-1 text-[10px] text-zinc-500 cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={item.accent ?? false}
              onChange={(e) => updateItem(index, "accent", e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-900"
            />
            Accent
          </label>
          <button
            type="button"
            onClick={() => removeItem(index)}
            className="text-[10px] text-red-400/60 hover:text-red-400 cursor-pointer"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}
