import React, { useState, useEffect } from 'react';
import { GiftItem } from '../types';
import { X, Check, Heart, User, AlertCircle } from 'lucide-react';

interface ReserveModalProps {
  gift: GiftItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (guestName: string, message?: string) => Promise<boolean | { success: boolean; error?: string } | void> | void;
  initialGuestName?: string;
}

export const ReserveModal: React.FC<ReserveModalProps> = ({
  gift,
  isOpen,
  onClose,
  onConfirm,
  initialGuestName = '',
}) => {
  const [guestName, setGuestName] = useState(initialGuestName);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialGuestName) {
      setGuestName(initialGuestName);
    }
  }, [initialGuestName]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen || !gift) return null;

  const handleCancel = () => {
    setError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setError('Por favor, informe seu nome para confirmar a reserva.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await onConfirm(guestName.trim());
      if (result && typeof result === 'object' && result.success === false) {
        setError(result.error || 'Ops! Este presente acabou de ser reservado por outra pessoa.');
      }
    } catch (err: any) {
      setError(err?.message || 'Ops! Ocorreu um erro ao processar a reserva. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      id="modal-reserve-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={handleCancel}
    >
      <div 
        id="modal-reserve-content"
        className="bg-white border-t-4 border-[#34495E] border-x border-b border-[#BDC3C7] max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#FAF9F6] border-b border-[#BDC3C7] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#1A1A1A] text-[#D2B48C] flex items-center justify-center border border-[#BDC3C7]">
              <Heart className="w-4 h-4 fill-[#D2B48C]" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#34495E] block">
                Reserva de Presente
              </span>
              <h3 className="font-serif italic text-lg sm:text-xl text-[#1A1A1A] font-semibold">
                Confirmar Escolha
              </h3>
            </div>
          </div>

          <button
            id="btn-close-modal"
            type="button"
            onClick={handleCancel}
            className="w-9 h-9 border border-[#BDC3C7] bg-white text-[#1A1A1A] flex items-center justify-center hover:bg-[#1A1A1A] hover:text-white transition-colors"
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gift Summary Box */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="p-3.5 bg-[#FAF9F6] border border-[#BDC3C7] flex items-center gap-3.5">
            <img 
              src={gift.image} 
              alt={gift.name} 
              decoding="async"
              className="w-16 h-16 object-cover border border-[#BDC3C7] shrink-0" 
            />
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#34495E] block">
                {gift.category}
              </span>
              <h4 className="font-serif italic text-base text-[#1A1A1A] font-semibold truncate leading-tight">
                {gift.name}
              </h4>
              <p className="text-xs text-[#555] mt-0.5">
                Você pode comprar onde preferir e entregar no dia!
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Guest Name Input */}
            <div className="space-y-1.5">
              <label 
                htmlFor="input-guest-name" 
                className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider"
              >
                Seu Nome Completo <span className="text-[#C0392B]">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#34495E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-guest-name"
                  type="text"
                  required
                  autoFocus
                  value={guestName}
                  onChange={(e) => {
                    setGuestName(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Ex: Maria Silva / Família Souza"
                  className="w-full pl-10 pr-3.5 py-3 bg-[#FAF9F6] border border-[#BDC3C7] focus:border-[#1A1A1A] focus:bg-white text-sm text-[#1A1A1A] focus:outline-none transition-all"
                />
              </div>
              <p className="text-[11px] text-[#7F8C8D]">
                Seu nome servirá para sabermos quem nos presenteou com carinho.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-[#FDEDEC] border border-[#C0392B]/40 text-[#C0392B] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#BDC3C7]/60">
              <button
                id="btn-cancel-modal"
                type="button"
                onClick={handleCancel}
                className="px-5 py-3 text-xs uppercase tracking-wider font-bold text-[#555] hover:text-[#1A1A1A] border border-[#BDC3C7] hover:bg-[#FAF9F6] transition-all"
              >
                Cancelar
              </button>
              <button
                id="btn-confirm-reserve"
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-[#1A1A1A] hover:bg-[#34495E] text-white text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-xs disabled:opacity-50"
              >
                <Check className="w-4 h-4 text-[#D2B48C]" />
                <span>{isSubmitting ? 'Confirmando...' : 'Confirmar Reserva'}</span>
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};
