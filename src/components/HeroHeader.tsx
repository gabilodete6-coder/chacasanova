import React from 'react';
import { Sparkles, Calendar, MapPin, CheckCircle2, ArrowDown, Gift } from 'lucide-react';
import { HouseInfo, TexturesConfig } from '../types';

interface HeroHeaderProps {
  houseInfo: HouseInfo;
  texturesConfig?: TexturesConfig;
  totalGifts: number;
  reservedCount: number;
  onExploreClick: () => void;
}

export const HeroHeader: React.FC<HeroHeaderProps> = ({
  houseInfo,
  texturesConfig,
  totalGifts,
  reservedCount,
  onExploreClick,
}) => {
  const percentage = totalGifts > 0 ? Math.round((reservedCount / totalGifts) * 100) : 0;
  const availableCount = Math.max(0, totalGifts - reservedCount);

  const paletteItems = [
    {
      name: 'Branco',
      type: 'solid',
      colorCode: '#FFFFFF',
      borderColor: '#BDC3C7',
      description: 'Bases leves e luminosas',
    },
    {
      name: 'Preto',
      type: 'solid',
      colorCode: '#1A1A1A',
      borderColor: '#1A1A1A',
      description: 'Contrastes e acabamentos',
    },
    {
      name: 'Azul Marinho Acinzentado',
      type: 'solid',
      colorCode: '#34495E',
      borderColor: '#34495E',
      description: 'Toque clássico e sereno',
    },
    {
      name: 'Bambu',
      altName: 'Bambu',
      type: 'texture',
      textureUrl: texturesConfig?.bambuImage || 'https://flnytwosxztpzkzxjjia.supabase.co/storage/v1/object/public/textura/9741231-textura-de-madeira-de-bambu-natural-gratis-foto.jpg',
      fallbackColor: '#D2B48C',
      borderColor: '#C5A059',
      description: 'Textura natural e aconchego',
    },
    {
      name: 'Inox',
      altName: 'Inox',
      type: 'texture',
      textureUrl: texturesConfig?.inoxImage || 'https://flnytwosxztpzkzxjjia.supabase.co/storage/v1/object/public/textura/unnamed.png',
      fallbackColor: '#BDC3C7',
      borderColor: '#95A5A6',
      description: 'Acabamentos e eletros',
    },
  ];

  return (
    <section id="inicio" className="relative pt-8 pb-12 sm:pt-14 sm:pb-16 border-b border-[#BDC3C7] bg-[#FAF9F6]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        
        {/* Top Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FFFFFF] border border-[#BDC3C7] text-[#1A1A1A] text-[11px] font-bold uppercase tracking-widest mb-4 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#D2B48C]" />
          <span>CHÁ DE CASA NOVA</span>
        </div>

        {/* 1. Main Title: "Lar doce lar" */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif italic text-[#1A1A1A] tracking-tight mb-2 leading-tight">
          Lar doce lar
        </h1>
        
        {/* Couple Names */}
        <p className="font-serif text-xl sm:text-2xl text-[#34495E] italic mb-4 font-normal">
          Gabrielle & Wehington
        </p>

        {/* Subtle decorative divider */}
        <div className="h-[2px] w-14 bg-[#D2B48C] mx-auto mb-5"></div>

        {/* Date & Location Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs text-[#34495E] mb-6 font-medium">
          <div className="flex items-center gap-1.5 bg-white px-3.5 py-2 border border-[#BDC3C7] shadow-2xs">
            <Calendar className="w-4 h-4 text-[#D2B48C]" />
            <span>Sábado, 17 de Outubro • 16h</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white px-3.5 py-2 border border-[#BDC3C7] shadow-2xs">
            <MapPin className="w-4 h-4 text-[#D2B48C]" />
            <span>Condomínio Jade • R. Geraldo Pereira de Brito, 75</span>
          </div>
        </div>

        {/* 3. BOTÃO DE ATALHO RÁPIDO NO TOPO (FOCO EM CELULAR E PC) */}
        <div className="mb-8">
          <button
            id="btn-quick-view-gifts"
            type="button"
            onClick={onExploreClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#1A1A1A] hover:bg-[#34495E] text-white px-8 py-4 text-sm sm:text-base font-bold uppercase tracking-widest transition-all hover:translate-y-[-2px] shadow-md border border-[#1A1A1A]"
          >
            <Gift className="w-5 h-5 text-[#D2B48C]" />
            <span>Ver Lista de Presentes</span>
            <ArrowDown className="w-4 h-4 text-[#D2B48C] animate-bounce" />
          </button>
          <p className="text-[11px] text-[#7F8C8D] mt-2">
            Toque para ir direto aos itens disponíveis para presentear
          </p>
        </div>

        {/* Welcome Message (Exact wording requested) */}
        <div className="bg-white border border-[#BDC3C7] p-5 sm:p-7 shadow-xs mb-8 max-w-2xl mx-auto text-center">
          <p className="text-sm sm:text-base text-[#1A1A1A] leading-relaxed font-normal">
            Estamos muito felizes em compartilhar esse momento tão especial com você! Preparamos esta lista com muito carinho para equipar nosso novo lar. Fique à vontade para escolher o item que desejar e comprar onde preferir. Deixamos abaixo a nossa paleta de cores, caso queira segui-la ao escolher o seu presente.
          </p>
        </div>

        {/* 2. Paleta de Cores e Texturas da Casa (Bambu e Inox com fotos reais) */}
        <div className="bg-white border-t-4 border-[#34495E] border-x border-b border-[#BDC3C7] p-5 sm:p-7 shadow-xs mb-8 text-left">
          
          {/* Header of Palette */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#BDC3C7]/60 mb-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#34495E] block">
                Harmonia do Nosso Lar
              </span>
              <h2 className="font-serif italic text-lg sm:text-xl text-[#1A1A1A]">
                Paleta de Cores & Texturas
              </h2>
            </div>
            <p className="text-xs text-[#555] sm:text-right max-w-xs">
              Tons neutros, aconchegantes e materiais naturais para inspirar sua escolha se desejar.
            </p>
          </div>

          {/* Color Palette Swatches (5 Circles: 3 Solid Colors + 2 Texture Photos) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {paletteItems.map((item) => (
              <div 
                key={item.name}
                className="bg-[#FAF9F6] border border-[#BDC3C7] p-3.5 flex flex-col items-center text-center shadow-2xs hover:border-[#1A1A1A] transition-all"
              >
                {/* Swatch Circle: Solid Color or Texture Image */}
                {item.type === 'solid' ? (
                  <div 
                    className="w-12 h-12 rounded-full shadow-inner mb-2.5 border-2 shrink-0 transition-transform duration-200 hover:scale-105"
                    style={{ 
                      backgroundColor: item.colorCode,
                      borderColor: item.borderColor || '#BDC3C7',
                    }}
                    title={item.name}
                  />
                ) : (
                  <div 
                    className="w-12 h-12 rounded-full shadow-inner mb-2.5 border-2 shrink-0 overflow-hidden relative bg-[#FAF9F6] transition-transform duration-200 hover:scale-105"
                    style={{ 
                      borderColor: item.borderColor || '#BDC3C7',
                      backgroundColor: item.fallbackColor,
                    }}
                    title={item.name}
                  >
                    {item.textureUrl ? (
                      <img
                        src={item.textureUrl}
                        alt={item.altName || item.name}
                        loading="eager"
                        decoding="async"
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div 
                        className="w-full h-full rounded-full"
                        style={{ backgroundColor: item.fallbackColor }}
                      />
                    )}
                  </div>
                )}

                <strong className="text-xs text-[#1A1A1A] font-semibold leading-tight mb-1">
                  {item.name}
                </strong>
                <span className="text-[10px] text-[#555] leading-tight">
                  {item.description}
                </span>
              </div>
            ))}
          </div>

        </div>

        {/* Progress Bar & Available Items Indicator */}
        <div className="bg-white border border-[#BDC3C7] p-4 sm:p-5 max-w-xl mx-auto shadow-xs">
          <div className="flex justify-between items-center text-xs font-semibold text-[#1A1A1A] mb-2">
            <span className="flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-[#27AE60]" />
              <span>{reservedCount} de {totalGifts} itens reservados</span>
            </span>
            <span className="text-[#34495E] font-bold text-xs uppercase tracking-wider">
              {percentage}%
            </span>
          </div>
          <div className="w-full bg-[#FAF9F6] h-2.5 border border-[#BDC3C7]/60 overflow-hidden">
            <div 
              className="bg-[#34495E] h-full transition-all duration-700 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] uppercase tracking-wider text-[#555] mt-2 font-semibold">
            <span>Disponíveis: <strong className="text-[#27AE60]">{availableCount}</strong></span>
            <span>Total na Lista: <strong className="text-[#1A1A1A]">{totalGifts}</strong></span>
          </div>
        </div>

      </div>
    </section>
  );
};
