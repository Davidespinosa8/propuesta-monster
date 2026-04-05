import type { SelectedItem } from "@/types/create-proposal";
import { COUNTRY_OPTIONS } from "@/constants/countries";

interface SelectedItemsTicketProps {
  clientName: string;
  whatsapp: string;
  portfolioUrl: string;
  currency: "ARS" | "USD";
  countryCode: string;
  selectedItems: SelectedItem[];
  onClientNameChange: (value: string) => void;
  onWhatsappChange: (value: string) => void;
  onPortfolioUrlChange: (value: string) => void;
  onCurrencyChange: (value: "ARS" | "USD") => void;
  onCountryCodeChange: (value: string) => void;
  onQtyChange: (id: string, qty: number) => void;
  onCustomPriceChange: (id: string, price: number) => void;
  onRemoveItem: (id: string) => void;
  children: React.ReactNode;
}

export default function SelectedItemsTicket({
  clientName,
  whatsapp,
  portfolioUrl,
  currency,
  countryCode,
  selectedItems,
  onClientNameChange,
  onWhatsappChange,
  onPortfolioUrlChange,
  onCurrencyChange,
  onCountryCodeChange,
  onQtyChange,
  onCustomPriceChange,
  onRemoveItem,
  children,
}: SelectedItemsTicketProps) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sticky top-8">
      <h3 className="text-xl font-black text-white mb-6 uppercase italic border-b border-white/10 pb-4">
        Ticket de Trabajo
      </h3>

        <div className="space-y-3 mb-6">
          <input
            required
            placeholder="Nombre del Cliente"
            value={clientName}
            onChange={(e) => onClientNameChange(e.target.value)}
            className="w-full bg-dark-900 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-white/20"
          />
          <input
            required
            placeholder="WhatsApp"
            value={whatsapp}
            onChange={(e) => onWhatsappChange(e.target.value)}
            className="w-full bg-dark-900 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-white/20"
          />
          <input
            placeholder="Link Portafolio"
            value={portfolioUrl}
            onChange={(e) => onPortfolioUrlChange(e.target.value)}
            className="w-full bg-dark-900 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-white/20"
          />

                  <div className="grid grid-cols-[1fr_160px] gap-2">
          <select
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value as "ARS" | "USD")}
            className="w-full bg-dark-900 border border-white/10 rounded-xl p-4 text-white outline-none"
          >
            <option value="ARS">Pesos 🇦🇷 (ARS)</option>
            <option value="USD">USD 💵</option>
          </select>

          <select
            value={countryCode}
            onChange={(e) => onCountryCodeChange(e.target.value)}
            className="w-full bg-dark-900 border border-white/10 rounded-xl p-4 text-white outline-none"
          >
            {COUNTRY_OPTIONS.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} +{country.code}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="max-h-60 overflow-y-auto space-y-2 mb-6 pr-2 custom-scrollbar">
        {selectedItems.map((item) => (
          <div
            key={item.id}
            className="bg-dark-900 p-3 rounded-xl border border-white/5 flex justify-between items-center group"
          >
            <div className="flex-1">
              <p className="text-xs font-bold text-white uppercase">{item.task}</p>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  value={item.qty}
                  onChange={(e) => onQtyChange(item.id, Number(e.target.value))}
                  className="w-12 bg-dark-800 text-center text-white rounded p-1 text-xs font-mono"
                />
                <span className="text-gray-600 text-[10px]">x</span>

                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-gray-500 font-bold">
                    {currency === "USD" ? "USD $" : "$"}
                  </span>
                  <input
                    type="number"
                    value={item.customPrice}
                    onChange={(e) =>
                      onCustomPriceChange(item.id, Number(e.target.value))
                    }
                    className="w-20 bg-dark-800 text-white rounded p-1 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onRemoveItem(item.id)}
              className="text-gray-600 hover:text-red-500 transition-colors ml-2 text-xl"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {children}
    </div>
  );
}