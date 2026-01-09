"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, Timestamp, deleteDoc, doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import UserProfile from "@/components/UserProfile";

// CONFIGURACIÓN: 6 Intentos totales
const FREE_LIMIT = 6;

interface Proposal {
  id: string;
  clientName: string;
  total: number;
  createdAt: Timestamp;
  viewedAt?: Timestamp; 
  freelancerId: string;
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // ESTADOS DE UI
  const [view, setView] = useState<'dashboard' | 'perfil'>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // ESTADOS DE DATOS
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  
  // ESTADOS DEL PLAN Y PAGOS
  const [userPlan, setUserPlan] = useState<'free' | 'pro'>('free');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // CONTADOR HISTÓRICO
  const [usageCount, setUsageCount] = useState(0);

  // 1. SEGURIDAD: REDIRECCIÓN
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  // 2. CARGA DE DATOS Y PLAN
  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      try {
        // A) Cargar Presupuestos
        const q = query(
          collection(db, "proposals"), 
          where("freelancerId", "==", user.uid)
        );
        const snap = await getDocs(q);
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Proposal));
        
        // Ordenar por fecha
        docs.sort((a, b) => {
            const dateA = a.createdAt?.seconds || 0;
            const dateB = b.createdAt?.seconds || 0;
            return dateB - dateA;
        });
        setProposals(docs);

        // B) Cargar Plan y Contador del Usuario
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);
        
        if (userSnap.exists()) {
            const userData = userSnap.data();
            
            // Plan
            if (userData.plan === 'pro') {
                setUserPlan('pro');
            }

            // Contador Histórico
            setUsageCount(userData.usageCount || docs.length);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // --- LÓGICA DE NEGOCIO ---

  // Borrar Presupuesto
  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que querés eliminar este presupuesto? El intento consumido NO se recupera.")) {
      try {
        await deleteDoc(doc(db, "proposals", id));
        setProposals(prev => prev.filter(p => p.id !== id));
      } catch (error) {
        console.error("Error al eliminar", error);
      }
    }
  };

  // Bloqueo de Creación
  const handleCreateClick = (e: React.MouseEvent) => {
      if (userPlan === 'free' && usageCount >= FREE_LIMIT) {
          e.preventDefault(); 
          setShowUpgradeModal(true);
      }
  };

  // Ir a Pagar (MercadoPago)
  const handleBuyPro = async () => {
    if(!user) return;
    setIsProcessing(true);
    try {
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                userId: user.uid,
                userEmail: user.email 
            })
        });
        const data = await response.json();
        if (data.url) {
            window.location.href = data.url; 
        }
    } catch (error) {
        console.error("Error al ir a pagar:", error);
        alert("Hubo un error iniciando el pago.");
    } finally {
        setIsProcessing(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-4 border-primary-DEFAULT border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-dark-900 text-white p-4 md:p-8 relative overflow-hidden">
      
      {/* FONDO */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-grid-white mask-[radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      </div>

      {/* MENÚ LATERAL */}
      <div className={`fixed top-0 right-0 h-full bg-dark-800 border-l border-white/10 transition-transform duration-500 z-50 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} w-72 shadow-2xl`}>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="absolute top-1/2 -left-10 bg-dark-800 border-y border-l border-white/10 p-3 rounded-l-2xl text-white shadow-xl"
        >
          {isMenuOpen ? '〉' : '〈'}
        </button>
        <nav className="p-10 space-y-8 mt-20">
          <Link href="/" className="flex items-center gap-4 text-gray-400 hover:text-white font-black text-xs uppercase italic transition-colors">Home</Link>
          <button onClick={() => { setView('dashboard'); setIsMenuOpen(false); }} className={`flex items-center gap-4 font-black text-xs uppercase italic transition-colors ${view === 'dashboard' ? 'text-primary-DEFAULT' : 'text-gray-400 hover:text-white'}`}>Dashboard</button>
          <button onClick={() => { setView('perfil'); setIsMenuOpen(false); }} className={`flex items-center gap-4 font-black text-xs uppercase italic transition-colors ${view === 'perfil' ? 'text-primary-DEFAULT' : 'text-gray-400 hover:text-white'}`}>Perfil</button>
          
          {userPlan === 'free' && (
              <button 
                onClick={() => setShowUpgradeModal(true)} // AHORA ABRE EL MODAL
                disabled={isProcessing}
                className="mt-8 w-full py-3 bg-linear-to-r from-yellow-400 to-orange-500 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
              >
                {isProcessing ? 'Cargando...' : '⚡ Pasate a PRO'}
              </button>
          )}
        </nav>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {view === 'dashboard' ? (
          <div className="animate-in fade-in duration-500">
            
            {/* HEADER */}
            <header className="flex justify-between items-center mb-12 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                  <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase">Mis Obras</h1>
                  {userPlan === 'pro' && <span className="text-[10px] bg-yellow-500 text-black px-2 py-0.5 rounded font-bold uppercase">PRO</span>}
              </div>

              <div className="flex items-center gap-3">
                {/* BOTÓN PRO (Visible solo si es Free) */}
                {userPlan === 'free' && (
                    <button 
                        onClick={() => setShowUpgradeModal(true)} // AHORA ABRE EL MODAL
                        disabled={isProcessing}
                        className="px-6 py-4 bg-linear-to-r from-yellow-400 to-orange-500 text-black font-black rounded-2xl text-xs uppercase hover:scale-105 transition-transform shadow-[0_0_15px_rgba(251,191,36,0.3)] animate-pulse"
                    >
                        🚀 PRO
                    </button>
                )}

                {/* BOTÓN NUEVO */}
                <Link 
                    href="/crear" 
                    onClick={handleCreateClick}
                    className="px-6 py-4 bg-white text-black font-black rounded-2xl text-xs uppercase hover:scale-105 transition-transform flex items-center gap-2"
                >
                    Nuevo +
                    {userPlan === 'free' && <span className="opacity-50 ml-1">({usageCount}/{FREE_LIMIT})</span>}
                </Link>
              </div>
            </header>
            
            {/* LISTA DE PRESUPUESTOS */}
            <div className="grid gap-4">
              {dataLoading ? (
                <div className="text-center text-gray-500 animate-pulse uppercase text-xs font-bold">Cargando datos...</div>
              ) : proposals.length > 0 ? (
                proposals.map(p => (
                  <div key={p.id} className="group bg-dark-800/50 backdrop-blur-md p-6 rounded-[2rem] border border-white/5 hover:border-primary-DEFAULT transition-all flex flex-col md:flex-row justify-between items-center gap-4">
                    
                    {/* INFO CLIENTE */}
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="font-bold text-lg group-hover:text-primary-DEFAULT transition-colors">{p.clientName}</h3>
                      <p className="text-[10px] text-gray-500 uppercase">{p.createdAt?.toDate().toLocaleDateString()}</p>
                    </div>
                    
                    {/* PRECIO */}
                    <p className="font-mono font-black text-white text-xl">${p.total?.toLocaleString()}</p>

                    {/* ESTADO WHATSAPP */}
                    <div className="flex flex-col items-center justify-center px-4 border-l border-r border-white/5 h-full min-w-[80px]">
                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-green-500 mb-1 fill-current">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>

                        <div className="flex -space-x-1">
                            <svg className={`w-4 h-4 ${p.viewedAt ? 'text-blue-400' : 'text-gray-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            {p.viewedAt && (
                                <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            )}
                        </div>
                    </div>

                    {/* ACCIONES */}
                    <div className="flex items-center gap-2">
                        <Link href={`/p/${p.id}`} className="p-3 bg-white/5 rounded-xl hover:bg-white hover:text-black transition-all text-gray-400" title="Ver Propuesta">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        </Link>
                        <button 
                            onClick={() => handleDelete(p.id)}
                            className="p-3 bg-red-500/10 rounded-xl hover:bg-red-500 hover:text-white transition-all text-red-500"
                            title="Eliminar Propuesta"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>

                  </div>
                ))
              ) : (
                <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[2rem] text-gray-600 font-bold uppercase tracking-widest text-xs">
                  No hay propuestas activas
                </div>
              )}
            </div>
          </div>
        ) : (
          /* VISTA PERFIL */
          <div className="flex justify-center animate-in zoom-in-95 duration-500">
            <UserProfile />
          </div>
        )}
      </div>

      {/* --- MODAL PREMIUM (Ahora con OFERTA) --- */}
      {showUpgradeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-dark-900 border border-white/10 rounded-3xl max-w-md w-full p-8 relative shadow-2xl overflow-hidden text-center animate-in zoom-in-95 duration-300">
                  
                  {/* Fondo Brillante */}
                  <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-yellow-400 to-orange-500"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-orange-500/20 blur-[60px] rounded-full pointer-events-none"></div>

                  <button 
                    onClick={() => setShowUpgradeModal(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                  >
                    ✕
                  </button>

                  <div className="relative z-10">
                    <span className="text-4xl mb-4 block">🚀</span>
                    {/* TÍTULO DINÁMICO */}
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">
                        {usageCount >= FREE_LIMIT ? "¡Límite Alcanzado!" : "¡Pasate a PRO!"}
                    </h3>
                    
                    {/* TEXTO DINÁMICO */}
                    <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                        {usageCount >= FREE_LIMIT 
                            ? <>Ya usaste tus <b>{FREE_LIMIT} presupuestos</b> gratuitos.<br/></>
                            : <>Desbloqueá esta herramienta profesional.<br/></>
                        }
                        Para seguir creando sin límites, pasate a PRO.
                    </p>

                    {/* CAJA DE PRECIO OFERTA */}
                    <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
                        <p className="text-gray-400 text-xs uppercase font-bold mb-1">Precio Lanzamiento</p>
                        <div className="flex items-center justify-center gap-3">
                            <span className="text-gray-500 line-through text-lg font-bold decoration-red-500 decoration-2">$10.000</span>
                            <span className="text-3xl font-black text-white">$5.000</span>
                            <span className="bg-green-500 text-black text-[10px] font-black px-2 py-1 rounded-full animate-bounce">50% OFF</span>
                        </div>
                    </div>

                    <button 
                        onClick={handleBuyPro}
                        disabled={isProcessing}
                        className="w-full py-4 bg-linear-to-r from-yellow-400 to-orange-500 text-black font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {isProcessing ? (
                            <>Cargando... <span className="animate-spin">⏳</span></>
                        ) : (
                            <>Desbloquear Ilimitado 🔓</>
                        )}
                    </button>
                    
                    <button 
                        onClick={() => setShowUpgradeModal(false)}
                        className="mt-3 block w-full py-2 text-gray-600 font-bold text-[10px] uppercase hover:text-white transition-colors"
                    >
                        Quizás más tarde
                    </button>
                  </div>
              </div>
          </div>
      )}

    </main>
  );
}