"use client";
import { useEffect, useState } from "react";
// Importamos el hook específico para leer la URL en el cliente
import { useParams } from "next/navigation"; 
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import InteractiveQuote from "@/components/InteractiveQuote";

interface ProposalData {
  freelancerName: string;
  clientName: string;
  basePrice: number;
  whatsapp: string;
  services: { id: string; title: string; price: number; desc: string }[];
}

// NOTA: Quitamos { params } de los argumentos de la función para evitar el error de Promesa
export default function ProposalViewer() {
  // 1. Usamos el hook useParams. Next.js se encarga de darnos el ID correctamente.
  const params = useParams();
  
  // Aseguramos que el id sea un string (a veces puede venir como array)
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [data, setData] = useState<ProposalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Si el ID aún no está listo o es undefined, no hacemos nada para evitar el error de Firebase
    if (!id) return;

    const fetchData = async () => {
      console.log("🔍 Buscando en Firebase ID:", id);

      try {
        // Ahora id seguro es un string, Firebase no fallará con "indexOf"
        const docRef = doc(db, "proposals", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log("✅ Datos encontrados:", docSnap.data());
          setData(docSnap.data() as ProposalData);
        } else {
          console.error("❌ Documento no encontrado en la DB");
          setErrorMsg("El presupuesto no existe o fue eliminado.");
        }
      } catch (error) {
        console.error("🔥 Error crítico de Firebase:", error);
        setErrorMsg("Error de conexión. Revisa tu internet o la consola.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center text-white space-y-4">
      <div className="w-12 h-12 border-4 border-primary-DEFAULT border-t-transparent rounded-full animate-spin"></div>
      <p className="animate-pulse">Cargando propuesta...</p>
    </div>
  );
  
  if (!data) return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center text-red-400 p-4 text-center">
      <h2 className="text-3xl font-bold mb-2">Error 404</h2>
      <p className="text-xl text-white">{errorMsg || "Presupuesto no encontrado."}</p>
      <p className="text-gray-600 text-sm mt-8 font-mono bg-black/30 p-2 rounded">ID Intentado: {id}</p>
    </div>
  );

  const handleConfirm = (total: number, items: string[]) => {
    const message = `Hola *${data.freelancerName}*! Soy ${data.clientName}.%0A%0AAcepto el presupuesto id:${id}.%0AItems: ${items.join(", ")}%0ATotal: *$${total}*.`;
    window.open(`https://wa.me/${data.whatsapp}?text=${message}`, "_blank");
  };

  return (
    <InteractiveQuote 
      clientName={data.clientName}
      basePrice={data.basePrice}
      customServices={data.services}
      onConfirm={handleConfirm}
    />
  );
}