"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function ProfileGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  const [saving, setSaving] = useState(false);

  // Formulario obligatorio
  const [form, setForm] = useState({
    fullName: "",
    businessName: "",
    phone: ""
  });

  useEffect(() => {
    // Si no hay usuario o está cargando, no hacemos nada todavía
    if (loading) return;
    if (!user) {
      setChecking(false);
      return;
    }

    const checkProfile = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          const data = snap.data();
          // Verificamos si falta algún dato esencial
          if (!data.fullName || !data.businessName || !data.phone) {
            setForm({
              fullName: data.fullName || user.displayName || "",
              businessName: data.businessName || "",
              phone: data.phone || ""
            });
            setIsProfileComplete(false);
          } else {
            setIsProfileComplete(true);
          }
        } else {
          // Si el documento no existe (usuario nuevo), obligamos a crear perfil
          setForm(prev => ({ ...prev, fullName: user.displayName || "" }));
          setIsProfileComplete(false);
        }
      } catch (error) {
        console.error("Error verificando perfil:", error);
      } finally {
        setChecking(false);
      }
    };

    checkProfile();
  }, [user, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      // Guardamos los datos obligatorios (merge: true no borra lo que ya exista)
      await setDoc(doc(db, "users", user.uid), {
        fullName: form.fullName,
        businessName: form.businessName,
        phone: form.phone,
        // El portfolio no lo tocamos acá porque es opcional
      }, { merge: true });

      setIsProfileComplete(true);
    } catch (error) {
      console.error("Error guardando perfil:", error);
      alert("Hubo un error al guardar. Intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  // 1. Mientras cargamos Auth o Base de Datos, mostramos pantalla negra limpia
  if (loading || checking) {
    return <div className="min-h-screen bg-dark-900 flex items-center justify-center text-white animate-pulse">Cargando...</div>;
  }

  // 2. Si está logueado PERO el perfil está incompleto -> BLOQUEO CON FORMULARIO
  if (user && !isProfileComplete) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 bg-grid-white opacity-10"></div>
        
        <div className="relative z-10 w-full max-w-md bg-dark-800 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">¡Bienvenido!</h2>
            <p className="text-accent-DEFAULT font-bold text-xs uppercase tracking-widest mt-2">Completa tus datos para comenzar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Tu Nombre Completo *</label>
              <input 
                required
                value={form.fullName}
                onChange={e => setForm({...form, fullName: e.target.value})}
                placeholder="Ej: David Espinosa"
                className="w-full bg-dark-900 border border-white/5 rounded-2xl p-4 text-white outline-none focus:border-primary-DEFAULT transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase ml-2">Nombre de tu Negocio *</label>
              <input 
                required
                value={form.businessName}
                onChange={e => setForm({...form, businessName: e.target.value})}
                placeholder="Ej: D8 Creative"
                className="w-full bg-dark-900 border border-white/5 rounded-2xl p-4 text-white outline-none focus:border-primary-DEFAULT transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase ml-2">WhatsApp / Teléfono *</label>
              <div className="flex gap-2">
                <span className="bg-dark-900 border border-white/5 rounded-2xl p-4 text-gray-500 font-bold">+54</span>
                <input 
                  required
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                  placeholder="9 11 1234 5678"
                  className="flex-1 bg-dark-900 border border-white/5 rounded-2xl p-4 text-white outline-none focus:border-primary-DEFAULT transition-all"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={saving || !form.fullName || !form.businessName || !form.phone}
              className="w-full py-5 bg-white text-dark-900 font-black rounded-2xl uppercase text-sm hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:scale-100 mt-4"
            >
              {saving ? "Guardando..." : "Comenzar a Usar 🚀"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 3. Si todo está bien (o no está logueado), mostramos la app normal
  return <>{children}</>;
}