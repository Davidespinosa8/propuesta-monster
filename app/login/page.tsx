"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { user, loginWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard"); 
    }
  }, [user, router]);

  return (
    <main className="min-h-screen bg-dark-900 flex items-center justify-center relative overflow-hidden">
      {/* Fondo Grid */}
      <div className="absolute inset-0 bg-grid-white opacity-10 mask-[radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      
      <div className="relative z-10 bg-dark-800/50 backdrop-blur-xl p-10 rounded-3xl border border-dark-700 shadow-2xl text-center max-w-md w-full">
        <h1 className="text-3xl font-black text-white mb-2">Bienvenido a <br/><span className="text-primary-DEFAULT">Propuesta Monster</span></h1>
        <p className="text-gray-400 mb-8">Inicia sesión para gestionar tus presupuestos y cerrar más ventas.</p>

        <button 
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white text-dark-900 font-bold py-4 rounded-xl hover:scale-[1.02] transition-transform shadow-lg group"
        >
          {/* Icono de Google simple */}
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Ingresar con Google
        </button>
      </div>
    </main>
  );
}