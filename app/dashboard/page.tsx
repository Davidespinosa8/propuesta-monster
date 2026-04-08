"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Timestamp } from "firebase/firestore";
import {
  getProposalsByFreelancer,
  deleteProposalById,
  updateProposalStatus
} from "@/services/proposal.service";
import { getUserPlanData } from "@/services/user.service";
import type { Proposal } from "@/types/proposal";
import Link from "next/link";
import UserProfile from "@/components/UserProfile";
import ContactoForm from "@/components/ContactoForm";
import { applyCoupon } from "@/services/coupon.service";
import DashboardSummary from "@/components/dashboard/DashboardSummary";

const FREE_LIMIT = 6;

const formatProposalDate = (createdAt: Proposal["createdAt"]) => {
  if (createdAt instanceof Timestamp) {
    return createdAt.toDate().toLocaleDateString();
  }

  if (createdAt instanceof Date) {
    return createdAt.toLocaleDateString();
  }

  return "";
};


export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [view, setView] = useState<'dashboard' | 'perfil' | 'contacto'>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<'free' | 'pro'>('free');
  const [usageCount, setUsageCount] = useState(0);

  const sentCount = proposals.length;
  const acceptedCount = proposals.filter((p) => p.status === "accepted").length;

  const totalGeneratedARS = proposals
    .filter((p) => p.status === "accepted" && (p.currency || "ARS") === "ARS")
    .reduce((acc, p) => acc + (p.total || 0), 0);

  const totalGeneratedUSD = proposals
    .filter((p) => p.status === "accepted" && p.currency === "USD")
    .reduce((acc, p) => acc + (p.total || 0), 0);
  

  const [isProcessing, setIsProcessing] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
  if (!user) return;

  const fetchData = async () => {
    try {
      const proposalsData = await getProposalsByFreelancer(user.uid);
      setProposals(proposalsData);

      const userPlanData = await getUserPlanData(user.uid);
      setUserPlan(userPlanData.plan);
      setUsageCount(userPlanData.usageCount);
    } catch (error) {
      console.error(error);
    } finally {
      setDataLoading(false);
    }
  };

  fetchData();
}, [user]);

  const handleDelete = async (id: string) => {
    if (!user) return;

    if (confirm("¿Eliminar presupuesto? El crédito no se recupera.")) {
      try {
        await deleteProposalById(id);
        setProposals((prev) => prev.filter((p) => p.id !== id));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleToggleAccepted = async (
    id: string,
    currentStatus: "pending" | "accepted"
  ) => {
    const nextStatus = currentStatus === "accepted" ? "pending" : "accepted";

    try {
      await updateProposalStatus(id, nextStatus);

      setProposals((prev) =>
        prev.map((proposal) =>
          proposal.id === id
            ? { ...proposal, status: nextStatus }
            : proposal
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleBuyPro = async () => {
    if (!user) return;
    setIsProcessing(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, userEmail: user.email }),
      });

      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert("Error al conectar con Mercado Pago");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCouponSubmit = async () => {
    if (!couponInput || !user) return;
    setCouponLoading(true);
    const result = await applyCoupon(user.uid, couponInput);
    if (result.success) {
        alert(result.message);
        window.location.reload();
    } else { alert(result.message); }
    setCouponLoading(false);
  };

  if (authLoading || !user) return <div className="min-h-screen bg-dark-900 flex items-center justify-center text-white italic">Cargando...</div>;

  return (
    <main className="min-h-screen bg-dark-900 text-white p-4 md:p-8 relative overflow-hidden">
      
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-grid-white mask-[radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      </div>

      {/* MENÚ LATERAL */}
      <div className={`fixed top-0 right-0 h-full bg-dark-800 border-l border-white/10 transition-transform duration-500 z-50 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} w-72 shadow-2xl`}>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="absolute top-1/2 -left-10 bg-dark-800 p-3 rounded-l-2xl text-white shadow-xl">
          {isMenuOpen ? '〉' : '〈'}
        </button>
        <nav className="p-10 space-y-8 mt-20">
          <Link href="/" className="block text-gray-400 hover:text-white font-black text-xs uppercase italic">Home</Link>
          <button onClick={() => { setView('dashboard'); setIsMenuOpen(false); }} className={`block w-full text-left font-black text-xs uppercase italic ${view === 'dashboard' ? 'text-primary-DEFAULT' : 'text-gray-400'}`}>Dashboard</button>
          <button onClick={() => { setView('perfil'); setIsMenuOpen(false); }} className={`block w-full text-left font-black text-xs uppercase italic ${view === 'perfil' ? 'text-primary-DEFAULT' : 'text-gray-400'}`}>Perfil</button>
          {userPlan === 'free' && (
              <button onClick={() => setShowUpgradeModal(true)} className="mt-8 w-full py-3 bg-linear-to-r from-yellow-400 to-orange-500 text-black font-black text-xs uppercase rounded-xl shadow-lg">⚡ Pasate a PRO</button>
          )}
        </nav>

        {/* FOOTER DE CONTACTO */}
        <div className="absolute bottom-10 left-0 w-full px-10">
          <div className="h-px bg-white/5 mb-6"></div>
          <button 
            onClick={() => { setView('contacto'); setIsMenuOpen(false); }}
            className="group flex items-center gap-3 text-gray-500 hover:text-primary-DEFAULT transition-all duration-300 w-full text-left"
          >
            <div className="p-2 bg-white/5 rounded-lg group-hover:bg-primary-DEFAULT/10">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-[10px] uppercase italic tracking-tighter">Soporte</span>
              <span className="text-[9px] text-gray-600 font-bold group-hover:text-gray-400">¿Necesitás ayuda?</span>
            </div>
          </button>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {view === 'dashboard' ? (
          <div className="animate-in fade-in duration-500">
            <header className="flex justify-between items-center mb-12 flex-wrap gap-4">
              <div className="flex items-center gap-3 group">
                  <h1 className="text-3xl md:text-4xl font-black italic uppercase transition-all duration-500 group-hover:[text-shadow:5px_5px_0px_var(--primary)] group-hover:-translate-y-1">
                    Mis Obras
                  </h1>
                  {userPlan === 'pro' && <span className="bg-yellow-500 text-black px-2 py-0.5 rounded text-[10px] font-bold">PRO</span>}
              </div>

              <div className="flex items-center gap-3">
                {userPlan === 'free' && (
                    <button onClick={() => setShowUpgradeModal(true)} className="px-6 py-4 bg-linear-to-r from-yellow-400 to-orange-500 text-black font-black rounded-2xl text-xs uppercase shadow-orange-500/20 animate-pulse">🚀 PRO</button>
                )}
                <Link href={userPlan === 'free' && usageCount >= FREE_LIMIT ? "#" : "/crear"} 
                      onClick={() => { if(userPlan === 'free' && usageCount >= FREE_LIMIT) { setShowUpgradeModal(true); }}}
                      className="px-6 py-4 bg-white text-black font-black rounded-2xl text-xs uppercase hover:scale-105 transition-transform">
                    Nuevo + {userPlan === 'free' && <span className="opacity-50">({usageCount}/{FREE_LIMIT})</span>}
                </Link>
              </div>
            </header>

            <DashboardSummary
              sentCount={sentCount}
              acceptedCount={acceptedCount}
              totalGeneratedARS={totalGeneratedARS}
              totalGeneratedUSD={totalGeneratedUSD}
            />
            
            <div className="grid gap-4">
              {dataLoading ? (
                <div className="text-center text-gray-500 animate-pulse font-bold uppercase text-xs">Cargando...</div>
              ) : proposals.length > 0 ? (
                proposals.map(p => (
                  <div key={p.id} className="group bg-dark-800/50 backdrop-blur-md p-4 md:p-6 rounded-3xl md:rounded-4xl border border-white/5 hover:border-primary-DEFAULT transition-all flex flex-col md:flex-row justify-between md:items-center items-start gap-4">
                    <div className="flex-1 text-center md:text-left flex items-center gap-4">
                      {/* INDICADOR DE WHATSAPP (VISTO/PENDIENTE) */}
                      <div title={p.viewedAt ? "Leído" : "No leído aún"}>
                        {p.viewedAt ? (
                          /* Icono WhatsApp Verde (Visto) */
                          <span className="text-[#25D366] drop-shadow-[0_0_8px_rgba(37,211,102,0.4)]">
                            <svg 
                              className="w-6 h-6" 
                              fill="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.67-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                            </svg>
                          </span>
                        ) : (
                          /* Icono WhatsApp Gris Oscuro (Pendiente) */
                          <span className="text-gray-800 opacity-40">
                            <svg 
                              className="w-6 h-6" 
                              fill="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.67-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                            </svg>
                          </span>
                        )}
                    </div>
                      
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base md:text-lg group-hover:text-primary-DEFAULT transition-colors">
                          {p.clientName}
                        </h3>

                        {p.status === "accepted" && (
                          <span className="bg-green-500/15 text-green-400 border border-green-500/20 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                            Aceptado
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-gray-500 uppercase">
                        {formatProposalDate(p.createdAt)}
                      </p>
                    </div>
                  </div>

                  <p className="font-mono font-black text-white text-lg md:text-xl">${p.total?.toLocaleString()}</p>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/p/${p.id}`}
                      className="p-3 bg-white/5 rounded-xl hover:bg-white hover:text-black transition-all text-gray-400"
                      title="Ver"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </Link>

                    <Link
                      href={`/crear?edit=${p.id}`}
                      className="p-3 bg-white/5 rounded-xl hover:bg-blue-500 hover:text-white transition-all text-gray-400"
                      title="Editar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                      </svg>
                    </Link>

                    <Link
                      href={`/crear?duplicate=${p.id}`}
                      className="p-3 bg-white/5 rounded-xl hover:bg-yellow-500 hover:text-black transition-all text-gray-400"
                      title="Duplicar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path>
                      </svg>
                    </Link>

                    <button
                      onClick={() => handleToggleAccepted(p.id, p.status)}
                      className={`p-3 rounded-xl transition-all ${
                        p.status === "accepted"
                          ? "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500 hover:text-black"
                          : "bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white"
                      }`}
                      title={p.status === "accepted" ? "Volver a pendiente" : "Marcar como aceptado"}
                    >
                      {p.status === "accepted" ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          ></path>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-3 bg-red-500/10 rounded-xl hover:bg-red-500 hover:text-white transition-all text-red-500"
                      title="Eliminar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-4xl text-gray-600 font-bold uppercase text-xs">No hay propuestas activas</div>
              )}
            </div>
          </div>
        ) : view === 'perfil' ? (
          <div className="flex justify-center w-full animate-in zoom-in-95 duration-500"><UserProfile /></div>
        ) : (
          <div className="flex justify-center w-full">
            <ContactoForm onFinish={() => router.push("/")} />
          </div>
        )}
      </div>

      {/* MODAL UPGRADE */}
      {showUpgradeModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-dark-900 border border-white/10 rounded-3xl max-w-md w-full p-8 relative shadow-2xl text-center animate-in zoom-in-95">
                  <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-yellow-400 to-orange-500"></div>
                  <button onClick={() => setShowUpgradeModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>
                  <div className="relative z-10">
                    <span className="text-4xl mb-4 block">🚀</span>
                    <h3 className="text-2xl font-black text-white italic uppercase mb-2">¡Límite Alcanzado!</h3>
                    <p className="text-gray-400 text-sm mb-6">Pasate a PRO para presupuestos ilimitados.</p>
                    <button onClick={handleBuyPro} disabled={isProcessing} className="w-full py-4 bg-linear-to-r from-yellow-400 to-orange-500 text-black font-black uppercase rounded-xl hover:scale-[1.02] transition-all">
                        {isProcessing ? "Cargando..." : "Desbloquear Ilimitado 🔓"}
                    </button>
                    <div className="my-6 flex items-center gap-2">
                        <div className="h-px bg-white/10 flex-1"></div>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest italic">O canjeá un código</span>
                        <div className="h-px bg-white/10 flex-1"></div>
                    </div>
                    <div className="flex gap-2">
                        <input type="text" placeholder="CÓDIGO" value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white font-bold outline-none focus:border-primary-DEFAULT" />
                        <button onClick={handleCouponSubmit} disabled={couponLoading} className="bg-white text-black px-4 py-2 rounded-xl font-black text-[10px] uppercase hover:bg-primary-DEFAULT transition-colors">
                            {couponLoading ? "..." : "Canjear"}
                        </button>
                    </div>
                  </div>
              </div>
          </div>
      )}
    </main>
  );
}