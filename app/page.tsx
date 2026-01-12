"use client";
import { useState } from "react"; 
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false); 

  return (
    // Agregamos relative y overflow-hidden al main para contener las luces que scrollean
    <main className="relative min-h-screen bg-dark-900 text-center overflow-x-hidden overflow-y-hidden selection:bg-primary-DEFAULT selection:text-white font-sans">
      
      {/* --- FONDO 1: GRID FIJO (No se mueve) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* El Grid exacto que definiste en CSS */}
        <div className="absolute inset-0 bg-grid-white mask-[radial-gradient(ellipse_at_center,transparent_20%,black)] opacity-30"></div>
      </div>

      {/* --- FONDO 2: LUCES AMBIENTALES DISTRIBUIDAS (Se mueven con el scroll) --- */}
      {/* Luz Superior Izquierda (Violeta) */}
      <div className="absolute top-0 -left-[20%] w-[800px] h-[800px] bg-primary-DEFAULT opacity-30 blur-[150px] rounded-full pointer-events-none z-0"></div>
      
      {/* Luz Media Derecha (Acento Verde para contraste) */}
      <div className="absolute top-[40%] -right-[20%] w-[600px] h-[600px] bg-accent-DEFAULT opacity-20 blur-[150px] rounded-full pointer-events-none z-0"></div>
      
      {/* Luz Inferior Central (Violeta Glow) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary-glow opacity-25 blur-[180px] rounded-full pointer-events-none z-0"></div>


      {/* --- MENÚ LATERAL --- */}
      {user && (
        <div className={`fixed top-0 right-0 h-full bg-dark-800 border-l border-white/10 transition-transform duration-500 z-50 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} w-72 shadow-2xl`}>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="absolute top-1/2 -left-10 bg-dark-800 border-y border-l border-white/10 p-3 rounded-l-2xl text-white shadow-xl focus:outline-none"
          >
            {isMenuOpen ? '〉' : '〈'}
          </button>

          <nav className="p-10 space-y-8 mt-20 text-left">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4 mb-2">Navegación</p>
              <button onClick={() => setIsMenuOpen(false)} className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold text-xs uppercase italic text-primary-DEFAULT bg-primary-DEFAULT/10">
                🏠 Home
              </button>
              <Link href="/dashboard" className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold text-xs uppercase italic text-gray-400 hover:text-white hover:bg-white/5">
                📊 Dashboard
              </Link>
            </div>
            <div className="pt-8 border-t border-white/5">
              <button onClick={() => auth.signOut()} className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-500 font-black rounded-2xl text-xs uppercase hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2">
                Cerrar Sesión ⏻
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-32 space-y-32">

        {/* 1. HERO SECTION */}
        <section className="space-y-8 animate-in fade-in zoom-in duration-700">
          
          {/* Badge pequeño */}
          <div className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-4 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
            <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-accent-DEFAULT glow-text-animated">Software para Oficios</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] drop-shadow-[0_0_25px_rgba(139,92,246,0.3)]">
            PROPUESTA<br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-primary-DEFAULT to-accent-DEFAULT">MONSTER</span>
          </h1>
          
          {/* Bajada de Marketing */}
          <p className="text-gray-400 text-lg md:text-2xl max-w-2xl mx-auto leading-relaxed">
            <span className="text-white font-bold block mb-2">Presupuestos que venden solos.</span>
            Creá propuestas profesionales en 2 minutos para Digital, Electricidad, Plomería, Gas, Durlock y más.
          </p>

          {/* CTA HERO */}
          <div className="pt-8"> 
            {loading ? (
              <div className="text-gray-500 animate-pulse text-sm">Cargando...</div>
            ) : user ? (
              <div className="flex flex-col gap-4 items-center">
                <Link href="/dashboard" className="group relative inline-flex items-center justify-center px-8 py-5 font-black text-dark-900 transition-all duration-200 bg-linear-to-r from-accent-DEFAULT to-accent-dim rounded-2xl hover:scale-105 hover:shadow-[0_0_30px_rgba(110,231,183,0.5)] uppercase tracking-wide">
                  <span className="mr-2">Ir a mi Panel</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                </Link>
                <p className="text-xs text-gray-500 font-bold uppercase">Sesión iniciada como {user.displayName}</p>
              </div>
            ) : (
              <Link href="/login" className="group relative inline-flex items-center justify-center px-10 py-5 font-black text-white transition-all duration-200 bg-linear-to-r from-primary-DEFAULT to-primary-glow rounded-2xl hover:scale-105 hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] uppercase tracking-widest text-sm">
                <span className="mr-2">Probar Gratis Ahora</span>
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
              </Link>
            )}
          </div>
        </section>

        {/* 2. FEATURES (LOS 3 PILARES) */}
        <section className="grid md:grid-cols-3 gap-8 text-left relative z-10">
            {/* Card 1 */}
            <div className="p-8 rounded-[2rem] bg-dark-800/60 border border-white/5 backdrop-blur-md hover:border-primary-DEFAULT/50 transition-all hover:-translate-y-1 group shadow-[0_0_30px_rgba(0,0,0,0.2)]">
                <div className="w-14 h-14 bg-linear-to-br from-dark-700 to-dark-800 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform shadow-inner border border-white/5">🧮</div>
                <h3 className="text-xl font-black text-white mb-3 italic group-hover:text-primary-DEFAULT transition-colors">Calculadora Automática</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Cargá tus precios de mano de obra y materiales. El sistema suma todo solo. Cero errores matemáticos.</p>
            </div>
             {/* Card 2 */}
             <div className="p-8 rounded-[2rem] bg-dark-800/60 border border-white/5 backdrop-blur-md hover:border-accent-DEFAULT/50 transition-all hover:-translate-y-1 group shadow-[0_0_30px_rgba(0,0,0,0.2)]">
                <div className="w-14 h-14 bg-linear-to-br from-dark-700 to-dark-800 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform shadow-inner border border-white/5">🚀</div>
                <h3 className="text-xl font-black text-white mb-3 italic group-hover:text-accent-DEFAULT transition-colors">PDF Instantáneo</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Nada de Word. Generamos un link web profesional y un PDF listo para descargar y enviar.</p>
            </div>
             {/* Card 3 */}
             <div className="p-8 rounded-[2rem] bg-dark-800/60 border border-white/5 backdrop-blur-md hover:border-pink-500/50 transition-all hover:-translate-y-1 group shadow-[0_0_30px_rgba(0,0,0,0.2)]">
                <div className="w-14 h-14 bg-linear-to-br from-dark-700 to-dark-800 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform shadow-inner border border-white/5">📲</div>
                <h3 className="text-xl font-black text-white mb-3 italic group-hover:text-pink-500 transition-colors">Cierre por WhatsApp</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Tu cliente recibe el presupuesto y tiene un botón para confirmarte el trabajo por WhatsApp directo.</p>
            </div>
        </section>

        {/* 3. PRICING SECTION (LA OFERTA) */}
        <section className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase mb-12">
                Elegí tu nivel
            </h2>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                
                {/* PLAN FREE */}
                <div className="bg-dark-900/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 flex flex-col items-center text-center hover:border-white/30 transition-colors">
                    <span className="text-gray-400 font-bold uppercase text-xs tracking-widest mb-4">Inicial</span>
                    <div className="text-5xl font-black text-white mb-2 tracking-tighter">GRATIS</div>
                    <p className="text-gray-500 text-sm mb-10">Para probar la herramienta</p>
                    
                    <ul className="space-y-5 mb-10 text-sm text-gray-300 w-full text-left pl-8">
                        <li className="flex items-center gap-3"><span className="text-gray-500 text-lg">✓</span> 6 Presupuestos de prueba</li>
                        <li className="flex items-center gap-3"><span className="text-gray-500 text-lg">✓</span> Calculadora básica</li>
                        <li className="flex items-center gap-3"><span className="text-gray-500 text-lg">✓</span> PDF con marca de agua</li>
                    </ul>

                    <Link href="/login" className="w-full py-5 bg-white/5 text-white font-bold rounded-2xl uppercase text-xs hover:bg-white/10 transition-colors mt-auto tracking-widest border border-white/5">
                        Comenzar Gratis
                    </Link>
                </div>

                {/* PLAN PRO (OFERTA) */}
                <div className="bg-dark-800/90 backdrop-blur-xl border-2 border-yellow-500/50 rounded-[2.5rem] p-10 flex flex-col items-center text-center relative overflow-hidden transform md:scale-105 shadow-[0_0_50px_rgba(234,179,8,0.2)] z-20">
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-linear-to-r from-yellow-400 to-orange-500"></div>
                    <div className="absolute top-5 right-5 bg-green-500 text-black text-[10px] font-black px-3 py-1.5 rounded-full animate-pulse shadow-lg shadow-green-500/20">
                        50% OFF
                    </div>

                    <span className="text-yellow-500 font-bold uppercase text-xs tracking-widest mb-4">Profesional</span>
                    
                    <div className="flex items-end justify-center gap-3 mb-2">
                         <span className="text-gray-500 line-through text-xl font-bold decoration-red-500 decoration-2 mb-2">$10.000</span>
                         <div className="text-6xl font-black text-white tracking-tighter">$5.000</div>
                    </div>
                    <p className="text-gray-400 text-xs mb-10 uppercase font-bold tracking-wider">Pago Mensual (Cancela cuando quieras)</p>
                    
                    <ul className="space-y-5 mb-10 text-sm text-white w-full text-left pl-8">
                        <li className="flex items-center gap-3"><span className="text-yellow-500 text-lg drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">★</span> <b>Presupuestos ILIMITADOS</b></li>
                        <li className="flex items-center gap-3"><span className="text-yellow-500 text-lg">★</span> Calculadora completa</li>
                        <li className="flex items-center gap-3"><span className="text-yellow-500 text-lg">★</span> Sin marca de agua</li>
                        <li className="flex items-center gap-3"><span className="text-yellow-500 text-lg">★</span> Soporte prioritario</li>
                    </ul>

                    <Link href="/login" className="w-full py-5 bg-linear-to-r from-yellow-400 to-orange-500 text-black font-black rounded-2xl uppercase text-xs hover:scale-105 transition-transform mt-auto shadow-xl shadow-orange-500/30 tracking-widest">
                        Obtener Oferta
                    </Link>
                </div>

            </div>
        </section>

        {/* FOOTER */}
        <footer className="pt-20 pb-10 border-t border-white/5 text-center relative z-10">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                © 2024 Propuesta Monster. Hecho para laburantes.
            </p>
        </footer>

      </div>
    </main>
  );
}