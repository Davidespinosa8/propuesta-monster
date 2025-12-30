"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, doc, getDoc } from "firebase/firestore"; 
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link"; // <--- AGREGADO

// CATEGORÍAS DISPONIBLES
const CATEGORIES = [
  { id: "electricista", label: "Electricidad", icon: "⚡" },
  { id: "plomero", label: "Plomería", icon: "💧" },
  { id: "gasista", label: "Gasista", icon: "🔥" },
  { id: "albanil", label: "Albañilería", icon: "🧱" },
  { id: "durlock", label: "Durlock", icon: "🛠️" },
  { id: "digital", label: "Digital / Libre", icon: "💻" },
];

// INTERFACES
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

export default function CreateQuote() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // ESTADOS
  const [activeCategory, setActiveCategory] = useState<string>("digital");
  const [initializing, setInitializing] = useState(true);
  
  // --- AGREGADO: ESTADO MENU ---
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // DATOS FORMULARIO
  const [clientName, setClientName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState(""); 
  
  // DATOS OFICIOS
  const [refItems, setRefItems] = useState<RefItem[]>([]); 
  const [searchTerm, setSearchTerm] = useState(""); 
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]); 

  // DATOS DIGITAL
  const [digitalBasePrice, setDigitalBasePrice] = useState(0);
  const [digitalServices, setDigitalServices] = useState<DigitalService[]>([]); 

  // 1. CARGA INICIAL
  useEffect(() => {
    if (!loading && !user) router.push("/login");

    const fetchUserRole = async () => {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role) {
          const role = userDoc.data().role;
          if (CATEGORIES.some(c => c.id === role)) setActiveCategory(role);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setInitializing(false);
      }
    };
    if (user) fetchUserRole();
  }, [user, loading, router]);

  // 2. CARGA DE PRECIOS POR CATEGORÍA
  useEffect(() => {
    const fetchPrices = async () => {
      if (activeCategory === "digital") return;
      try {
        setRefItems([]); 
        const pricesDoc = await getDoc(doc(db, "precios_referencia", activeCategory));
        if (pricesDoc.exists()) {
          setRefItems(pricesDoc.data().items || []);
        }
      } catch (e) {
        console.error("Error:", e);
      }
    };
    if (!initializing) fetchPrices();
  }, [activeCategory, initializing]);

  // --- LÓGICA CARRITO ---
  const addToBudget = (item: RefItem) => {
    const existing = selectedItems.find(i => i.id === item.id);
    if (existing) {
      updateQty(item.id, existing.qty + 1);
    } else {
      setSelectedItems([...selectedItems, { ...item, qty: 1, customPrice: item.price, category: activeCategory }]);
    }
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

  const addDigitalService = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setDigitalServices([...digitalServices, { id: newId, title: "", price: 0, desc: "" }]);
  };

  const updateDigitalService = (id: string, field: keyof DigitalService, value: string | number) => {
    setDigitalServices(digitalServices.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeDigitalService = (id: string) => {
    setDigitalServices(digitalServices.filter(s => s.id !== id));
  };

  const calculateTotal = () => {
    const totalOficios = selectedItems.reduce((acc, item) => acc + (item.customPrice * item.qty), 0);
    const totalDigital = digitalBasePrice + digitalServices.reduce((acc, item) => acc + item.price, 0);
    return totalOficios + totalDigital;
  };

  // --- GUARDAR ---
  const saveToFirebase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const finalServices = [
      ...selectedItems.map(i => ({
        id: i.id,
        title: `${i.qty}x ${i.task}`,
        price: i.customPrice * i.qty,
        desc: `Unidad: ${i.unit} - Rubro: ${i.category}`
      })),
      ...digitalServices.map(s => ({
        id: s.id, title: s.title, price: s.price, desc: s.desc
      }))
    ];

    if (digitalBasePrice > 0) {
      finalServices.push({ id: 'base', title: 'Honorarios Base / Gestión', price: digitalBasePrice, desc: 'Coordinación y logística' });
    }

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
        status: "pending"
      };

      const docRef = await addDoc(collection(db, "proposals"), proposalData);
      router.push(`/p/${docRef.id}`);
    } catch (error) {
      console.error("Error guardando:", error);
    }
  };

  if (initializing) return <div className="min-h-screen bg-dark-900 flex items-center justify-center text-white">Cargando herramientas...</div>;

  return (
    <main className="min-h-screen bg-dark-900 p-4 md:p-8 font-sans relative overflow-hidden">
      
      {/* --- AGREGADO: MENÚ LATERAL --- */}
      <div className={`fixed top-0 right-0 h-full bg-dark-800 border-l border-white/10 transition-transform duration-500 z-50 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} w-72 shadow-2xl`}>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="absolute top-1/2 -left-10 bg-dark-800 border-y border-l border-white/10 p-3 rounded-l-2xl text-white shadow-xl focus:outline-none"
        >
          {isMenuOpen ? '〉' : '〈'}
        </button>
        <nav className="p-10 space-y-8 mt-20 text-left">
          <Link href="/" className="flex items-center gap-4 text-gray-400 hover:text-white font-black text-xs uppercase italic transition-colors">
            🏠 Home
          </Link>
          <Link href="/dashboard" className="flex items-center gap-4 text-gray-400 hover:text-white font-black text-xs uppercase italic transition-colors">
            📊 Dashboard
          </Link>
          <Link href="/dashboard" className="flex items-center gap-4 text-gray-400 hover:text-white font-black text-xs uppercase italic transition-colors">
            👤 Perfil
          </Link>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* COLUMNA IZQUIERDA: HERRAMIENTAS */}
        <div className="lg:col-span-7 space-y-6">
          <div className="mb-2">
            <p className="text-accent-DEFAULT text-xs font-bold tracking-widest uppercase mb-1">Nueva Propuesta</p>
            <h2 className="text-3xl font-black text-white">Calculadora de Obra</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-2 mb-6">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl border transition-all duration-200 ${
                  activeCategory === cat.id 
                  ? "bg-white text-dark-900 border-white font-black" 
                  : "bg-dark-800/50 text-gray-400 border-dark-700 hover:border-gray-500"
                }`}
              >
                <span>{cat.icon}</span>
                <span className="font-bold text-xs">{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="h-[500px] flex flex-col">
            {activeCategory === 'digital' ? (
              <div className="bg-dark-800/50 p-6 rounded-2xl border border-dark-700 space-y-6 flex-1">
                <div>
                  <label className="text-gray-400 text-xs font-bold uppercase">Honorarios Base</label>
                  <input type="number" value={digitalBasePrice} onChange={e => setDigitalBasePrice(Number(e.target.value))}
                    className="w-full bg-dark-900 border border-dark-600 rounded-xl p-4 text-white text-2xl font-mono mt-2 outline-none" />
                </div>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <button onClick={addDigitalService} className="w-full mb-4 py-2 bg-primary-DEFAULT/20 text-primary-DEFAULT border border-primary-DEFAULT/30 rounded-lg text-xs font-bold">+ AGREGAR ITEM MANUAL</button>
                  {digitalServices.map(s => (
                    <div key={s.id} className="flex gap-2 mb-2">
                      <input placeholder="Descripción" value={s.title} onChange={e => updateDigitalService(s.id, 'title', e.target.value)} className="flex-1 bg-dark-900 border border-dark-600 rounded-lg p-3 text-white text-sm" />
                      <input placeholder="$" value={s.price} onChange={e => updateDigitalService(s.id, 'price', Number(e.target.value))} className="w-24 bg-dark-900 border border-dark-600 rounded-lg p-3 text-white text-sm" />
                      <button onClick={() => removeDigitalService(s.id)} className="text-red-400 p-2">×</button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-dark-800/50 p-6 rounded-2xl border border-dark-700 flex flex-col h-full">
                <input 
                  type="text" 
                  placeholder={`🔍 Buscar en ${CATEGORIES.find(c => c.id === activeCategory)?.label}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-600 rounded-xl p-4 text-white mb-4 outline-none focus:border-primary-DEFAULT"
                />
                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {refItems.filter(i => i.task.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                    <button key={item.id} onClick={() => addToBudget(item)} className="w-full text-left p-4 rounded-xl bg-dark-900/50 hover:bg-dark-700 border border-transparent hover:border-gray-600 flex justify-between items-center group">
                      <div>
                        <p className="font-bold text-gray-200">{item.task}</p>
                        <p className="text-xs text-gray-500">Unidad: {item.unit}</p>
                      </div>
                      <p className="font-mono text-accent-DEFAULT font-bold">${item.price.toLocaleString()}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: TICKET */}
        <div className="lg:col-span-5">
          <form onSubmit={saveToFirebase} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sticky top-8">
            <h3 className="text-xl font-black text-white mb-6 border-b border-white/10 pb-4">Ticket de Trabajo</h3>
            
            <div className="space-y-3 mb-6">
              <input required placeholder="Nombre del Cliente" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full bg-dark-900 border border-dark-600 rounded-xl p-3 text-white outline-none" />
              <input required placeholder="WhatsApp (Ej: 54911...)" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full bg-dark-900 border border-dark-600 rounded-xl p-3 text-white outline-none" />
              
              <div className="pt-2">
                <label className="text-[10px] text-accent-DEFAULT font-bold uppercase ml-1">Link de tu Portafolio (Opcional)</label>
                <input placeholder="Google Drive, Instagram, etc." value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} className="w-full bg-dark-900 border border-dark-600 rounded-xl p-3 text-white outline-none mt-1" />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 mb-6 pr-2 custom-scrollbar">
              {selectedItems.map(item => (
                <div key={item.id} className="bg-dark-900 p-3 rounded-lg border border-dark-700 flex justify-between items-center">
                  <div className="flex-1">
                    <p className="text-xs text-white font-bold">{item.task}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <input type="number" value={item.qty} onChange={(e) => updateQty(item.id, Number(e.target.value))} className="w-10 bg-dark-800 text-[10px] text-center text-white rounded" />
                        <span className="text-[10px] text-gray-500">x ${item.customPrice}</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => updateQty(item.id, 0)} className="text-red-500 text-xs ml-2">×</button>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-4 mb-6">
              <div className="flex justify-between items-end">
                <span className="text-gray-400 font-bold uppercase text-xs">Total Final</span>
                <span className="text-3xl font-black text-white">${calculateTotal().toLocaleString()}</span>
              </div>
            </div>

            <button type="submit" className="w-full py-4 bg-white text-dark-900 font-black text-lg rounded-xl hover:scale-[1.02] transition-transform">
              GENERAR PRESUPUESTO 🚀
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}