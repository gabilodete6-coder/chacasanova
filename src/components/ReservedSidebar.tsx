import React, { useState } from 'react';
import { GiftItem, HouseInfo } from '../types';
import { Heart, Copy, Check, Trash2, Gift, Calendar, MapPin, Sparkles } from 'lucide-react';

interface ReservedSidebarProps {
  reservedGifts: GiftItem[];
  guestName: string;
  houseInfo: HouseInfo;
  onCancelReservation: (giftId: string) => void;
}

export const ReservedSidebar: React.FC<ReservedSidebarProps> = ({
  reservedGifts,
  guestName,
  houseInfo,
  onCancelReservation,
}) => {
  const [copied, setCopied] = useState(false);

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
    <aside id="sidebar-meus-itens" className="w-full space-y-6">
      
      {/* 1. Meus Itens Reservados Card */}
      <div className="bg-white border-t-4 border-[#34495E] border-x border-b border-[#BDC3C7] p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#BDC3C7]/60 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1A1A1A] text-[#D2B48C] flex items-center justify-center border border-[#BDC3C7]">
              <Heart className="w-4 h-4 fill-[#D2B48C]" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#34495E] block">
                Área do Convidado
              </span>
              <h3 className="font-serif italic text-base sm:text-lg text-[#1A1A1A] font-semibold leading-tight">
                Meus Itens Reservados
              </h3>
            </div>
          </div>
          <span 
            id="sidebar-reserved-count-badge"
            className="text-xs font-bold px-2.5 py-0.5 bg-[#34495E] text-white"
          >
            {reservedGifts.length}
          </span>
        </div>

        {reservedGifts.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#7F8C8D] space-y-2">
            <Gift className="w-8 h-8 mx-auto text-[#BDC3C7]" />
            <p className="font-serif italic text-sm text-[#1A1A1A]">
              Nenhum presente reservado ainda
            </p>
            <p className="text-xs text-[#555]">
              Clique em &ldquo;Reservar Presente&rdquo; em qualquer item para salvá-lo aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {guestName && (
              <p className="text-xs text-[#555]">
                Reservado por: <strong className="text-[#1A1A1A]">{guestName}</strong>
              </p>
            )}

            {/* List of items */}
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {reservedGifts.map((gift) => (
                <div
                  key={gift.id}
                  id={`sidebar-item-${gift.id}`}
                  className="p-3 bg-[#FAF9F6] border border-[#BDC3C7] flex items-center justify-between gap-2.5 hover:border-[#1A1A1A] transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={gift.image}
                      alt={gift.name}
                      loading="lazy"
                      decoding="async"
                      className="w-11 h-11 object-cover border border-[#BDC3C7] shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-serif italic text-[#1A1A1A] font-semibold truncate leading-tight">
                        {gift.name}
                      </h4>
                      <span className="text-[10px] uppercase tracking-wider text-[#34495E] font-medium block">
                        {gift.category}
                      </span>
                    </div>
                  </div>

                  <button
                    id={`btn-sidebar-cancel-${gift.id}`}
                    type="button"
                    onClick={() => onCancelReservation(gift.id)}
                    className="p-2 text-stone-400 hover:text-[#C0392B] hover:bg-[#FDEDEC] transition-colors shrink-0"
                    title="Desistir deste item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Copy summary button */}
            <button
              id="btn-sidebar-copy-summary"
              type="button"
              onClick={handleCopySummary}
              className={`w-full py-3 px-4 text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 ${
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

      {/* 2. Event Info Box */}
      <div className="bg-white border border-[#BDC3C7] p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-[#1A1A1A] pb-2 border-b border-[#BDC3C7]/60">
          <Sparkles className="w-4 h-4 text-[#D2B48C]" />
          <h4 className="font-serif italic text-sm font-semibold text-[#1A1A1A]">
            Informações do Evento
          </h4>
        </div>
        
        <div className="space-y-2 text-xs text-[#555]">
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-[#34495E] shrink-0 mt-0.5" />
            <span>{houseInfo.eventDate}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-[#34495E] shrink-0 mt-0.5" />
            <span className="leading-snug">{houseInfo.location}</span>
          </div>
        </div>
      </div>

    </aside>
  );
};
