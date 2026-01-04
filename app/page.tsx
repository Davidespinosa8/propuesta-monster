"use client";
import { useState } from "react"; 
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false); 

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-dark-900 text-center px-4">
      
      {/* FONDO GRID + LUCES */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-white mask-[radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-primary-DEFAULT opacity-20 blur-[120px]"></div>
      </div>

      {/* --- MENÚ LATERAL --- */}
      {user && (
        <div className={`fixed top-0 right-0 h-full bg-dark-800 border-l border-white/10 transition-transform duration-500 z-50 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} w-72 shadow-2xl`}>
          {/* La Pestaña/Flecha */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="absolute top-1/2 -left-10 bg-dark-800 border-y border-l border-white/10 p-3 rounded-l-2xl text-white shadow-xl focus:outline-none"
          >
            {isMenuOpen ? '〉' : '〈'}
          </button>

          {/* El Índice */}
          <nav className="p-10 space-y-8 mt-20 text-left">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4 mb-2">Navegación</p>
              
              {/* Link a Home (Actual) */}
              <button 
                onClick={() => setIsMenuOpen(false)} 
                className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold text-xs uppercase italic text-primary-DEFAULT bg-primary-DEFAULT/10"
              >
                🏠 Home
              </button>

              {/* Link al Dashboard */}
              <Link 
                href="/dashboard" 
                className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold text-xs uppercase italic text-gray-400 hover:text-white hover:bg-white/5"
              >
                📊 Dashboard
              </Link>
            </div>

            {/* Botón de Cerrar Sesión */}
            <div className="pt-8 border-t border-white/5">
              <button 
                onClick={() => auth.signOut()}
                className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-500 font-black rounded-2xl text-xs uppercase hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                Cerrar Sesión ⏻
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* CONTENIDO CENTRAL (Intacto) */}
      <div className="relative z-10 space-y-8">
        <p className="text-xs font-bold tracking-[0.3em] uppercase glow-text-animated mb-4">Software para Agencias</p>
        
        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter">
          PROPUESTA<br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary-DEFAULT to-accent-DEFAULT">MONSTER</span>
        </h1>
        
        <p className="text-gray-400 text-xl max-w-xl mx-auto">
          No mandes PDFs aburridos. Crea presupuestos interactivos que <span className="text-white font-bold">cierran la venta por ti</span>.
        </p>

        <div className="pt-8 min-h-20"> 
          {loading ? (
            <div className="text-gray-500 animate-pulse text-sm">Verificando sesión...</div>
          ) : user ? (
            <div className="flex flex-col gap-4 items-center">
              <p className="text-sm text-accent-DEFAULT font-bold">Hola, {user.displayName} 👋</p>
              <Link href="/dashboard" className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-dark-900 transition-all duration-200 bg-linear-to-r from-accent-DEFAULT to-accent-dim rounded-full hover:scale-105 hover:shadow-[0_0_30px_rgba(110,231,183,0.5)]">
                <span className="mr-2">Ir a mi Panel de Control</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
              </Link>
            </div>
          ) : (
            <Link href="/login" className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-linear-to-r from-primary-DEFAULT to-primary-glow rounded-full hover:scale-105 hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]">
              <span className="mr-2">Comenzar Gratis</span>
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}