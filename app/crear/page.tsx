"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getProposalById,
  getReferencePricesByCategory,
  saveProposalByMode,
} from "@/services/proposal.service";
import { getUserRole, getUserById } from "@/services/user.service";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
  mapStoredServicesToEditableState,
  mapEditableStateToStoredServices,
} from "@/utils/proposal-transform";
import CategorySelector from "@/components/crear/CategorySelector";
import ManualItemPanel from "@/components/crear/ManualItemPanel";
import BudgetActionsPanel from "@/components/crear/BudgetActionsPanel";
import ReferenceItemsList from "@/components/crear/ReferenceItemsList";
import SelectedItemsTicket from "@/components/crear/SelectedItemsTicket";
import type {
  RefItem,
  SelectedItem,
  DigitalService,
} from "@/types/create-proposal";
import { CREATE_PROPOSAL_CATEGORIES } from "@/constants/create-proposal";
import CreateSetupModal from "@/components/crear/CreateSetupModal";
import { getLineItemTotal } from "@/utils/money";

function CreateQuoteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  const editId = searchParams.get("edit");
  const duplicateId = searchParams.get("duplicate");

  const [activeCategory, setActiveCategory] = useState<string>("digital");
  const [initializing, setInitializing] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState<'view' | 'dashboard'>('view');

  const [clientName, setClientName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [currency, setCurrency] = useState<"ARS" | "USD">("ARS");
  const [countryCode, setCountryCode] = useState("54");
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(1400);
  const [exchangeRateSource, setExchangeRateSource] = useState("Fallback");
  const [exchangeRateFetchedAt, setExchangeRateFetchedAt] = useState(
    new Date().toISOString()
  );
  
  const [refItems, setRefItems] = useState<RefItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  const [digitalBasePrice, setDigitalBasePrice] = useState(0);
  const [digitalServices, setDigitalServices] = useState<DigitalService[]>([]);

  // ESTADOS PARA ACCIÓN MANUAL
  const [isAddingManual, setIsAddingManual] = useState(false);
  const [manualTask, setManualTask] = useState("");
  const [manualPrice, setManualPrice] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    const fetchUserRoleData = async () => {
      if (!user) return;

      try {
        const role = await getUserRole(user.uid);
        if (role && CREATE_PROPOSAL_CATEGORIES.some((c) => c.id === role)) {
          setActiveCategory(role);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setInitializing(false);
      }
    };

    if (user) {
      fetchUserRoleData();
    }
  }, [user, loading, router]);

  useEffect(() => {
    const isNewProposal = !editId && !duplicateId;

    if (!initializing && isNewProposal) {
      setIsSetupModalOpen(true);
    }
  }, [initializing, editId, duplicateId]);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const res = await fetch("/api/exchange-rate");
        const data = await res.json();

        if (data?.rate) {
          setExchangeRate(data.rate);
          setExchangeRateSource(data.source || "Cotización manual");
          setExchangeRateFetchedAt(
            data.fetchedAt || data.updatedAt || new Date().toISOString()
          );
        }
      } catch (error) {
        console.error("No se pudo cargar la cotización", error);
      }
    };

    fetchExchangeRate();
  }, []);

  useEffect(() => {
    const loadProposal = async () => {
      const id = editId || duplicateId;
      if (!id || initializing) return;

      try {
        const data = await getProposalById(id);
        if (!data) return;

        setClientName(data.clientName || "");
        setWhatsapp(data.whatsapp || "");
        setPortfolioUrl(data.portfolioUrl || "");
        setCurrency(data.currency || "ARS");
        setCountryCode(data.countryCode || "54");

        if (data.exchangeRateValue) {
          setExchangeRate(data.exchangeRateValue);
        }
        if (data.exchangeRateSource) {
          setExchangeRateSource(data.exchangeRateSource);
        }
        if (data.exchangeRateFetchedAt) {
          setExchangeRateFetchedAt(data.exchangeRateFetchedAt);
        }

        const editableState = mapStoredServicesToEditableState(data.services || []);

        setDigitalBasePrice(editableState.digitalBasePrice);
        setSelectedItems(editableState.selectedItems);
        setDigitalServices(editableState.digitalServices);
      } catch (error) {
        console.error(error);
      }
    };

    loadProposal();
  }, [editId, duplicateId, initializing]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setRefItems([]);
        const items = (await getReferencePricesByCategory(activeCategory)) as RefItem[];

        const convertedItems: RefItem[] = items.map((item: RefItem) => ({
        ...item,
        price:
          currency === "USD"
            ? Number((item.price / exchangeRate).toFixed(2))
            : item.price,
      }));

        setRefItems(convertedItems);
      } catch (error) {
        console.error(error);
      }
    };

    if (!initializing) {
      fetchPrices();
    }
  }, [activeCategory, initializing, currency, exchangeRate]);

  const addToBudget = (item: RefItem) => {
    const existing = selectedItems.find(i => i.id === item.id);
    if (existing) {
      updateQty(item.id, existing.qty + 1);
    } else {
      setSelectedItems([...selectedItems, { ...item, qty: 1, customPrice: item.price, category: activeCategory }]);
    }
  };

  const addManualToBudget = () => {
    if (!manualTask || manualPrice <= 0) return;
    const newItem: SelectedItem = {
      id: `manual-${Date.now()}`, task: manualTask, unit: "Personalizado",
      price: manualPrice, qty: 1, customPrice: manualPrice, category: "manual"
    };
    setSelectedItems([...selectedItems, newItem]);
    setManualTask(""); setManualPrice(0); setIsAddingManual(false);
  };

  const updateQty = (id: string, qty: number) => {
    if (qty < 1) {
      setSelectedItems(selectedItems.filter(i => i.id !== id));
      return;
    }
    setSelectedItems(selectedItems.map(i => i.id === id ? { ...i, qty } : i));
  };

  const updateCustomPrice = (id: string, price: number) => {
    setSelectedItems(selectedItems.map(i => i.id === id ? { ...i, customPrice: price } : i));
  };

  const calculateTotal = () => {
    const totalOficios = selectedItems.reduce(
      (acc, item) => acc + getLineItemTotal(item),
      0
    );

    const totalManual =
      digitalBasePrice +
      digitalServices.reduce((acc, item) => acc + item.price, 0);

    return totalOficios + totalManual;
  };

  const total = calculateTotal();

  const saveToFirebase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const finalServices = mapEditableStateToStoredServices({
      selectedItems,
      digitalServices,
      digitalBasePrice,
    });
    
  const userData = await getUserById(user.uid);

  const freelancerName =
    userData?.fullName ||
    user.displayName ||
    "Profesional";

  const freelancerBusinessName =
    userData?.businessName || "";

  const freelancerPhone =
    userData?.phone || "";

    try {
      const proposalData = {
        freelancerName,
        freelancerBusinessName,
        freelancerPhone,
        freelancerId: user.uid,
        clientName,
        whatsapp,
        portfolioUrl,
        currency,
        countryCode,
        ...(currency === "USD"
          ? {
              exchangeRateValue: exchangeRate,
              exchangeRateSource: exchangeRateSource,
              exchangeRateFetchedAt: exchangeRateFetchedAt,
            }
          : {}),
        services: finalServices,
        total,
        createdAt: new Date(),
        status: "pending" as const,
      };

      const finalId = await saveProposalByMode({
        proposalId: editId || undefined,
        proposalData,
        userId: user.uid,
      });

      router.push(redirectTarget === "view" ? `/p/${finalId}` : "/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  if (initializing) return <div className="min-h-screen bg-dark-900 flex items-center justify-center text-white italic">Iniciando...</div>;

  return (
    <>
      <CreateSetupModal
        isOpen={isSetupModalOpen}
        currency={currency}
        countryCode={countryCode}
        onCurrencyChange={setCurrency}
        onCountryCodeChange={setCountryCode}
        onContinue={() => setIsSetupModalOpen(false)}
      />

      <main className="min-h-screen bg-dark-900 p-4 md:p-8 relative">
        {/* MENÚ LATERAL */}
        <div className={`fixed top-0 right-0 h-full bg-dark-800 border-l border-white/10 transition-transform duration-500 z-50 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} w-72 shadow-2xl`}>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="absolute top-1/2 -left-10 bg-dark-800 p-3 rounded-l-2xl text-white shadow-xl">
            {isMenuOpen ? '〉' : '〈'}
          </button>
          <nav className="p-10 space-y-8 mt-20">
            <Link href="/dashboard" className="block text-gray-400 hover:text-white font-black text-xs uppercase italic">📊 Dashboard</Link>
            <Link href="/" className="block text-gray-400 hover:text-white font-black text-xs uppercase italic">🏠 Home</Link>
          </nav>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-3xl font-black text-white uppercase italic">
              {editId ? '✏️ Editar Presupuesto' : duplicateId ? '📑 Duplicar Presupuesto' : '➕ Nuevo Presupuesto'}
            </h2>

            <CategorySelector
              categories={CREATE_PROPOSAL_CATEGORIES}
              activeCategory={activeCategory}
              onSelect={setActiveCategory}
            />

            <div className="bg-dark-800/50 p-6 rounded-2xl border border-white/5 h-150 flex flex-col relative overflow-hidden">
              <ReferenceItemsList
                searchTerm={searchTerm}
                refItems={refItems}
                selectedItems={selectedItems}
                onSearchChange={setSearchTerm}
                onAddItem={addToBudget}
              />

              {/* PANEL FIJO INFERIOR */}
              <div className="absolute bottom-0 left-0 w-full p-4 bg-dark-800 border-t border-white/5 z-20">
                <ManualItemPanel
                  isAddingManual={isAddingManual}
                  manualTask={manualTask}
                  manualPrice={manualPrice}
                  onStartAdd={() => setIsAddingManual(true)}
                  onCancel={() => setIsAddingManual(false)}
                  onTaskChange={setManualTask}
                  onPriceChange={setManualPrice}
                  onAdd={addManualToBudget}
                />
              </div>
            </div>
          </div>

          {/* TICKET DE TRABAJO */}
                
          <div className="lg:col-span-5">
            <form onSubmit={saveToFirebase}>
              <SelectedItemsTicket
                clientName={clientName}
                whatsapp={whatsapp}
                portfolioUrl={portfolioUrl}
                currency={currency}
                countryCode={countryCode}
                selectedItems={selectedItems}
                onClientNameChange={setClientName}
                onWhatsappChange={setWhatsapp}
                onPortfolioUrlChange={setPortfolioUrl}
                onCountryCodeChange={setCountryCode}
                onQtyChange={updateQty}
                onCustomPriceChange={updateCustomPrice}
                onRemoveItem={(id) => updateQty(id, 0)}
              >
                <BudgetActionsPanel
                  total={total}
                  onSaveDraft={() => setRedirectTarget("dashboard")}
                  onGenerate={() => setRedirectTarget("view")}
                />
              </SelectedItemsTicket>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}

export default function CreateQuotePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-dark-900 flex items-center justify-center text-white italic">Cargando...</div>}>
            <CreateQuoteContent />
        </Suspense>
    );
}