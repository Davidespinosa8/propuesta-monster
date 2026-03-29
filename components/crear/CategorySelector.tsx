interface Category {
  id: string;
  label: string;
  icon: string;
}

interface CategorySelectorProps {
  categories: readonly Category[];
  activeCategory: string;
  onSelect: (categoryId: string) => void;
}

export default function CategorySelector({
  categories,
  activeCategory,
  onSelect,
}: CategorySelectorProps) {
  return (
    <div className="grid grid-cols-3 md:flex gap-2">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`px-4 py-3 rounded-xl border text-[14px] font-black uppercase tracking-tighter transition-all ${
            activeCategory === cat.id
              ? "bg-white text-black border-white"
              : "bg-dark-800/50 text-gray-400 border-white/5"
          }`}
        >
          {cat.icon} {cat.label}
        </button>
      ))}
    </div>
  );
}