"use client";

import { useEffect, useMemo, useState } from "react";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { Proposal, ProposalService } from "@/types/proposal";
import { AppUser } from "@/types/user";
import { buildWhatsAppUrl } from "@/utils/whatsapp";
import MessageSuggestions from "@/components/proposal/MessageSuggestions";
import { formatMoney, getLineItemTotal, getLineItemUnitPrice, getLineItemQty } from "@/utils/money";

export default function ProposalView({ proposal }: { proposal: Proposal }) {
  const { user } = useAuth();
  const [freelancer, setFreelancer] = useState<AppUser | null>(null);
  const [excludedItemIds, setExcludedItemIds] = useState<string[]>([]);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  const allItems: ProposalService[] = useMemo(() => {
    return proposal.services || proposal.items || [];
  }, [proposal.services, proposal.items]);

  const selectedItems = useMemo(() => {
    return allItems.filter((item) => !excludedItemIds.includes(item.id));
  }, [allItems, excludedItemIds]);

  const dynamicTotal = useMemo(() => {
    return selectedItems.reduce((sum, item) => {
      return sum + getLineItemTotal(item);
    }, 0);
  }, [selectedItems]);

  const isOwner = user?.uid === proposal.freelancerId;

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/p/${proposal.id}`
      : "";

  const toggleItem = (itemId: string) => {
    setExcludedItemIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  useEffect(() => {
    const fetchFreelancer = async () => {
      if (!proposal.freelancerId) return;

      try {
        const userDoc = await getDoc(doc(db, "users", proposal.freelancerId));
        if (userDoc.exists()) {
          setFreelancer(userDoc.data() as AppUser);
        }
      } catch (error) {
        console.error("Error cargando datos del freelancer", error);
      }
    };

    fetchFreelancer();
  }, [proposal.freelancerId]);

  const date =
    proposal.createdAt instanceof Timestamp
      ? proposal.createdAt.toDate().toLocaleDateString()
      : proposal.createdAt instanceof Date
      ? proposal.createdAt.toLocaleDateString()
      : new Date().toLocaleDateString();


  const handleSelectMessage = (message: string) => {
    const link = buildWhatsAppUrl(
      proposal.whatsapp || "",
      message,
      proposal.countryCode || "54"
    );
    setIsMessageModalOpen(false);
    window.open(link, "_blank");
  };

  const selectedItemsList = selectedItems
    .map((item) => {
      const label = item.title || item.description || "Item";
      const unitPrice = getLineItemUnitPrice(item);
      const qty = getLineItemQty(item);
      const total = getLineItemTotal(item);

      return `- ${label} (${qty} x ${formatMoney(
        unitPrice,
        proposal.currency === "USD" ? "USD" : "ARS"
      )} = ${formatMoney(
        total,
        proposal.currency === "USD" ? "USD" : "ARS"
      )})`;
    })
    .join("\n");

  const freelancerMessage = `Hola, acepto el presupuesto por un total de *${formatMoney(
  dynamicTotal,
  proposal.currency === "USD" ? "USD" : "ARS"
)}*.\n\nItems seleccionados:\n${selectedItemsList}\n\n¿Cómo seguimos?`;

  const whatsappLinkClient = buildWhatsAppUrl(
    freelancer?.phone || "",
    freelancerMessage
  );

  return (
    <div className="bg-dark-800/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-500">
      <div className="p-8 md:p-12 border-b border-white/5 bg-linear-to-br from-white/5 to-transparent relative">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[10px] font-black text-primary-DEFAULT uppercase tracking-widest mb-2">
              Presupuesto Interactivo
              {proposal.currency === "USD" ? " • USD" : " • ARS"}
            </p>
            <h1 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase">
              {proposal.jobTitle || "Propuesta de Trabajo"}
            </h1>
          </div>

          <div className="text-right flex flex-col items-end gap-2">
            <div className="bg-white text-dark-900 font-black text-xs px-3 py-1 rounded-full uppercase inline-block">
              {date}
            </div>

            {proposal.currency === "USD" && proposal.exchangeRateValue && (
              <div className="bg-dark-900/80 border border-white/10 text-gray-300 font-black text-[10px] px-3 py-2 rounded-full uppercase tracking-widest">
                USD • TC {proposal.exchangeRateValue}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-8 mt-8">
          <div>
            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">
              Preparado para:
            </p>
            <h3 className="text-xl font-bold text-white capitalize">
              {proposal.clientName}
            </h3>

            {!isOwner && (
              <p className="text-xs text-accent-DEFAULT mt-2 animate-pulse">
                👇 Tocá los ítems para agregar o quitar servicios
              </p>
            )}
          </div>

          {freelancer && (
            <div className="md:text-right">
              <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">
                Por:
              </p>
              <h3 className="text-xl font-bold text-white capitalize">
                {freelancer.businessName || freelancer.fullName}
              </h3>
              <p className="text-sm text-gray-400">{freelancer.phone}</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-8 md:p-12 space-y-4">
        <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest px-4">
          <span>Selección de Servicios</span>
          <span>Importe</span>
        </div>

        <div className="space-y-2">
          {allItems.length > 0 ? (
            allItems.map((item, index) => {
              const mainText =
                item.title || item.description || "Ítem sin nombre";
              const subText =
                item.desc ||
                (item.type === "material" ? "Materiales" : "Mano de Obra");
              const isSelected = !excludedItemIds.includes(item.id);

              return (
                <div
                  key={item.id || index}
                  onClick={() => !isOwner && toggleItem(item.id)}
                  className={`flex justify-between items-center p-4 rounded-2xl border transition-all cursor-pointer select-none
                    ${
                      isSelected
                        ? "bg-dark-900/80 border-primary-DEFAULT/50 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]"
                        : "bg-dark-900/30 border-white/5 opacity-60 hover:opacity-100"
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors
                        ${
                          isSelected
                            ? "bg-primary-DEFAULT border-primary-DEFAULT"
                            : "border-gray-600 bg-transparent"
                        }
                      `}
                    >
                      {isSelected && (
                        <span className="text-dark-900 text-xs font-black">
                          ✓
                        </span>
                      )}
                    </div>

                    <div>
                      <p
                        className={`text-sm font-bold transition-colors ${
                          isSelected ? "text-white" : "text-gray-400"
                        }`}
                      >
                        {mainText}
                      </p>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">
                        {subText}
                      </p>
                    </div>
                  </div>

                  <p
                    className={`font-mono font-bold text-lg transition-colors ${
                      isSelected ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {formatMoney(getLineItemTotal(item), proposal.currency === "USD" ? "USD" : "ARS")}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="text-center p-8 text-gray-500 italic text-sm">
              No hay ítems cargados.
            </div>
          )}
        </div>
      </div>

      <div className="bg-dark-900 p-8 md:p-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">
            {isOwner ? "Total Presupuestado" : "Total Seleccionado"}
          </p>
          <p className="text-5xl font-black text-white tracking-tighter transition-all duration-300">
            {formatMoney(dynamicTotal, proposal.currency === "USD" ? "USD" : "ARS")}
          </p>
        </div>

        {typeof window !== "undefined" &&
          (isOwner ? (
            proposal.whatsapp ? (
              <button
                type="button"
                onClick={() => setIsMessageModalOpen(true)}
                className="px-8 py-4 bg-white text-dark-900 font-black rounded-2xl uppercase text-xs hover:scale-105 transition-transform shadow-xl flex items-center gap-2"
              >
                <span>Enviar a Cliente 📤</span>
              </button>
            ) : (
              <span className="text-xs text-gray-500 font-bold">
                Sin teléfono de cliente
              </span>
            )
          ) : (
            freelancer?.phone && (
              <a
                href={whatsappLinkClient}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-green-500 text-white font-black rounded-2xl uppercase text-xs hover:scale-105 transition-transform shadow-[0_0_30px_rgba(34,197,94,0.3)] flex items-center gap-2"
              >
                <span>
                  Confirmar ({formatMoney(
                    dynamicTotal,
                    proposal.currency === "USD" ? "USD" : "ARS"
                  )}) 💬
                </span>
              </a>
            )
          ))}
      </div>

      <MessageSuggestions
        isOpen={isMessageModalOpen}
        clientName={proposal.clientName}
        total={dynamicTotal}
        currency={proposal.currency}
        shareUrl={shareUrl}
        onClose={() => setIsMessageModalOpen(false)}
        onSelectMessage={handleSelectMessage}
      />

      {proposal.portfolioUrl && (
        <div className="p-8 md:p-12 border-t border-white/10 bg-black/20 text-center">
          <a
            href={proposal.portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/20 transition-all"
          >
            Ver Portfolio de Referencia ↗
          </a>
        </div>
      )}
    </div>
  );
}