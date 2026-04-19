interface BudgetActionsPanelProps {
  total: number;
  isSubmitting?: boolean;
  submitAction?: "save" | "generate" | null;
  onSaveDraft: () => void;
  onGenerate: () => void;
}

export default function BudgetActionsPanel({
  total,
  isSubmitting = false,
  submitAction = null,
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
          disabled={isSubmitting}
          className={`py-4 border font-black rounded-xl text-[10px] uppercase transition-all ${
            isSubmitting
              ? "bg-white/5 border-white/10 text-gray-500 cursor-not-allowed"
              : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
          }`}
        >
          {isSubmitting && submitAction === "save" ? "Guardando..." : "💾 Guardar"}
        </button>

        <button
          type="submit"
          onClick={onGenerate}
          disabled={isSubmitting}
          className={`py-4 font-black rounded-xl text-[10px] uppercase transition-all ${
            isSubmitting
              ? "bg-gray-500 text-white cursor-not-allowed opacity-70"
              : "bg-white text-black hover:scale-[1.02] active:scale-95"
          }`}
        >
          {isSubmitting && submitAction === "generate" ? "Generando..." : "🚀 Generar"}
        </button>
      </div>
    </>
  );
}