interface DashboardSummaryProps {
  sentCount: number;
  acceptedCount: number;
  totalGeneratedARS: number;
  totalGeneratedUSD: number;
}

export default function DashboardSummary({
  sentCount,
  acceptedCount,
  totalGeneratedARS,
  totalGeneratedUSD,
}: DashboardSummaryProps) {
  const cards = [
    {
      label: "Enviados",
      value: sentCount,
    },
    {
      label: "Aceptados",
      value: acceptedCount,
    },
    {
      label: "Generado ARS",
      value: `$${totalGeneratedARS.toLocaleString()}`,
    },
    {
      label: "Generado USD",
      value: `USD $${totalGeneratedUSD.toLocaleString()}`,
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-8">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-dark-800/50 backdrop-blur-md border border-white/5 rounded-2xl p-4 md:p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
        >
          <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 mb-2">
            {card.label}
          </p>
          <p className="text-lg md:text-2xl xl:text-3xl font-black text-white tracking-tighter leading-none">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}