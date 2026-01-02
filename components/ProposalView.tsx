"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

interface FreelancerData {
  fullName: string;
  businessName: string;
  phone: string;
  portfolioLinks?: string[];
}

interface DisplayItem {
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
  items?: Array<{ description: string; price: number; type: string }>;
  services?: Array<{ title: string; price: number; desc: string }>;
  total: number;
  status: string;
  freelancerId: string;
  portfolioUrl?: string;
  createdAt: Timestamp;
}

export default function ProposalView({ proposal }: { proposal: ProposalData }) {
  const { user } = useAuth();
  const [freelancer, setFreelancer] = useState<FreelancerData | null>(null);
  
  const [isMounted, setIsMounted] = useState(false);

  const displayItems: DisplayItem[] = proposal.services || proposal.items || [];
  const isOwner = user?.uid === proposal.freelancerId;

    useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const shareUrl = isMounted ? `${window.location.origin}/p/${proposal.id}` : "";

  // El mensaje de WhatsApp 
  const clientMessage = `Hola ${proposal.clientName}, Soy ${freelancer?.businessName || freelancer?.fullName}. Este es el presupuesto: ${shareUrl}`;
  const whatsappLinkClient = `https://wa.me/${proposal.whatsapp?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(clientMessage)}`;

  const freelancerMessage = `Hola, vi el presupuesto para ${proposal.clientName} y me interesa avanzarlo.`;
  const whatsappLinkFreelancer = `https://wa.me/${freelancer?.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(freelancerMessage)}`;

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

  return (
    <div className="bg-dark-800/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-500">
      
      {/* ENCABEZADO */}
      <div className="p-8 md:p-12 border-b border-white/5 bg-linear-to-br from-white/5 to-transparent relative">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[10px] font-black text-primary-DEFAULT uppercase tracking-widest mb-2">Presupuesto Digital</p>
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

      {/* ÍTEMS */}
      <div className="p-8 md:p-12 space-y-4">
        <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest px-4">
          <span>Detalle</span>
          <span>Importe</span>
        </div>

        <div className="space-y-2">
          {displayItems.length > 0 ? (
            displayItems.map((item: DisplayItem, index: number) => {
              const mainText = item.title || item.description || "Ítem sin nombre";
              const subText = item.desc || (item.type === 'material' ? 'Materiales' : 'Mano de Obra');
              
              return (
                <div key={index} className="flex justify-between items-center bg-dark-900/50 p-4 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <span className="text-xl">
                      {subText.toLowerCase().includes('material') ? '📦' : '🛠️'}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">{mainText}</p>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">{subText}</p>
                    </div>
                  </div>
                  <p className="font-mono font-bold text-white text-lg">
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

      {/* TOTAL Y ACCIONES */}
      <div className="bg-dark-900 p-8 md:p-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Inversión Total</p>
            <p className="text-5xl font-black text-white tracking-tighter">
              ${proposal.total.toLocaleString()}
            </p>
        </div>
        
        {isMounted && (
          isOwner ? (
              proposal.whatsapp ? (
                  <a 
                      href={whatsappLinkClient}
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
                      href={whatsappLinkFreelancer}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-8 py-4 bg-green-500 text-white font-black rounded-2xl uppercase text-xs hover:scale-105 transition-transform shadow-[0_0_30px_rgba(34,197,94,0.3)] flex items-center gap-2"
                  >
                      <span>Aceptar / Contactar 💬</span>
                  </a>
              )
          )
        )}
      </div>

      {/* PORTFOLIO */}
      {proposal.portfolioUrl ? (
          <div className="p-8 md:p-12 border-t border-white/10 bg-black/20 text-center">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Portafolio Adjunto</p>
            <a href={proposal.portfolioUrl} target="_blank" rel="noopener noreferrer" className="inline-block px-6 py-3 bg-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/20 transition-all">
              Ver Portfolio de Referencia ↗
            </a>
          </div>
      ) : (
        freelancer?.portfolioLinks && freelancer.portfolioLinks.length > 0 && (
          <div className="p-8 md:p-12 border-t border-white/10 bg-black/20">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 text-center">Referencias de trabajos anteriores</p>
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
              {freelancer.portfolioLinks.map((link: string, i: number) => (
                <div key={i} className="flex-none w-40 aspect-square relative rounded-xl overflow-hidden border border-white/10 snap-center">
                  <Image src={link} alt="Portfolio" fill className="object-cover" unoptimized />
                </div>
              ))}
            </div>
          </div>
        )
      )}

    </div>
  );
}