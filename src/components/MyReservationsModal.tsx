import React, { useState, useEffect } from 'react';
import { GiftItem, HouseInfo } from '../types';
import { 
  Heart, 
  X, 
  Trash2, 
  Copy, 
  Check, 
  Gift, 
  Calendar, 
  MapPin, 
  Sparkles 
} from 'lucide-react';

interface MyReservationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservedGifts: GiftItem[];
  guestName: string;
  houseInfo: HouseInfo;
  onCancelReservation: (giftId: string) => void;
}

export const MyReservationsModal: React.FC<MyReservationsModalProps> = ({
  isOpen,
  onClose,
  reservedGifts,
  guestName,
  houseInfo,
  onCancelReservation,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopySummary = () => {
    if (reservedGifts.length === 0) return;

    const itemsListText = reservedGifts
      .map((g, idx) => `${idx + 1}. ${g.name} (${g.category})`)
      .join('\n');

    const summaryText = `🏠✨ Chá de Casa Nova: ${houseInfo.coupleNames} ✨🏠\n\n` +
      `🎁 Meus Presentes Reservados:\n${itemsListText}\n\n` +
      `📅 Data: ${houseInfo.eventDate}\n` +
      `📍 Local: ${houseInfo.location}\n\n` +
      `Mal posso esperar para comemorar com vocês no novo lar!`;

    navigator.clipboard.writeText(summaryText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <div 
      id="modal-my-reservations-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        id="modal-my-reservations-content"
        className="bg-white border-t-4 border-[#34495E] border-x border-b border-[#BDC3C7] max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#FAF9F6] border-b border-[#BDC3C7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1A1A1A] text-[#D2B48C] flex items-center justify-center border border-[#BDC3C7]">
              <Heart className="w-5 h-5 fill-[#D2B48C]" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#34495E] block">
                Painel do Convidado
              </span>
              <h3 className="font-serif italic text-lg sm:text-xl text-[#1A1A1A] font-semibold">
                Meus Itens Reservados
              </h3>
            </div>
          </div>

          <button
            id="btn-close-my-reservations"
            type="button"
            onClick={onClose}
            className="w-9 h-9 border border-[#BDC3C7] bg-white text-[#1A1A1A] flex items-center justify-center hover:bg-[#1A1A1A] hover:text-white transition-colors"
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {reservedGifts.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 bg-[#FAF9F6] border border-[#BDC3C7] text-[#34495E] mx-auto flex items-center justify-center">
                <Gift className="w-7 h-7" />
              </div>
              <h4 className="font-serif italic text-xl text-[#1A1A1A]">
                Você ainda não reservou nenhum presente
              </h4>
              <p className="text-xs text-[#555] max-w-sm mx-auto">
                Explore a lista de presentes na página e clique em &ldquo;Reservar Presente&rdquo; nos itens que desejar.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#555] pb-2 border-b border-[#BDC3C7]/60">
                <span>
                  {guestName ? (
                    <>Reservas em nome de: <strong className="text-[#1A1A1A]">{guestName}</strong></>
                  ) : (
                    'Itens salvos neste aparelho'
                  )}
                </span>
                <span className="font-bold text-[#1A1A1A]">
                  {reservedGifts.length} {reservedGifts.length === 1 ? 'item' : 'itens'}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {reservedGifts.map((gift) => (
                  <div
                    key={gift.id}
                    className="p-3.5 bg-[#FAF9F6] border border-[#BDC3C7] flex items-center justify-between gap-3 hover:border-[#1A1A1A] transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={gift.image}
                        alt={gift.name}
                        loading="lazy"
                        decoding="async"
                        className="w-14 h-14 object-cover border border-[#BDC3C7] shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#34495E] block">
                          {gift.category}
                        </span>
                        <h4 className="font-serif italic text-base text-[#1A1A1A] font-semibold truncate leading-tight">
                          {gift.name}
                        </h4>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onCancelReservation(gift.id)}
                      className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#C0392B] hover:bg-[#FDEDEC] border border-[#C0392B]/30 flex items-center gap-1.5 transition-colors shrink-0"
                      title="Cancelar reserva deste presente"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Desistir</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Reminder Box */}
              <div className="p-4 bg-white border border-[#BDC3C7] space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#34495E] uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-[#D2B48C]" />
                  <span>Dica de Compra</span>
                </div>
                <p className="text-xs text-[#555] leading-relaxed">
                  Você tem total liberdade para comprar os presentes na loja física ou online de sua preferência e levar no dia do Chá de Casa Nova ({houseInfo.eventDate})!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {reservedGifts.length > 0 && (
          <div className="p-4 sm:p-5 bg-[#FAF9F6] border-t border-[#BDC3C7] flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-[#555]">
              Guarde a lista para não esquecer os itens escolhidos.
            </span>

            <button
              id="btn-copy-summary"
              type="button"
              onClick={handleCopySummary}
              className={`w-full sm:w-auto px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all shadow-xs flex items-center justify-center gap-2 ${
                copied
                  ? 'bg-[#27AE60] text-white'
                  : 'bg-[#1A1A1A] hover:bg-[#34495E] text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#D2B48C]" />
                  <span>Resumo Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#D2B48C]" />
                  <span>Copiar Resumo dos Meus Presentes</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
