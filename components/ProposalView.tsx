"use client";
import { useEffect, useState, useMemo } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

interface FreelancerData {
  fullName: string;
  businessName: string;
  phone: string;
  portfolioLinks?: string[];
}

interface DisplayItem {
  id?: string; // Hacemos el ID opcional por compatibilidad
  title?: string;
  description?: string;
  price: number;
  type?: string;
  desc?: string;
}

interface ProposalData {
  id: string;
  clientName: string;
  whatsapp?: string;
  jobTitle?: string;
  items?: Array<DisplayItem>;
  services?: Array<DisplayItem>;
  total: number; // Este es el total original máximo
  status: string;
  freelancerId: string;
  portfolioUrl?: string;
  createdAt: Timestamp;
}

export default function ProposalView({ proposal }: { proposal: ProposalData }) {
  const { user } = useAuth();
  const [freelancer, setFreelancer] = useState<FreelancerData | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // 1. Unificamos los ítems
  const allItems: DisplayItem[] = useMemo(() => 
    proposal.services || proposal.items || [], 
  [proposal.services, proposal.items]);

  // 2. Estado de Selección (Guardamos los ÍNDICES de los items seleccionados)
  // Al principio, seleccionamos TODO por defecto.
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    // Inicializar con todos seleccionados
    setSelectedIndexes(allItems.map((_, index) => index));
  }, [allItems]);

  // 3. Función para calcular el total dinámico
  const dynamicTotal = selectedIndexes.reduce((sum, index) => {
    return sum + (allItems[index]?.price || 0);
  }, 0);

  // 4. Función para alternar selección
  const toggleItem = (index: number) => {
    if (selectedIndexes.includes(index)) {
      setSelectedIndexes(selectedIndexes.filter(i => i !== index));
    } else {
      setSelectedIndexes([...selectedIndexes, index]);
    }
  };

  const isOwner = user?.uid === proposal.freelancerId;
  const shareUrl = isMounted ? `${window.location.origin}/p/${proposal.id}` : "";

  // 5. Carga de datos del Freelancer
  useEffect(() => {
    const fetchFreelancer = async () => {
      if (proposal.freelancerId) {
        try {
          const userDoc = await getDoc(doc(db, "users", proposal.freelancerId));
          if (userDoc.exists()) {
            setFreelancer(userDoc.data() as FreelancerData);
          }
        } catch (error) {
          console.error("Error cargando datos del freelancer", error);
        }
      }
    };
    fetchFreelancer();
  }, [proposal.freelancerId]);

  const date = proposal.createdAt?.toDate 
    ? proposal.createdAt.toDate().toLocaleDateString() 
    : new Date().toLocaleDateString();

  // --- LÓGICA WHATSAPP DINÁMICA ---
  
  // Mensaje para el DUEÑO (envía el link general)
  const clientMessage = `Hola ${proposal.clientName}, Soy ${freelancer?.businessName || freelancer?.fullName}. Te paso el presupuesto interactivo para que elijas las opciones: ${shareUrl}`;
  const whatsappLinkOwner = `https://wa.me/${proposal.whatsapp?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(clientMessage)}`;

  // Mensaje para el CLIENTE (envía SOLO lo seleccionado)
  const selectedItemsList = selectedIndexes.map(i => {
    const item = allItems[i];
    return `- ${item.title || item.description || "Item"} ($${item.price})`;
  }).join("\n");

  const freelancerMessage = `Hola, acepto el presupuesto por un total de *$${dynamicTotal.toLocaleString()}*.\n\nItems seleccionados:\n${selectedItemsList}\n\n¿Cómo seguimos?`;
  const whatsappLinkClient = `https://wa.me/${freelancer?.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(freelancerMessage)}`;

  return (
    <div className="bg-dark-800/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-500">
      
      {/* ENCABEZADO */}
      <div className="p-8 md:p-12 border-b border-white/5 bg-linear-to-br from-white/5 to-transparent relative">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[10px] font-black text-primary-DEFAULT uppercase tracking-widest mb-2">Presupuesto Interactivo</p>
            <h1 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase">
              {proposal.jobTitle || "Propuesta de Trabajo"}
            </h1>
          </div>
          <div className="text-right">
            <div className="bg-white text-dark-900 font-black text-xs px-3 py-1 rounded-full uppercase inline-block">
              {date}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-8 mt-8">
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Preparado para:</p>
            <h3 className="text-xl font-bold text-white capitalize">{proposal.clientName}</h3>
            {/* Instrucción visual para el cliente */}
            {!isOwner && (
               <p className="text-xs text-accent-DEFAULT mt-2 animate-pulse">👇 Tocá los ítems para agregar o quitar servicios</p>
            )}
          </div>
          
          {freelancer && (
            <div className="md:text-right">
              <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Por:</p>
              <h3 className="text-xl font-bold text-white capitalize">{freelancer.businessName || freelancer.fullName}</h3>
              <p className="text-sm text-gray-400">{freelancer.phone}</p>
            </div>
          )}
        </div>
      </div>

      {/* --- ÍTEMS SELECCIONABLES --- */}
      <div className="p-8 md:p-12 space-y-4">
        <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest px-4">
          <span>Selección de Servicios</span>
          <span>Importe</span>
        </div>

        <div className="space-y-2">
          {allItems.length > 0 ? (
            allItems.map((item, index) => {
              const mainText = item.title || item.description || "Ítem sin nombre";
              const subText = item.desc || (item.type === 'material' ? 'Materiales' : 'Mano de Obra');
              const isSelected = selectedIndexes.includes(index);
              
              return (
                <div 
                    key={index} 
                    onClick={() => !isOwner && toggleItem(index)} // Solo el cliente puede tocar, el dueño solo mira
                    className={`flex justify-between items-center p-4 rounded-2xl border transition-all cursor-pointer select-none
                        ${isSelected 
                            ? "bg-dark-900/80 border-primary-DEFAULT/50 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]" 
                            : "bg-dark-900/30 border-white/5 opacity-60 hover:opacity-100"
                        }
                    `}
                >
                  <div className="flex items-center gap-4">
                    {/* Checkbox Visual */}
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors
                        ${isSelected ? "bg-primary-DEFAULT border-primary-DEFAULT" : "border-gray-600 bg-transparent"}
                    `}>
                        {isSelected && <span className="text-dark-900 text-xs font-black">✓</span>}
                    </div>

                    <div>
                      <p className={`text-sm font-bold transition-colors ${isSelected ? "text-white" : "text-gray-400"}`}>{mainText}</p>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">{subText}</p>
                    </div>
                  </div>
                  <p className={`font-mono font-bold text-lg transition-colors ${isSelected ? "text-white" : "text-gray-600"}`}>
                    ${(item.price || 0).toLocaleString()}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="text-center p-8 text-gray-500 italic text-sm">No hay ítems cargados.</div>
          )}
        </div>
      </div>

      {/* --- TOTAL DINÁMICO --- */}
      <div className="bg-dark-900 p-8 md:p-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">
                {isOwner ? "Total Presupuestado" : "Total Seleccionado"}
            </p>
            <p className="text-5xl font-black text-white tracking-tighter transition-all duration-300">
              ${dynamicTotal.toLocaleString()}
            </p>
        </div>
        
        {isMounted && (
          isOwner ? (
              proposal.whatsapp ? (
                  <a 
                      href={whatsappLinkOwner}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-4 bg-white text-dark-900 font-black rounded-2xl uppercase text-xs hover:scale-105 transition-transform shadow-xl flex items-center gap-2"
                  >
                      <span>Enviar a Cliente 📤</span>
                  </a>
              ) : (
                  <span className="text-xs text-gray-500 font-bold">Sin teléfono de cliente</span>
              )
          ) : (
              freelancer?.phone && (
                  <a 
                      href={whatsappLinkClient}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-4 bg-green-500 text-white font-black rounded-2xl uppercase text-xs hover:scale-105 transition-transform shadow-[0_0_30px_rgba(34,197,94,0.3)] flex items-center gap-2"
                  >
                      <span>Confirmar (${dynamicTotal}) 💬</span>
                  </a>
              )
          )
        )}
      </div>

      {/* PORTFOLIO */}
      {proposal.portfolioUrl && (
          <div className="p-8 md:p-12 border-t border-white/10 bg-black/20 text-center">
            <a href={proposal.portfolioUrl} target="_blank" rel="noopener noreferrer" className="inline-block px-6 py-3 bg-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/20 transition-all">
              Ver Portfolio de Referencia ↗
            </a>
          </div>
      )}

    </div>
  );
}