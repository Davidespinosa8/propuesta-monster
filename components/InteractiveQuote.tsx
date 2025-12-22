"use client";
import { useState } from "react";

// Definimos la estructura de un servicio
interface ServiceItem {
  id: string;
  title: string;
  price: number;
  desc: string;
}

// Definimos las propiedades que recibe el componente
interface Props {
  clientName?: string;
  basePrice?: number;
  customServices?: ServiceItem[]; // Lista de servicios dinámica
  onConfirm?: (total: number, items: string[]) => void;
}

export default function InteractiveQuote({ 
  clientName = "Cliente VIP", 
  basePrice = 500, 
  customServices, 
  onConfirm 
}: Props) {

  // Si no vienen servicios del dashboard, usamos estos de ejemplo (Modo Demo)
  const defaultAddons: ServiceItem[] = [
    { id: "reels", title: "Pack 4 Reels / TikToks", price: 200, desc: "Edición dinámica con subtítulos." },
    { id: "ads", title: "Gestión Meta Ads", price: 150, desc: "Campañas publicitarias optimizadas." },
    { id: "photos", title: "Sesión de Fotos", price: 120, desc: "10 fotos de producto editadas." },
  ];

  // Usamos los servicios custom o los por defecto
  const addons = customServices && customServices.length > 0 ? customServices : defaultAddons;

  // Estado de selección (por defecto seleccionamos el primero si existe)
  const [selected, setSelected] = useState<string[]>(addons.length > 0 ? [addons[0].id] : []);

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  // Cálculo del total
  const total = basePrice + addons
    .filter((a) => selected.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0);

  const handleButtonClick = () => {
    if (onConfirm) {
      // Obtenemos los títulos de los items seleccionados para el mensaje
      const selectedTitles = addons
        .filter(a => selected.includes(a.id))
        .map(a => a.title);
      
      onConfirm(total, selectedTitles);
    } else {
      alert(`Modo Demo: El total es $${total} para ${clientName}.`);
    }
  };

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden font-sans">
      
      {/* 1. FONDO DE CUADRILLÉ (GRID) + LUCES AMBIENTALES */}
      <div className="absolute inset-0 bg-dark-900 z-0">
        <div className="absolute inset-0 bg-grid-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        {/* Luz central violeta */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary-DEFAULT opacity-10 blur-[120px]"></div>
      </div>

      {/* 2. CONTENIDO PRINCIPAL */}
      <div className="relative z-10 w-full max-w-5xl p-6 grid md:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: SERVICIOS */}
        <div className="md:col-span-2 space-y-8">
          <header>
            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-2 glow-text-animated">Propuesta Digital</p>
            <h1 className="text-5xl font-extrabold text-white mb-2 leading-tight">
              Hola, <br />
              <span className="bg-clip-text text-transparent bg-linear-to-r from-primary-DEFAULT to-accent-DEFAULT">
                {clientName}
              </span>
            </h1>
            <p className="text-gray-400">Configura el alcance de tu próximo mes.</p>
          </header>

          {/* TARJETA PLAN BASE */}
          <div className="relative group">
            <div className="absolute -inset-px bg-linear-to-r from-primary-DEFAULT via-primary-glow to-accent-dim rounded-2xl blur-md opacity-40 group-hover:opacity-60 transition duration-500 animate-pulse-slow"></div>
            
            <div className="relative bg-dark-800/80 p-6 rounded-2xl border border-dark-700/50 backdrop-blur-xl">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-white">Servicio Base (Core)</h2>
                <span className="bg-primary-DEFAULT/20 text-xs font-bold px-3 py-1 rounded-full border border-primary-DEFAULT/30 glow-text-animated">MENSUAL</span>
              </div>
              <p className="font-extrabold text-3xl mt-2 glow-text-animated">${basePrice} <span className="text-sm text-gray-500 font-normal">/mes</span></p>
              <ul className="mt-6 space-y-3 text-gray-300 text-sm font-medium">
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-accent-DEFAULT rounded-full mr-3 shadow-[0_0_8px_rgba(110,231,183,0.8)]"></span>Estrategia y Planificación</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-accent-DEFAULT rounded-full mr-3 shadow-[0_0_8px_rgba(110,231,183,0.8)]"></span>Reporte de Resultados</li>
                <li className="flex items-center"><span className="w-1.5 h-1.5 bg-accent-DEFAULT rounded-full mr-3 shadow-[0_0_8px_rgba(110,231,183,0.8)]"></span>Soporte Prioritario</li>
              </ul>
            </div>
          </div>

          {/* LISTA DE EXTRAS INTERACTIVOS */}
          <div className="space-y-4 pt-6">
            <p className="text-xs uppercase tracking-widest text-gray-500 font-bold ml-1">Potenciadores (Click para añadir)</p>
            {addons.map((item) => {
              const isActive = selected.includes(item.id);
              return (
                <div key={item.id} onClick={() => toggle(item.id)} className="relative group cursor-pointer">
                  
                  {/* Glow trasero al activar */}
                  <div className={`absolute -inset-px rounded-xl blur transition-all duration-300
                    ${isActive 
                      ? "bg-linear-to-r from-accent-DEFAULT to-accent-dim opacity-70 blur-md scale-[1.02]" 
                      : "bg-linear-to-r from-dark-700 to-primary-DEFAULT/30 opacity-0 group-hover:opacity-40"
                    }`}></div>
                  
                  {/* Tarjeta del item */}
                  <div className={`relative p-5 rounded-xl border transition-all flex justify-between items-center backdrop-blur-md
                    ${isActive 
                      ? "bg-dark-800/90 border-accent-DEFAULT/50" 
                      : "bg-dark-900/60 border-dark-700 group-hover:border-dark-600"}`}>
                    <div>
                      <h3 className={`font-bold text-lg transition-colors ${isActive ? "text-white" : "text-gray-300"}`}>{item.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                    </div>
                    <div className={`font-extrabold text-lg transition-all ${isActive ? "glow-text-animated scale-110" : "text-gray-600"}`}>
                      +${item.price}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMNA DERECHA: RESUMEN FLOTANTE */}
        <div className="md:col-span-1">
          <div className="sticky top-10 group">
            {/* Glow potente trasero */}
            <div className="absolute -inset-0.5 bg-linear-to-tr from-primary-DEFAULT via-accent-DEFAULT to-primary-glow rounded-3xl blur-xl opacity-50 animate-pulse-slow"></div>
            
            <div className="relative bg-dark-800/90 border border-dark-700/50 p-8 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col justify-between min-h-100">
              <div>
                <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-8">Resumen de Inversión</h3>
                <div className="space-y-4 mb-8 text-sm font-medium">
                  <div className="flex justify-between text-gray-300">
                     <span>Plan Base</span> <span>${basePrice}</span>
                  </div>
                   {addons.filter(a => selected.includes(a.id)).map(a => (
                     <div key={a.id} className="flex justify-between text-accent-dim">
                       <span>+ {a.title}</span> <span>${a.price}</span>
                     </div>
                   ))}
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-end mb-8 py-4 border-t border-dark-700/50">
                  <span className="text-white font-bold">Total Mensual</span>
                  <span className="text-5xl font-black text-transparent bg-clip-text bg-linear-to-br from-white via-accent-DEFAULT to-accent-dim drop-shadow-[0_0_15px_rgba(110,231,183,0.5)] transition-all">
                    ${total}
                  </span>
                </div>

                <button 
                  onClick={handleButtonClick}
                  className="w-full py-4 bg-linear-to-r from-accent-DEFAULT to-accent-dim text-dark-900 font-black text-lg rounded-xl hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(110,231,183,0.6)] transition-all active:scale-95 relative overflow-hidden group"
                >
                  <span className="relative z-10">Confirmar Presupuesto</span>
                  {/* Efecto de brillo al pasar el mouse */}
                  <div className="absolute inset-0 h-full w-full bg-white/30 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}