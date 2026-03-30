"use client";

interface ArrayFieldProps {
  label: string;
  items: Record<string, unknown>[];
  fields: { key: string; label: string; type?: "text" | "textarea" | "number" | "boolean" }[];
  onChange: (items: Record<string, unknown>[]) => void;
}

export default function ArrayField({ label, items, fields, onChange }: ArrayFieldProps) {
  const addItem = () => {
    const newItem: Record<string, unknown> = {};
    fields.forEach((f) => {
      if (f.type === "number") newItem[f.key] = 0;
      else if (f.type === "boolean") newItem[f.key] = false;
      else newItem[f.key] = "";
    });
    onChange([...items, newItem]);
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

  const moveItem = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;
    const updated = [...items];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          {label}
        </label>
        <button
          type="button"
          onClick={addItem}
          className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
        >
          + Add Item
        </button>
      </div>

      {items.map((item, index) => (
        <div key={index} className="border border-zinc-800 rounded-lg p-4 space-y-3 bg-zinc-900/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 font-mono">#{index + 1}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => moveItem(index, "up")}
                disabled={index === 0}
                className="text-xs text-zinc-500 hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              >
                &uarr;
              </button>
              <button
                type="button"
                onClick={() => moveItem(index, "down")}
                disabled={index === items.length - 1}
                className="text-xs text-zinc-500 hover:text-white disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              >
                &darr;
              </button>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-xs text-red-400/60 hover:text-red-400 transition-colors cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-[11px] text-zinc-500 mb-1">{field.label}</label>
              {field.type === "textarea" ? (
                <textarea
                  value={String(item[field.key] ?? "")}
                  onChange={(e) => updateItem(index, field.key, e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors resize-none"
                />
              ) : field.type === "boolean" ? (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(item[field.key])}
                    onChange={(e) => updateItem(index, field.key, e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-900"
                  />
                  <span className="text-sm text-zinc-300">Enabled</span>
                </label>
              ) : (
                <input
                  type={field.type === "number" ? "number" : "text"}
                  value={String(item[field.key] ?? "")}
                  onChange={(e) =>
                    updateItem(
                      index,
                      field.key,
                      field.type === "number" ? Number(e.target.value) : e.target.value
                    )
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors"
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
