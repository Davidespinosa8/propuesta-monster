"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc } from "firebase/firestore"; 
import { db } from "@/lib/firebase";

export default function CreateQuote() {
  const router = useRouter();

  // ESTADOS
  const [formData, setFormData] = useState({
    freelancerName: "d8 creative",
    clientName: "",
    basePrice: 500,
    whatsapp: "",
  });

  const [services, setServices] = useState([
    { id: "1", title: "Pack Reels", price: 200, desc: "Edición dinámica" },
    { id: "2", title: "Meta Ads", price: 150, desc: "Setup de campañas" },
  ]);

  // FUNCIONES
  const addService = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setServices([...services, { id: newId, title: "", price: 0, desc: "" }]);
  };

  const updateService = (id: string, field: string, value: string | number) => {
    setServices(services.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  // Reemplaza la función generateLink con esta:
  const saveToFirebase = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // 1. Preparamos el objeto limpio para guardar
      const proposalData = {
        ...formData,
        services: services,
        createdAt: new Date(), // Guardamos la fecha
        status: "pending" // Estado inicial
      };

      // 2. Guardamos en la colección "proposals"
      const docRef = await addDoc(collection(db, "proposals"), proposalData);
      
      // 3. Redirigimos usando el ID que nos dio Firebase
      // Nota que la ruta cambió a /p/[id]
      router.push(`/p/${docRef.id}`);

    } catch (error) {
      console.error("Error guardando documento: ", error);
      alert("Error al guardar. Revisa la consola.");
    }
  };

  return (
    <main className="relative min-h-screen bg-dark-900 flex justify-center items-center py-20 px-4 font-sans">
      
      {/* FONDO AMBIENTAL */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-grid-white opacity-20 mask-[linear-gradient(to_bottom,transparent,black)]"></div>
        <div className="absolute top-0 right-0 w-125 h-125 bg-accent-DEFAULT opacity-5 blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-125 h-125 bg-primary-DEFAULT opacity-5 blur-[100px]"></div>
      </div>

      {/* TARJETA DEL FORMULARIO */}
      <div className="relative z-10 w-full max-w-2xl">
        
        {/* Encabezado Tarjeta */}
        <div className="text-center mb-8">
          <p className="text-accent-DEFAULT text-xs font-bold tracking-widest uppercase mb-2">Panel de Control</p>
          <h2 className="text-4xl font-black text-white">Diseña tu Oferta</h2>
        </div>

        <form onSubmit={saveToFirebase} className="bg-dark-800/60 backdrop-blur-xl border border-dark-700/50 p-8 rounded-3xl shadow-2xl relative group">
          
          {/* Borde brillante sutil animado */}
          <div className="absolute -inset-px bg-linear-to-r from-primary-DEFAULT/20 to-accent-DEFAULT/20 rounded-3xl blur-sm -z-10 group-hover:opacity-100 transition duration-500"></div>

          <div className="space-y-8">
            
            {/* SECCIÓN 1: DATOS CLAVE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase font-bold ml-1">Tu Marca</label>
                <input type="text" value={formData.freelancerName} onChange={e => setFormData({...formData, freelancerName: e.target.value})}
                  className="w-full bg-dark-900/50 border border-dark-700 rounded-xl p-4 text-white focus:border-primary-DEFAULT focus:shadow-[0_0_15px_rgba(139,92,246,0.1)] outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase font-bold ml-1">Cliente Objetivo</label>
                <input type="text" placeholder="Ej: Nike" required onChange={e => setFormData({...formData, clientName: e.target.value})}
                  className="w-full bg-dark-900/50 border border-dark-700 rounded-xl p-4 text-white focus:border-accent-DEFAULT focus:shadow-[0_0_15px_rgba(110,231,183,0.1)] outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase font-bold ml-1">Precio Base ($)</label>
                <input type="number" required value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: Number(e.target.value)})}
                  className="w-full bg-dark-900/50 border border-dark-700 rounded-xl p-4 text-white font-mono text-lg focus:border-white outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase font-bold ml-1">Whatsapp Venta</label>
                <input type="text" placeholder="549..." required onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                  className="w-full bg-dark-900/50 border border-dark-700 rounded-xl p-4 text-white focus:border-white outline-none transition-all" />
              </div>
            </div>

            {/* SECCIÓN 2: EXTRAS */}
            <div className="pt-6 border-t border-dark-700/50">
              <div className="flex justify-between items-end mb-4">
                <label className="text-xs text-gray-400 uppercase font-bold ml-1">Upselling (Items Extra)</label>
                <button type="button" onClick={addService} 
                  className="text-xs bg-dark-700 hover:bg-white hover:text-black text-white px-3 py-1.5 rounded-lg transition-colors font-bold">
                  + Agregar Item
                </button>
              </div>

              <div className="space-y-3">
                {services.map((service) => (
                  <div key={service.id} className="flex gap-3 items-start p-3 rounded-xl bg-dark-900/30 border border-dark-700/30 hover:border-dark-600 transition-colors">
                    <div className="flex-1 space-y-2">
                      <input type="text" placeholder="Título del servicio" value={service.title} 
                        onChange={e => updateService(service.id, 'title', e.target.value)}
                        className="w-full bg-transparent text-sm font-bold text-white placeholder-gray-600 focus:text-accent-DEFAULT outline-none" />
                      <input type="text" placeholder="Descripción corta" value={service.desc} 
                        onChange={e => updateService(service.id, 'desc', e.target.value)}
                        className="w-full bg-transparent text-xs text-gray-500 outline-none" />
                    </div>
                    <div className="w-20">
                      <input type="number" placeholder="$" value={service.price} 
                        onChange={e => updateService(service.id, 'price', Number(e.target.value))}
                        className="w-full bg-transparent text-right text-white font-mono text-sm focus:text-accent-DEFAULT outline-none" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BOTÓN GENERAR */}
            <button type="submit" className="group w-full py-4 bg-linear-to-r from-primary-DEFAULT to-primary-glow text-white font-black text-lg rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)] transition-all relative overflow-hidden">
              <span className="relative z-10">GENERAR LINK MÁGICO ✨</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>

          </div>
        </form>
      </div>
    </main>
  );
}