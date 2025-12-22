import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-dark-900 text-center px-4">

      {/* FONDO GRID + LUCES (Igual que el presupuesto) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-grid-white mask-[radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-primary-DEFAULT opacity-20 blur-[120px]"></div>
      </div>

      <div className="relative z-10 space-y-8">
        {/* LOGO ANIMADO */}
        <p className="text-xs font-bold tracking-[0.3em] uppercase glow-text-animated mb-4">Software para Agencias</p>
        
        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter">
          PROPUESTA<br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary-DEFAULT to-accent-DEFAULT">MONSTER</span>
        </h1>
        
        <p className="text-gray-400 text-xl max-w-xl mx-auto">
          No mandes PDFs aburridos. Crea presupuestos interactivos que <span className="text-white font-bold">cierran la venta por ti</span>.
        </p>

        {/* BOTÓN DE ACCIÓN */}
        <div className="pt-8">
          <Link href="/crear" className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-linear-to-r from-primary-DEFAULT to-primary-glow rounded-full hover:scale-105 hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]">
            <span className="mr-2">Crear Nuevo Presupuesto</span>
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
          </Link>
        </div>
      </div>
    </main>
  );
}