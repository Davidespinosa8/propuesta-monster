import type { RefItem, SelectedItem } from "@/types/create-proposal";

interface ReferenceItemsListProps {
  searchTerm: string;
  refItems: RefItem[];
  selectedItems: SelectedItem[];
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onAddItem: (item: RefItem) => void;
}

export default function ReferenceItemsList({
  searchTerm,
  refItems,
  selectedItems,
  isLoading = false,
  onSearchChange,
  onAddItem,
}: ReferenceItemsListProps) {
  return (
    <>
      <input
        type="text"
        placeholder="Buscar trabajo..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full bg-dark-900 border border-white/10 rounded-xl p-4 text-white mb-4 outline-none focus:border-primary-DEFAULT z-10"
      />

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar pb-24">
        {isLoading && (
          <div className="sticky top-0 z-10 mb-2 rounded-xl border border-white/10 bg-dark-900/90 backdrop-blur-sm px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Actualizando precios...
          </div>
        )}

        {refItems
          .filter((i) =>
            i.task.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((item) => {
            const qty =
              selectedItems.find((si) => si.id === item.id)?.qty || 0;

            return (
              <button
                key={item.id}
                onClick={() => onAddItem(item)}
                className={`w-full text-left p-4 rounded-xl border flex justify-between items-center transition-all ${
                  qty > 0
                    ? "bg-primary-DEFAULT/10 border-primary-DEFAULT"
                    : "bg-dark-900/50 border-transparent hover:border-white/10"
                }`}
              >
                <div>
                  <p className="font-bold text-white text-sm">
                    {item.task}
                    {qty > 0 && (
                      <span className="text-primary-DEFAULT ml-2">x{qty}</span>
                    )}
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase">
                    {item.unit}
                  </p>
                </div>

                <p className="font-black text-accent-DEFAULT">
                  ${item.price.toLocaleString()}
                </p>
              </button>
            );
          })}
      </div>
    </>
  );
}