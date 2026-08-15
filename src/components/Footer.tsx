import React from 'react';
import { ShieldCheck, ArrowUp, Heart, Sparkles } from 'lucide-react';
import { HouseInfo } from '../types';

interface FooterProps {
  houseInfo: HouseInfo;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ houseInfo, onOpenAdmin }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#1A1A1A] text-white border-t-4 border-[#34495E] pt-14 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-8">
        
        {/* Bible Verse Section (Exact Verse Requested) */}
        <div className="bg-[#FFFFFF]/5 border border-white/10 p-6 sm:p-8 max-w-2xl mx-auto backdrop-blur-xs space-y-3">
          <Sparkles className="w-5 h-5 text-[#D2B48C] mx-auto opacity-90" />
          <blockquote className="font-serif italic text-lg sm:text-2xl text-[#FAF9F6] leading-relaxed">
            &ldquo;Consagre ao Senhor tudo o que você faz, e os seus planos serão bem-sucedidos&rdquo;
          </blockquote>
          <cite className="text-xs uppercase tracking-widest text-[#D2B48C] font-semibold block not-italic">
            — Provérbios 16:3
          </cite>
        </div>

        {/* Couple Dedication */}
        <div className="space-y-2">
          <h3 className="font-serif italic text-2xl text-white font-semibold">
            Lar doce lar
          </h3>
          <p className="text-xs text-[#BDC3C7] font-medium tracking-wide">
            {houseInfo.coupleNames} • {houseInfo.eventDate}
          </p>
        </div>

        {/* Action Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-4 border-t border-white/10 text-xs">
          <button
            id="btn-scroll-top"
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 text-stone-300 hover:text-white uppercase tracking-wider font-bold transition-colors"
          >
            <ArrowUp className="w-4 h-4 text-[#D2B48C]" />
            <span>Voltar ao Topo</span>
          </button>

          <span className="text-white/20">•</span>

          <button
            id="btn-admin-footer"
            type="button"
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 text-stone-300 hover:text-white uppercase tracking-wider font-bold transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-[#D2B48C]" />
            <span>Acesso dos Anfitriões</span>
          </button>
        </div>

        {/* Copyright / Friendly note */}
        <p className="text-[11px] text-stone-400">
          Feito com carinho para celebrar a nova casa com família e amigos.
        </p>

      </div>
    </footer>
  );
};
