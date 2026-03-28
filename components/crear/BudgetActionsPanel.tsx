interface BudgetActionsPanelProps {
  total: number;
  onSaveDraft: () => void;
  onGenerate: () => void;
}

export default function BudgetActionsPanel({
  total,
  onSaveDraft,
  onGenerate,
}: BudgetActionsPanelProps) {
  return (
    <>
      <div className="border-t border-white/10 pt-4 mb-6 flex justify-between items-end">
        <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">
          Total Estimado
        </span>
        <span className="text-3xl font-black text-white tracking-tighter">
          ${total.toLocaleString()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="submit"
          onClick={onSaveDraft}
          className="py-4 bg-white/5 border border-white/10 text-white font-black rounded-xl text-[10px] uppercase hover:bg-white/10 transition-all"
        >
          💾 Guardar
        </button>

        <button
          type="submit"
          onClick={onGenerate}
          className="py-4 bg-white text-black font-black rounded-xl text-[10px] uppercase hover:scale-[1.02] transition-all active:scale-95"
        >
          🚀 Generar
        </button>
      </div>
    </>
  );
}