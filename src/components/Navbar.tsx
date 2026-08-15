import React from 'react';
import { Home, Heart, ShieldCheck, Sparkles } from 'lucide-react';
import { HouseInfo } from '../types';

interface NavbarProps {
  houseInfo: HouseInfo;
  myReservedCount: number;
  onOpenMyReservations: () => void;
  onOpenAdmin: () => void;
  onScrollToGifts: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  houseInfo,
  myReservedCount,
  onOpenMyReservations,
  onOpenAdmin,
  onScrollToGifts,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#BDC3C7] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
        
        {/* Brand / Logo */}
        <a 
          href="#inicio"
          className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-[#1A1A1A] text-white flex items-center justify-center border border-[#BDC3C7] group-hover:bg-[#34495E] transition-colors">
            <Home className="w-5 h-5 text-[#D2B48C]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif italic text-lg sm:text-2xl text-[#1A1A1A] tracking-tight font-semibold leading-tight">
                Lar doce lar
              </span>
              <Sparkles className="w-3.5 h-3.5 text-[#D2B48C] hidden sm:inline" />
            </div>
            <p className="text-[11px] sm:text-xs text-[#34495E] font-medium tracking-wide">
              {houseInfo.coupleNames}
            </p>
          </div>
        </a>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick jump to list on mobile */}
          <button
            type="button"
            id="btn-nav-ver-lista"
            onClick={onScrollToGifts}
            className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#34495E] hover:text-[#1A1A1A] hover:bg-[#FAF9F6] border border-transparent hover:border-[#BDC3C7] transition-all"
          >
            Lista de Presentes
          </button>

          {/* My Reservations Button */}
          <button
            type="button"
            id="btn-nav-meus-itens"
            onClick={onOpenMyReservations}
            className="relative px-3.5 sm:px-4 py-2 sm:py-2.5 bg-[#FAF9F6] border border-[#BDC3C7] text-[#1A1A1A] hover:border-[#34495E] hover:bg-[#FFFFFF] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-xs"
            title="Ver meus itens reservados"
          >
            <Heart className={`w-4 h-4 ${myReservedCount > 0 ? 'text-[#C0392B] fill-[#C0392B]' : 'text-[#34495E]'}`} />
            <span className="hidden sm:inline">Meus Itens</span>
            {myReservedCount > 0 && (
              <span 
                id="nav-reserved-badge"
                className="w-5 h-5 bg-[#34495E] text-white text-[11px] font-bold rounded-full flex items-center justify-center -ml-0.5"
              >
                {myReservedCount}
              </span>
            )}
          </button>

          {/* Admin host access (Password Protected) */}
          <button
            type="button"
            id="btn-admin"
            onClick={onOpenAdmin}
            className="px-3 sm:px-4 py-2 sm:py-2.5 border border-[#1A1A1A] bg-[#1A1A1A] text-white hover:bg-[#34495E] hover:border-[#34495E] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs"
            title="Acesso dos Anfitriões (Protegido por Senha)"
          >
            <ShieldCheck className="w-4 h-4 text-[#D2B48C]" />
            <span className="hidden sm:inline">Painel Admin</span>
          </button>

        </div>

      </div>
    </header>
  );
};
