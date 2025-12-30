"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import Link from "next/link";
import UserProfile from "@/components/UserProfile"; // <--- Importamos el componente pro

// Interfaz para evitar el error de 'any'
interface Proposal {
  id: string;
  clientName: string;
  total: number;
  createdAt: Timestamp;
  freelancerId: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [view, setView] = useState<'dashboard' | 'perfil'>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [proposals, setProposals] = useState<Proposal[]>([]);

  useEffect(() => {
    if (!user) return;
    
    const fetchProposals = async () => {
      try {
        const q = query(collection(db, "proposals"), where("freelancerId", "==", user.uid));
        const snap = await getDocs(q);
        setProposals(snap.docs.map(d => ({ id: d.id, ...d.data() } as Proposal)));
      } catch (error) {
        console.error("Error cargando propuestas:", error);
      }
    };

    fetchProposals();
  }, [user]);

  return (
    <main className="min-h-screen bg-dark-900 text-white p-4 md:p-8 relative overflow-hidden">
      
      {/* FONDO GRID COHERENTE CON EL HOME */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-grid-white mask-[radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      </div>

      {/* MENÚ REBATIBLE A LA DERECHA */}
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
              {proposals.length > 0 ? proposals.map(p => (
                <Link href={`/p/${p.id}`} key={p.id} className="group bg-dark-800/50 backdrop-blur-md p-6 rounded-[2rem] border border-white/5 hover:border-primary-DEFAULT transition-all flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-primary-DEFAULT transition-colors">{p.clientName}</h3>
                    <p className="text-[10px] text-gray-500 uppercase">{p.createdAt.toDate().toLocaleDateString()}</p>
                  </div>
                  <p className="font-mono font-black text-white group-hover:text-primary-DEFAULT">${p.total?.toLocaleString()}</p>
                </Link>
              )) : (
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