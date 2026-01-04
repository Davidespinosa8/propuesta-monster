"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, Timestamp, deleteDoc, doc } from "firebase/firestore";
import Link from "next/link";
import UserProfile from "@/components/UserProfile";

interface Proposal {
  id: string;
  clientName: string;
  total: number;
  createdAt: Timestamp;
  viewedAt?: Timestamp; 
  freelancerId: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [view, setView] = useState<'dashboard' | 'perfil'>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchProposals = async () => {
      try {
        const q = query(
          collection(db, "proposals"), 
          where("freelancerId", "==", user.uid)
        );
        
        const snap = await getDocs(q);
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Proposal));
        
        docs.sort((a, b) => {
            const dateA = a.createdAt?.seconds || 0;
            const dateB = b.createdAt?.seconds || 0;
            return dateB - dateA;
        });

        setProposals(docs);
      } catch (error) {
        console.error("Error cargando propuestas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, [user]);

  // Función para borrar
  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que querés eliminar este presupuesto? No se puede recuperar.")) {
      try {
        await deleteDoc(doc(db, "proposals", id));
        setProposals(prev => prev.filter(p => p.id !== id));
      } catch (error) {
        console.error("Error al eliminar", error);
      }
    }
  };

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
        </nav>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {view === 'dashboard' ? (
          <div className="animate-in fade-in duration-500">
            <header className="flex justify-between items-center mb-12">
              <h1 className="text-4xl font-black italic tracking-tighter uppercase">Mis Obras</h1>
              <Link href="/crear" className="px-6 py-4 bg-white text-black font-black rounded-2xl text-xs uppercase hover:scale-105 transition-transform">
                Nuevo +
              </Link>
            </header>
            
            <div className="grid gap-4">
              {loading ? (
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

                    {/* ESTADO WHATSAPP (LOGICA DE TILDES) */}
                    <div className="flex flex-col items-center justify-center px-4 border-l border-r border-white/5 h-full min-w-[80px]">
                        {/* Ícono WhatsApp */}
                        <svg viewBox="0 0 24 24" className="w-5 h-5 text-green-500 mb-1 fill-current">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>

                        {/* Tildes */}
                        <div className="flex -space-x-1">
                            <svg className={`w-4 h-4 ${p.viewedAt ? 'text-blue-400' : 'text-gray-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            
                             {/* Segundo Tilde */}
                            {p.viewedAt && (
                                <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            )}
                        </div>
                    </div>

                    {/* ACCIONES (OJO Y BASURA) */}
                    <div className="flex items-center gap-2">
                        {/* Botón Ver */}
                        <Link href={`/p/${p.id}`} className="p-3 bg-white/5 rounded-xl hover:bg-white hover:text-black transition-all text-gray-400" title="Ver Propuesta">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        </Link>

                        {/* Botón Eliminar */}
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
          /* VISTA PERFIL LLAMANDO AL COMPONENTE EXTERNO */
          <div className="flex justify-center animate-in zoom-in-95 duration-500">
            <UserProfile />
          </div>
        )}
      </div>
    </main>
  );
}