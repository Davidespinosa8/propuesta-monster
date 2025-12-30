"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

export default function ViewProposal() {
  const { id } = useParams();
  const { user } = useAuth();
  const [proposal, setProposal] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const docSnap = await getDoc(doc(db, "proposals", id as string));
      if (docSnap.exists()) {
        setProposal(docSnap.data());
        setSelectedIds(docSnap.data().services.map((s: any) => s.id));
      }
    };
    fetch();
  }, [id]);

  if (!proposal) return <div className="text-white text-center mt-20">Cargando...</div>;

  const isOwner = user?.uid === proposal.freelancerId;
  const currentTotal = proposal.services
    .filter((s: any) => selectedIds.includes(s.id))
    .reduce((acc: number, s: any) => acc + s.price, 0);

  const toggleItem = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleAccept = () => {
    const selected = proposal.services.filter((s: any) => selectedIds.includes(s.id)).map((s: any) => s.title).join(", ");
    const msg = `Hola ${proposal.freelancerName}, acepto realizar: ${selected}. Total: $${currentTotal}`;
    window.open(`https://wa.me/${proposal.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-dark-900 p-4 flex justify-center items-start">
      <div className="max-w-xl w-full bg-dark-800 rounded-[2.5rem] border border-white/10 overflow-hidden">
        
        {/* Cabecera */}
        <div className="p-8 bg-white/5 border-b border-white/10">
          <h1 className="text-3xl font-black text-white">{proposal.clientName}</h1>
          <p className="text-gray-400">Presupuesto de <span className="text-white font-bold">{proposal.freelancerName}</span></p>
        </div>

        {/* BOTÓN PORTAFOLIO DINÁMICO */}
        {proposal.portfolioUrl && (
          <div className="p-4 bg-primary-DEFAULT/10 border-b border-primary-DEFAULT/20 flex items-center justify-between">
            <span className="text-xs text-white font-bold">📸 Mira mis trabajos anteriores:</span>
            <a href={proposal.portfolioUrl} target="_blank" className="bg-primary-DEFAULT text-white text-[10px] font-black px-4 py-2 rounded-full shadow-lg">VER PORTAFOLIO</a>
          </div>
        )}

        {/* LISTADO INTERACTIVO */}
        <div className="p-6 space-y-3">
          <p className="text-[10px] text-gray-500 uppercase font-bold italic">Seleccioná los ítems para actualizar el total:</p>
          {proposal.services.map((s: any) => (
            <div 
              key={s.id} 
              onClick={() => toggleItem(s.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${selectedIds.includes(s.id) ? 'bg-white/5 border-primary-DEFAULT opacity-100' : 'border-white/5 opacity-30 grayscale'}`}
            >
              <div>
                <h3 className="text-white font-bold text-sm">{s.title}</h3>
                <p className="text-gray-500 text-[10px]">{s.desc}</p>
              </div>
              <p className="text-white font-mono font-bold">${s.price.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Footer con Total y WhatsApp */}
        <div className="p-8 bg-black/30 border-t border-white/10">
          <div className="flex justify-between items-end mb-6">
            <span className="text-gray-400 font-bold text-sm uppercase">Total Seleccionado</span>
            <span className="text-4xl font-black text-white">${currentTotal.toLocaleString()}</span>
          </div>

          {isOwner ? (
            <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="w-full py-4 bg-white text-black font-black rounded-2xl">COPIAR LINK DEL PRESUPUESTO</button>
          ) : (
            <button onClick={handleAccept} className="w-full py-4 bg-green-500 text-white font-black rounded-2xl text-lg shadow-xl shadow-green-500/20">ACEPTAR POR WHATSAPP ✅</button>
          )}
        </div>
      </div>
    </main>
  );
}