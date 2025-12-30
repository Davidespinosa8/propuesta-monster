"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase"; // Solo importamos db, chau storage
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Image from "next/image";

export default function UserProfile() {
  const { user } = useAuth();
  
  const [profile, setProfile] = useState({
    fullName: "",
    businessName: "",
    phone: "",
    portfolioLinks: [] as string[]
  });

  // ESTADOS (Simplificados)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputLink, setInputLink] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const d = snap.data();
          setProfile({
            fullName: d.fullName || "",
            businessName: d.businessName || "",
            phone: d.phone || "",
            portfolioLinks: d.portfolioLinks || []
          });
        }
      } catch (error) {
        console.error("Error cargando perfil:", error);
      }
    };
    fetchProfile();
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    await updateDoc(doc(db, "users", user.uid), profile);
    setIsSaving(false);
    // Feedback visual simple en consola por ahora
    console.log("Perfil guardado correctamente");
  };

  const handleAddLink = () => {
    if (inputLink && profile.portfolioLinks.length < 10) {
      setProfile(p => ({ ...p, portfolioLinks: [...p.portfolioLinks, inputLink] }));
      setInputLink("");
      setIsModalOpen(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-dark-800/60 backdrop-blur-2xl rounded-[3rem] border border-white/10 p-8 md:p-12 space-y-10 shadow-2xl relative">
      
      <div className="space-y-2">
        <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter">Mi Perfil</h2>
        <p className="text-accent-DEFAULT font-bold text-[10px] uppercase tracking-[0.3em]">Gestión de Identidad</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            value={profile.fullName} 
            onChange={e => setProfile({...profile, fullName: e.target.value})} 
            placeholder="Tu Nombre" 
            className="w-full bg-dark-900 border border-white/5 rounded-2xl p-4 text-white outline-none focus:border-primary-DEFAULT transition-all" 
          />
          <input 
            value={profile.businessName} 
            onChange={e => setProfile({...profile, businessName: e.target.value})} 
            placeholder="Tu Negocio" 
            className="w-full bg-dark-900 border border-white/5 rounded-2xl p-4 text-white outline-none focus:border-primary-DEFAULT transition-all" 
          />
        </div>

        <div className="flex gap-3">
          <div className="bg-dark-900 border border-white/5 p-4 rounded-2xl text-gray-500 font-bold">+54 9</div>
          <input 
            placeholder="11 1234 5678" 
            value={profile.phone} 
            onChange={e => setProfile({...profile, phone: e.target.value})} 
            className="flex-1 bg-dark-900 border border-white/5 rounded-2xl p-4 text-white outline-none" 
          />
        </div>

        {/* PORTFOLIO DE FOTOS */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Portfolio ({profile.portfolioLinks.length}/10)</label>
          <div className="grid grid-cols-5 gap-3">
            {profile.portfolioLinks.map((link, i) => (
              <div key={i} className="aspect-square bg-dark-900 rounded-2xl overflow-hidden relative group border border-white/10">
                <Image src={link} alt="Obra" fill className="object-cover" unoptimized />
                <button 
                  type="button"
                  onClick={() => setProfile({...profile, portfolioLinks: profile.portfolioLinks.filter((_, idx) => idx !== i)})} 
                  className="absolute inset-0 bg-red-600/90 flex items-center justify-center opacity-0 group-hover:opacity-100 text-[10px] font-black text-white transition-all"
                >
                  BORRAR
                </button>
              </div>
            ))}
            
            {profile.portfolioLinks.length < 10 && (
              <button 
                type="button" 
                onClick={() => setIsModalOpen(true)} 
                className="aspect-square bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-gray-400 hover:text-white transition-all text-2xl"
              >
                +
              </button>
            )}
          </div>
          <p className="text-[9px] text-gray-600 italic text-center px-4">
            Tip: Usá fotos de Imgur, PostImages o Google Drive (públicas) para que carguen rápido.
          </p>
        </div>
      </div>

      <button 
        onClick={saveProfile} 
        disabled={isSaving} 
        className="w-full py-5 bg-white text-dark-900 font-black rounded-[2rem] uppercase italic text-sm hover:scale-[1.02] transition-transform"
      >
        {isSaving ? "Guardando..." : "Actualizar Portfolio"}
      </button>

      {/* --- MODAL SIMPLIFICADO (SOLO LINK) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-dark-800 border border-white/10 p-10 rounded-[3rem] w-full max-w-sm space-y-8 relative shadow-2xl scale-100">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-8 right-8 text-gray-500 hover:text-white"
            >
              ✕
            </button>
            
            <div className="text-center">
              <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Nueva Imagen</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">Pegá el link de tu foto</p>
            </div>

            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="https://imgur.com/..." 
                value={inputLink}
                onChange={(e) => setInputLink(e.target.value)}
                className="w-full bg-dark-900 border border-white/5 rounded-2xl p-4 text-sm text-white outline-none focus:border-primary-DEFAULT"
                autoFocus
              />
              <button 
                type="button" 
                onClick={handleAddLink} 
                disabled={!inputLink} 
                className="w-full py-4 bg-primary-DEFAULT text-white font-black rounded-2xl text-[10px] uppercase disabled:opacity-20 hover:bg-primary-glow transition-all"
              >
                Agregar Foto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}