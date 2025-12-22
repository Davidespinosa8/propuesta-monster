"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import InteractiveQuote from "@/components/InteractiveQuote";

// 1. Definimos la estructura exacta de los datos (Adiós al 'any')
interface ProposalData {
  freelancerName: string;
  clientName: string;
  basePrice: number;
  whatsapp: string;
  services: { id: string; title: string; price: number; desc: string }[];
}

function ProposalViewer() {
  const searchParams = useSearchParams();
  const dataString = searchParams.get("data");

  // 2. Usamos useMemo en lugar de useEffect.
  const proposalData = useMemo<ProposalData | null>(() => {
    if (!dataString) return null;
    try {
      return JSON.parse(decodeURIComponent(dataString));
    } catch (e) {
      console.error("Error al leer datos de la URL", e);
      return null;
    }
  }, [dataString]);

  // Si no hay datos válidos, mostramos carga o error
  if (!proposalData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900 text-gray-500 font-sans">
        <div className="text-center">
          <p>Cargando propuesta...</p>
          <p className="text-xs mt-2 text-gray-700">(Si esto tarda, el link podría estar roto)</p>
        </div>
      </div>
    );
  }

  // Lógica para enviar el mensaje de WhatsApp al confirmar
  const handleConfirm = (total: number, items: string[]) => {
    const message = `Hola *${proposalData.freelancerName}*! Soy ${proposalData.clientName}.%0A%0AAcepto el presupuesto por un total de: *$${total}*.%0A%0AItems seleccionados:%0A- ${items.join("%0A- ")}%0A%0A¿Cómo seguimos?`;
    
    window.open(`https://wa.me/${proposalData.whatsapp}?text=${message}`, "_blank");
  };

  return (
    <InteractiveQuote 
      clientName={proposalData.clientName}
      basePrice={proposalData.basePrice}
      customServices={proposalData.services}
      onConfirm={handleConfirm}
    />
  );
}

// Componente principal
export default function ProposalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark-900 flex items-center justify-center text-white">Cargando...</div>}>
      <ProposalViewer />
    </Suspense>
  );
}