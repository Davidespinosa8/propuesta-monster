interface MessageSuggestionsProps {
  isOpen: boolean;
  clientName: string;
  total: number;
  shareUrl: string;
  onClose: () => void;
  onSelectMessage: (message: string) => void;
}

export default function MessageSuggestions({
  isOpen,
  clientName,
  total,
  shareUrl,
  onClose,
  onSelectMessage,
}: MessageSuggestionsProps) {
  if (!isOpen) return null;

  const messages = [
    `Hola ${clientName}, te dejo el presupuesto del trabajo que vimos.\n\nEl total es de $${total.toLocaleString()}.\n\nPodés verlo acá: ${shareUrl}\n\nCualquier duda lo vemos juntos 👍`,

    `Hola ${clientName}! 👋\n\nYa te armé el presupuesto detallado.\n\nTe lo paso por acá: ${shareUrl}\n\nSi te parece bien, podemos coordinar para avanzar 🚀`,

    `Hola ${clientName}, te comparto el presupuesto.\n\nPodés revisarlo en este link: ${shareUrl}\n\nEstoy disponible para empezar cuando quieras.\n\nQuedo atento 👍`,
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-dark-900 border border-white/10 rounded-3xl w-full max-w-xl max-h-[85vh] overflow-hidden relative shadow-2xl animate-in zoom-in-95">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white text-xl z-10"
        >
          ✕
        </button>

        <div className="p-5 md:p-6 border-b border-white/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary-DEFAULT mb-2">
            Mensajes sugeridos
          </p>
          <h3 className="text-xl md:text-2xl font-black text-white uppercase italic pr-8">
            Elegí cómo enviarlo
          </h3>
          <p className="text-xs md:text-sm text-gray-400 mt-2">
            Seleccioná un mensaje y te redirigimos a WhatsApp con el texto listo.
          </p>
        </div>

        <div className="p-4 md:p-5 overflow-y-auto max-h-[calc(85vh-110px)] space-y-3 custom-scrollbar">
          {messages.map((msg, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onSelectMessage(msg)}
              className="w-full text-left bg-dark-800/80 border border-white/5 rounded-2xl p-3 md:p-4 hover:border-primary-DEFAULT/50 hover:bg-dark-800 transition-all"
            >
              <p className="whitespace-pre-line text-xs md:text-sm text-gray-300 leading-relaxed mb-3">
                {msg}
              </p>
              <span className="inline-block text-[10px] font-black uppercase tracking-widest text-primary-DEFAULT">
                Usar este mensaje
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}