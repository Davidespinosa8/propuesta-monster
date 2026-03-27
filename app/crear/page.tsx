"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getProposalById,
  getReferencePricesByCategory,
  saveProposalByMode,
} from "@/services/proposal.service";
import { getUserRole } from "@/services/user.service";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
  mapStoredServicesToEditableState,
  mapEditableStateToStoredServices,
} from "@/utils/proposal-tansform";
import CategorySelector from "@/components/crear/CategorySelector";
import ManualItemPanel from "@/components/crear/ManualItemPanel";

const CATEGORIES = [
  { id: "electricista", label: "Electricidad", icon: "⚡" },
  { id: "plomero", label: "Plomería", icon: "💧" },
  { id: "gasista", label: "Gasista", icon: "🔥" },
  { id: "albanil", label: "Albañilería", icon: "🧱" },
  { id: "durlock", label: "Durlock", icon: "🛠️" },
  { id: "digital", label: "Digital / Diseño", icon: "💻" },
];

interface RefItem { id: string; task: string; unit: string; price: number; }
interface SelectedItem extends RefItem {
  qty: number;
  customPrice: number;
  category: string;
}
interface DigitalService {
  id: string;
  title: string;
  price: number;
  desc: string;
}

function CreateQuoteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  const editId = searchParams.get("edit");
  const duplicateId = searchParams.get("duplicate");

  const [activeCategory, setActiveCategory] = useState<string>("digital");
  const [initializing, setInitializing] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState<'view' | 'dashboard'>('view');

  const [clientName, setClientName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState(""); 
  
  const [refItems, setRefItems] = useState<RefItem[]>([]); 
  const [searchTerm, setSearchTerm] = useState(""); 
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]); 

  const [digitalBasePrice, setDigitalBasePrice] = useState(0);
  const [digitalServices, setDigitalServices] = useState<DigitalService[]>([]); 

  // ESTADOS PARA ACCIÓN MANUAL
  const [isAddingManual, setIsAddingManual] = useState(false);
  const [manualTask, setManualTask] = useState("");
  const [manualPrice, setManualPrice] = useState(0);

  useEffect(() => {
  if (!loading && !user) {
    router.push("/login");
    return;
  }

  const fetchUserRoleData = async () => {
    if (!user) return;

    try {
      const role = await getUserRole(user.uid);
      if (role && CATEGORIES.some((c) => c.id === role)) {
        setActiveCategory(role);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setInitializing(false);
    }
  };

  if (user) {
    fetchUserRoleData();
  }
}, [user, loading, router]);

  useEffect(() => {
  const loadProposal = async () => {
    const id = editId || duplicateId;
    if (!id || initializing) return;

    try {
      const data = await getProposalById(id);
      if (!data) return;

      setClientName(data.clientName || "");
      setWhatsapp(data.whatsapp || "");
      setPortfolioUrl(data.portfolioUrl || "");

            const editableState = mapStoredServicesToEditableState(data.services || []);

      setDigitalBasePrice(editableState.digitalBasePrice);
      setSelectedItems(editableState.selectedItems);
      setDigitalServices(editableState.digitalServices);
    } catch (error) {
      console.error(error);
    }
  };

  loadProposal();
}, [editId, duplicateId, initializing]);

  useEffect(() => {
  const fetchPrices = async () => {
    try {
      setRefItems([]);
      const items = await getReferencePricesByCategory(activeCategory);
      setRefItems(items);
    } catch (error) {
      console.error(error);
    }
  };

  if (!initializing) {
    fetchPrices();
  }
}, [activeCategory, initializing]);

  const addToBudget = (item: RefItem) => {
    const existing = selectedItems.find(i => i.id === item.id);
    if (existing) {
      updateQty(item.id, existing.qty + 1);
    } else {
      setSelectedItems([...selectedItems, { ...item, qty: 1, customPrice: item.price, category: activeCategory }]);
    }
  };

  const addManualToBudget = () => {
    if (!manualTask || manualPrice <= 0) return;
    const newItem: SelectedItem = {
      id: `manual-${Date.now()}`, task: manualTask, unit: "Personalizado",
      price: manualPrice, qty: 1, customPrice: manualPrice, category: "manual"
    };
    setSelectedItems([...selectedItems, newItem]);
    setManualTask(""); setManualPrice(0); setIsAddingManual(false);
  };

  const updateQty = (id: string, qty: number) => {
    if (qty < 1) {
      setSelectedItems(selectedItems.filter(i => i.id !== id));
      return;
    }
    setSelectedItems(selectedItems.map(i => i.id === id ? { ...i, qty } : i));
  };

  const updateCustomPrice = (id: string, price: number) => {
    setSelectedItems(selectedItems.map(i => i.id === id ? { ...i, customPrice: price } : i));
  };

  const calculateTotal = () => {
    const totalOficios = selectedItems.reduce((acc, item) => acc + (item.customPrice * item.qty), 0);
    const totalManual = digitalBasePrice + digitalServices.reduce((acc, item) => acc + item.price, 0);
    return totalOficios + totalManual;
  };

  const saveToFirebase = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!user) return;

    const finalServices = mapEditableStateToStoredServices({
    selectedItems,
    digitalServices,
    digitalBasePrice,
  });

  try {
    const proposalData = {
      freelancerName: user.displayName || "Profesional",
      freelancerId: user.uid,
      clientName,
      whatsapp,
      portfolioUrl,
      services: finalServices,
      total: calculateTotal(),
      createdAt: new Date(),
      status: "pending" as const,
    };

    const finalId = await saveProposalByMode({
      proposalId: editId || undefined,
      proposalData,
      userId: user.uid,
    });

    router.push(redirectTarget === "view" ? `/p/${finalId}` : "/dashboard");
  } catch (error) {
    console.error(error);
  }
};

  if (initializing) return <div className="min-h-screen bg-dark-900 flex items-center justify-center text-white italic">Iniciando...</div>;

  return (
    <main className="min-h-screen bg-dark-900 p-4 md:p-8 relative">
      {/* MENÚ LATERAL */}
      <div className={`fixed top-0 right-0 h-full bg-dark-800 border-l border-white/10 transition-transform duration-500 z-50 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} w-72 shadow-2xl`}>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="absolute top-1/2 -left-10 bg-dark-800 p-3 rounded-l-2xl text-white shadow-xl">
            {isMenuOpen ? '〉' : '〈'}
        </button>
        <nav className="p-10 space-y-8 mt-20">
          <Link href="/dashboard" className="block text-gray-400 hover:text-white font-black text-xs uppercase italic">📊 Dashboard</Link>
          <Link href="/" className="block text-gray-400 hover:text-white font-black text-xs uppercase italic">🏠 Home</Link>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <h2 className="text-3xl font-black text-white uppercase italic">
            {editId ? '✏️ Editar Presupuesto' : duplicateId ? '📑 Duplicar Presupuesto' : '➕ Nuevo Presupuesto'}
          </h2>

          <CategorySelector
            categories={CATEGORIES}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />

          {/* CONTENEDOR DE LISTA CON BOTÓN FIJO */}
          <div className="bg-dark-800/50 p-6 rounded-2xl border border-white/5 h-150 flex flex-col relative overflow-hidden">
            <input type="text" placeholder="Buscar trabajo..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-dark-900 border border-white/10 rounded-xl p-4 text-white mb-4 outline-none focus:border-primary-DEFAULT z-10" />
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar pb-24">
              {refItems.filter(i => i.task.toLowerCase().includes(searchTerm.toLowerCase())).map(item => {
                const qty = selectedItems.find(si => si.id === item.id)?.qty || 0;
                return (
                  <button key={item.id} onClick={() => addToBudget(item)} className={`w-full text-left p-4 rounded-xl border flex justify-between items-center transition-all ${qty > 0 ? "bg-primary-DEFAULT/10 border-primary-DEFAULT" : "bg-dark-900/50 border-transparent hover:border-white/10"}`}>
                    <div>
                      <p className="font-bold text-white text-sm">{item.task} {qty > 0 && <span className="text-primary-DEFAULT ml-2">x{qty}</span>}</p>
                      <p className="text-[10px] text-gray-500 uppercase">{item.unit}</p>
                    </div>
                    <p className="font-black text-accent-DEFAULT">${item.price.toLocaleString()}</p>
                  </button>
                )
              })}
            </div>

            {/* PANEL FIJO INFERIOR */}
            <div className="absolute bottom-0 left-0 w-full p-4 bg-dark-800 border-t border-white/5 z-20">
              <ManualItemPanel
                isAddingManual={isAddingManual}
                manualTask={manualTask}
                manualPrice={manualPrice}
                onStartAdd={() => setIsAddingManual(true)}
                onCancel={() => setIsAddingManual(false)}
                onTaskChange={setManualTask}
                onPriceChange={setManualPrice}
                onAdd={addManualToBudget}
              />
            </div>
          </div>
        </div>

        {/* TICKET DE TRABAJO */}
        <div className="lg:col-span-5">
          <form onSubmit={saveToFirebase} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sticky top-8">
            <h3 className="text-xl font-black text-white mb-6 uppercase italic border-b border-white/10 pb-4">Ticket de Trabajo</h3>
            <div className="space-y-3 mb-6">
              <input required placeholder="Nombre del Cliente" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full bg-dark-900 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-white/20" />
              <input required placeholder="WhatsApp" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full bg-dark-900 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-white/20" />
              <input placeholder="Link Portafolio" value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} className="w-full bg-dark-900 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-white/20" />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 mb-6 pr-2 custom-scrollbar">
              {selectedItems.map(item => (
                <div key={item.id} className="bg-dark-900 p-3 rounded-xl border border-white/5 flex justify-between items-center group">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white uppercase">{item.task}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <input type="number" value={item.qty} onChange={e => updateQty(item.id, Number(e.target.value))} className="w-12 bg-dark-800 text-center text-white rounded p-1 text-xs font-mono" />
                      <span className="text-gray-600 text-[10px]">x</span>
                      <input type="number" value={item.customPrice} onChange={e => updateCustomPrice(item.id, Number(e.target.value))} className="w-20 bg-dark-800 text-white rounded p-1 text-xs font-mono" />
                    </div>
                  </div>
                  <button type="button" onClick={() => updateQty(item.id, 0)} className="text-gray-600 hover:text-red-500 transition-colors ml-2 text-xl">✕</button>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-4 mb-6 flex justify-between items-end">
              <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Total Estimado</span>
              <span className="text-3xl font-black text-white tracking-tighter">${calculateTotal().toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button type="submit" onClick={() => setRedirectTarget('dashboard')} className="py-4 bg-white/5 border border-white/10 text-white font-black rounded-xl text-[10px] uppercase hover:bg-white/10 transition-all">💾 Guardar</button>
              <button type="submit" onClick={() => setRedirectTarget('view')} className="py-4 bg-white text-black font-black rounded-xl text-[10px] uppercase hover:scale-[1.02] transition-all active:scale-95">🚀 Generar</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function CreateQuotePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-dark-900 flex items-center justify-center text-white italic">Cargando...</div>}>
            <CreateQuoteContent />
        </Suspense>
    );
}