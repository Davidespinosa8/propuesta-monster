interface ManualItemPanelProps {
  isAddingManual: boolean;
  manualTask: string;
  manualPrice: number;
  onStartAdd: () => void;
  onCancel: () => void;
  onTaskChange: (value: string) => void;
  onPriceChange: (value: number) => void;
  onAdd: () => void;
}

export default function ManualItemPanel({
  isAddingManual,
  manualTask,
  manualPrice,
  onStartAdd,
  onCancel,
  onTaskChange,
  onPriceChange,
  onAdd,
}: ManualItemPanelProps) {
  if (!isAddingManual) {
    return (
      <button
        onClick={onStartAdd}
        className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl text-gray-500 hover:text-white hover:border-primary-DEFAULT transition-all font-black text-[10px] uppercase tracking-widest bg-dark-900/50"
      >
        + ¿No encontrás el trabajo? Agregalo manual
      </button>
    );
  }

  return (
    <div className="bg-dark-900 p-4 rounded-xl border border-primary-DEFAULT animate-in slide-in-from-bottom-2 shadow-2xl">
      <div className="space-y-3">
        <input
          autoFocus
          placeholder="Ej: Pintura de rejas..."
          value={manualTask}
          onChange={(e) => onTaskChange(e.target.value)}
          className="w-full bg-dark-800 border border-white/10 rounded-lg p-3 text-white text-sm outline-none"
        />

        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Precio $"
            value={manualPrice || ""}
            onChange={(e) => onPriceChange(Number(e.target.value))}
            className="flex-1 bg-dark-800 border border-white/10 rounded-lg p-3 text-white text-sm outline-none"
          />

          <button
            type="button"
            onClick={onAdd}
            className="px-4 bg-primary-DEFAULT text-black font-black rounded-lg text-xs uppercase"
          >
            Sumar
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="px-4 bg-white/5 text-gray-400 font-black rounded-lg text-xs uppercase"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}