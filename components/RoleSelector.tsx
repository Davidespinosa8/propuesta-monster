"use client";
import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

const ROLES = [
  { id: "digital", label: "Agencia / Digital", icon: "💻" },
  { id: "electricista", label: "Electricista", icon: "⚡" },
  { id: "plomero", label: "Plomero", icon: "💧" },
  { id: "gasista", label: "Gasista", icon: "🔥" },
  { id: "albanil", label: "Albañil", icon: "🧱" },
  { id: "durlock", label: "Durlock / Seco", icon: "🛠️" },
];

export default function RoleSelector({ onRoleSelected }: { onRoleSelected: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const selectRole = async (roleId: string) => {
    if (!user) return;
    setLoading(true);
    try {
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: roleId,
        updatedAt: new Date()
      }, { merge: true });
      
      onRoleSelected();
    } catch (error) {
      console.error("Error guardando rol:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-dark-900 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-white mb-2">¿Cuál es tu Rubro?</h2>
        <p className="text-gray-400">Personalizaremos los precios base para ti.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl w-full">
        {ROLES.map((role) => (
          <button
            key={role.id}
            onClick={() => selectRole(role.id)}
            disabled={loading}
            className="group relative bg-dark-800/50 border border-dark-700 hover:border-primary-DEFAULT p-6 rounded-2xl transition-all hover:scale-105 flex flex-col items-center justify-center gap-4 h-40"
          >
            <span className="text-4xl filter grayscale group-hover:grayscale-0 transition-all">{role.icon}</span>
            <span className="font-bold text-gray-300 group-hover:text-white">{role.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}