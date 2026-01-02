"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, Timestamp, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import ProposalView from "@/components/ProposalView";
import Link from "next/link";

interface ProposalData {
  id: string;
  clientName: string;
  jobTitle?: string;
  items: Array<{ description: string; price: number; type: string }>;
  total: number;
  status: string;
  createdAt: Timestamp;
  freelancerId: string;
  viewedAt?: Timestamp;
}

export default function ProposalPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndTrackProposal = async () => {
      if (!id || typeof id !== 'string') return;
      try {
        const docRef = doc(db, "proposals", id);
        const snap = await getDoc(docRef);
        
        if (snap.exists()) {
          // CORRECCIÓN: Le decimos a TS que excluya 'id' de los datos crudos para no duplicarlo al unirlo
          const rawData = snap.data() as Omit<ProposalData, 'id'>;
          
          const fullData: ProposalData = { 
            id: snap.id, 
            ...rawData 
          };
          
          setProposal(fullData);

          if (user?.uid !== fullData.freelancerId && !fullData.viewedAt) {
             await updateDoc(docRef, {
               viewedAt: serverTimestamp()
             });
          }
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAndTrackProposal();
  }, [id, user]);

  if (loading) return <div className="min-h-screen bg-dark-900 flex items-center justify-center text-white animate-pulse text-xs font-bold uppercase">Cargando...</div>;
  if (!proposal) return <div className="min-h-screen bg-dark-900 flex items-center justify-center text-gray-500 font-bold uppercase">No encontrado</div>;

  return (
    <div className="min-h-screen bg-dark-900 text-white p-4 md:p-8 flex justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-grid-white mask-[radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      </div>
      <div className="w-full max-w-4xl animate-in fade-in zoom-in-95 duration-500 relative z-10">
        <div className="mb-6">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-black text-gray-500 hover:text-white uppercase tracking-wider transition-colors group">
                <span className="group-hover:-translate-x-1 transition-transform">←</span> Volver al Dashboard
            </Link>
        </div>
        <ProposalView proposal={proposal} />
      </div>
    </div>
  );
}