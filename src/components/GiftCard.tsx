import React, { useState } from 'react';
import { GiftItem } from '../types';
import { Check, Heart, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface GiftCardProps {
  gift: GiftItem;
  isMyReservation: boolean;
  onReserve: (gift: GiftItem) => void;
  onCancelReservation: (giftId: string) => void;
}

export const GiftCard: React.FC<GiftCardProps> = ({
  gift,
  isMyReservation,
  onReserve,
  onCancelReservation,
}) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Compile list of images for this gift
  const allImages = gift.images && gift.images.length > 0 ? gift.images : [gift.image];
  const hasMultipleImages = allImages.length > 1;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <div 
      id={`gift-card-${gift.id}`}
      className={`group bg-white border border-[#BDC3C7] overflow-hidden flex flex-col justify-between transition-all duration-200 hover:border-[#1A1A1A] hover:shadow-md ${
        gift.isReserved 
          ? isMyReservation 
            ? 'ring-2 ring-[#D2B48C] bg-[#FAF9F6]' 
            : 'opacity-90 bg-[#F5F5F5]' 
          : 'bg-white'
      }`}
    >
      <div>
        {/* Image Container with multiple photo support */}
        <div className="relative aspect-4/3 bg-[#FAF9F6] border-b border-[#BDC3C7] overflow-hidden">
          <img
            src={allImages[currentImgIndex] || gift.image}
            alt={gift.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
          />

          {/* Multiple images controls */}
          {hasMultipleImages && (
            <>
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-1 sm:left-1.5 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-7 sm:h-7 bg-white/90 text-[#1A1A1A] hover:bg-white flex items-center justify-center border border-[#BDC3C7] shadow-xs cursor-pointer"
                title="Foto anterior"
              >
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-1 sm:right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-7 sm:h-7 bg-white/90 text-[#1A1A1A] hover:bg-white flex items-center justify-center border border-[#BDC3C7] shadow-xs cursor-pointer"
                title="Próxima foto"
              >
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <div className="absolute bottom-1.5 sm:bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-mono">
                {currentImgIndex + 1}/{allImages.length}
              </div>
            </>
          )}

          {/* Category Badge */}
          <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 max-w-[55%] sm:max-w-none">
            <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider bg-[#FFFFFF]/95 text-[#1A1A1A] border border-[#BDC3C7] shadow-2xs truncate block">
              {gift.category}
            </span>
          </div>

          {/* Status Badge */}
          <div className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5">
            {gift.isReserved ? (
              isMyReservation ? (
                <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider bg-[#D2B48C] text-[#1A1A1A] border border-[#C5A059] shadow-2xs flex items-center gap-1">
                  <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-[#1A1A1A]" />
                  <span className="hidden sm:inline">Reservado por Você</span>
                  <span className="sm:hidden">Meu Item</span>
                </span>
              ) : (
                <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider bg-[#34495E] text-white border border-[#34495E] shadow-2xs flex items-center gap-1">
                  <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#D2B48C]" />
                  <span className="hidden sm:inline">Item Já Reservado</span>
                  <span className="sm:hidden">Reservado</span>
                </span>
              )
            ) : (
              <span className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider bg-[#27AE60] text-white border border-[#27AE60] shadow-2xs">
                Disponível
              </span>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-3 sm:p-4 md:p-5 space-y-1 sm:space-y-2">
          <h3 className="text-base sm:text-xl md:text-2xl font-serif italic text-[#1A1A1A] font-bold leading-tight sm:leading-snug line-clamp-2 min-h-[2.8rem] sm:min-h-[3.6rem]">
            {gift.name}
          </h3>

          {gift.description && (
            <p className="text-[11px] sm:text-xs text-[#555] line-clamp-2 leading-snug sm:leading-relaxed">
              {gift.description}
            </p>
          )}
        </div>
      </div>

      {/* Footer Action Button */}
      <div className="p-2.5 sm:p-4 md:p-5 pt-0">
        {gift.isReserved ? (
          isMyReservation ? (
            <div className="space-y-1.5 sm:space-y-2">
              <div className="w-full py-1.5 sm:py-2 px-1 bg-[#FAF9F6] border border-[#D2B48C] text-center text-[10px] sm:text-xs font-semibold text-[#1A1A1A] flex items-center justify-center gap-1 sm:gap-1.5">
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#27AE60]" />
                <span>Reservado por você</span>
              </div>
              <button
                id={`btn-cancel-reserve-${gift.id}`}
                type="button"
                onClick={() => onCancelReservation(gift.id)}
                className="w-full py-2 sm:py-2.5 px-1 sm:px-3 text-[9px] sm:text-xs uppercase tracking-wider font-bold text-[#C0392B] hover:bg-[#FDEDEC] border border-[#C0392B]/40 transition-colors flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer"
              >
                <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Desistir da Reserva</span>
              </button>
            </div>
          ) : (
            <button
              id={`btn-reserved-disabled-${gift.id}`}
              type="button"
              disabled
              className="w-full py-2.5 sm:py-3.5 px-2 sm:px-4 border border-[#BDC3C7] bg-[#EFEFEF] text-[#7F8C8D] text-[10px] sm:text-xs uppercase tracking-wider font-bold cursor-not-allowed flex items-center justify-center gap-1 sm:gap-1.5"
            >
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#7F8C8D]" />
              <span>Presente Reservado</span>
            </button>
          )
        ) : (
          <button
            id={`btn-reserve-${gift.id}`}
            type="button"
            onClick={() => onReserve(gift)}
            className="w-full py-2.5 sm:py-3.5 px-2 sm:px-4 bg-[#1A1A1A] hover:bg-[#34495E] text-white text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 shadow-xs hover:translate-y-[-1px] cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D2B48C]" />
            <span className="sm:hidden">Reservar</span>
            <span className="hidden sm:inline">Reservar Presente</span>
          </button>
        )}
      </div>
    </div>
  );
};
