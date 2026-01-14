"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export default function ContactoForm({ onFinish }: { onFinish: () => void }) {
  const [form, setForm] = useState({ nombre: "", apellido: "", asunto: "", mensaje: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "support_tickets"), {
        ...form,
        createdAt: Timestamp.now(),
        status: "nuevo"
      });
      alert("¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.");
      onFinish(); // Esto te redirigirá (al home o dashboard)
    } catch (error) {
      alert("Error al enviar. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => setForm({ nombre: "", apellido: "", asunto: "", mensaje: "" });

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 w-full max-w-2xl">
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-black italic uppercase transition-all duration-500 [text-shadow:5px_5px_0px_#8B5CF6]">
          Contacto
        </h1>
        <p className="text-gray-500 text-xs font-bold uppercase mt-2 tracking-widest italic">Sugerencias y Soporte</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-dark-800/50 backdrop-blur-md p-8 md:p-12 rounded-[3rem] border border-white/5 space-y-6 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase italic ml-4 text-gray-400">Nombre</label>
            <input required type="text" value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-primary-DEFAULT transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase italic ml-4 text-gray-400">Apellido</label>
            <input required type="text" value={form.apellido} onChange={(e) => setForm({...form, apellido: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-primary-DEFAULT transition-all" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase italic ml-4 text-gray-400">Asunto</label>
          <input required type="text" value={form.asunto} onChange={(e) => setForm({...form, asunto: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-primary-DEFAULT transition-all" />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase italic ml-4 text-gray-400">Mensaje</label>
          <textarea required rows={4} value={form.mensaje} onChange={(e) => setForm({...form, mensaje: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-4 text-white font-bold outline-none focus:border-primary-DEFAULT transition-all resize-none" />
        </div>

        <div className="flex flex-col md:flex-row gap-4 pt-4">
          <button type="button" onClick={handleReset} className="flex-1 py-4 bg-white/5 text-gray-400 font-black uppercase rounded-2xl text-xs hover:bg-red-500/10 hover:text-red-500 transition-all">
            Borrar Todo
          </button>
          <button type="submit" disabled={loading} className="flex-[2] py-4 bg-white text-black font-black uppercase rounded-2xl text-xs hover:bg-primary-DEFAULT hover:text-white transition-all transform hover:scale-[1.02]">
            {loading ? "Enviando..." : "Enviar Mensaje"}
          </button>
        </div>
      </form>
    </div>
  );
}