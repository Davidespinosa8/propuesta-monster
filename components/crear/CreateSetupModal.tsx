import { COUNTRY_OPTIONS } from "@/constants/countries";

interface CreateSetupModalProps {
  isOpen: boolean;
  currency: "ARS" | "USD";
  countryCode: string;
  onCurrencyChange: (value: "ARS" | "USD") => void;
  onCountryCodeChange: (value: string) => void;
  onContinue: () => void;
}

export default function CreateSetupModal({
  isOpen,
  currency,
  countryCode,
  onCurrencyChange,
  onCountryCodeChange,
  onContinue,
}: CreateSetupModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-dark-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-6 md:p-8 border-b border-white/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary-DEFAULT mb-2">
            Nuevo presupuesto
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic">
            Configuración inicial
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            Elegí la moneda y el país del cliente para arrancar.
          </p>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">
              ¿En qué moneda querés cobrar?
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onCurrencyChange("ARS")}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  currency === "ARS"
                    ? "border-primary-DEFAULT bg-primary-DEFAULT/10 text-white"
                    : "border-white/10 bg-dark-800/60 text-gray-400 hover:border-white/20"
                }`}
              >
                <span className="block text-lg font-black">Pesos 🇦🇷</span>
                <span className="block text-xs mt-1 uppercase tracking-widest">
                  ARS
                </span>
              </button>

              <button
                type="button"
                onClick={() => onCurrencyChange("USD")}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  currency === "USD"
                    ? "border-primary-DEFAULT bg-primary-DEFAULT/10 text-white"
                    : "border-white/10 bg-dark-800/60 text-gray-400 hover:border-white/20"
                }`}
              >
                <span className="block text-lg font-black">USD 💵</span>
                <span className="block text-xs mt-1 uppercase tracking-widest">
                  Dólares
                </span>
              </button>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">
              ¿De qué país es tu cliente?
            </p>

            <select
              value={countryCode}
              onChange={(e) => onCountryCodeChange(e.target.value)}
              className="w-full bg-dark-800 border border-white/10 rounded-2xl p-4 text-white outline-none"
            >
              {COUNTRY_OPTIONS.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.label} (+{country.code})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={onContinue}
            className="w-full py-4 bg-white text-black font-black rounded-2xl uppercase text-sm hover:scale-[1.02] transition-all"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}