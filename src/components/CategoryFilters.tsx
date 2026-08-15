import React from 'react';
import { Search, X, Check } from 'lucide-react';

interface CategoryFiltersProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  statusFilter: 'all' | 'available' | 'reserved' | 'my_reserved';
  onSelectStatusFilter: (status: 'all' | 'available' | 'reserved' | 'my_reserved') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  counts: Record<string, number>;
  myReservationsCount: number;
}

export const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  statusFilter,
  onSelectStatusFilter,
  searchQuery,
  onSearchChange,
  counts,
  myReservationsCount,
}) => {
  const allCategories = ['Todas', ...categories];

  return (
    <div className="bg-[#FFFFFF] border border-[#BDC3C7] p-2.5 sm:p-3.5 shadow-2xs space-y-2.5">
      
      {/* Top Line: Compact Search Bar + Minimal Status Pills */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        
        {/* Search Input - Clean, minimalist, discreet */}
        <div className="relative flex-1 min-w-0">
          <Search className="w-3.5 h-3.5 text-[#7F8C8D] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="input-search-gifts"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar presente..."
            className="w-full pl-8 pr-7 py-1.5 sm:py-2 bg-[#FAF9F6] border border-[#BDC3C7] focus:border-[#1A1A1A] focus:bg-white text-xs sm:text-sm text-[#1A1A1A] placeholder-[#7F8C8D] focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              id="btn-clear-search"
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#7F8C8D] hover:text-[#1A1A1A] transition-colors"
              title="Limpar busca"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filters - Extremely subtle, compact pill toggles */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 sm:pb-0 scrollbar-none shrink-0 text-xs">
          <button
            id="btn-status-all"
            type="button"
            onClick={() => onSelectStatusFilter('all')}
            className={`px-2.5 py-1 text-xs rounded-full whitespace-nowrap transition-all border ${
              statusFilter === 'all'
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] font-semibold'
                : 'bg-white text-[#555] border-[#BDC3C7] hover:border-[#1A1A1A] hover:text-[#1A1A1A]'
            }`}
          >
            Todos
          </button>

          <button
            id="btn-status-available"
            type="button"
            onClick={() => onSelectStatusFilter('available')}
            className={`px-2.5 py-1 text-xs rounded-full whitespace-nowrap transition-all border ${
              statusFilter === 'available'
                ? 'bg-[#27AE60] text-white border-[#27AE60] font-semibold'
                : 'bg-white text-[#555] border-[#BDC3C7] hover:border-[#27AE60] hover:text-[#27AE60]'
            }`}
          >
            Disponíveis
          </button>

          <button
            id="btn-status-reserved"
            type="button"
            onClick={() => onSelectStatusFilter('reserved')}
            className={`px-2.5 py-1 text-xs rounded-full whitespace-nowrap transition-all border ${
              statusFilter === 'reserved'
                ? 'bg-[#34495E] text-white border-[#34495E] font-semibold'
                : 'bg-white text-[#555] border-[#BDC3C7] hover:border-[#34495E] hover:text-[#34495E]'
            }`}
          >
            Reservados
          </button>

          {myReservationsCount > 0 && (
            <button
              id="btn-status-my-reserved"
              type="button"
              onClick={() => onSelectStatusFilter('my_reserved')}
              className={`px-2.5 py-1 text-xs rounded-full whitespace-nowrap transition-all border flex items-center gap-1 ${
                statusFilter === 'my_reserved'
                  ? 'bg-[#D2B48C] text-[#1A1A1A] border-[#C5A059] font-bold'
                  : 'bg-white text-[#555] border-[#BDC3C7] hover:border-[#C5A059]'
              }`}
            >
              <Check className="w-3 h-3 text-[#1A1A1A]" />
              <span>Meus ({myReservationsCount})</span>
            </button>
          )}
        </div>

      </div>

      {/* Category Pills - Discreet, clean, lightweight and easy for everyone */}
      <div className="pt-2 border-t border-[#BDC3C7]/40">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none sm:flex-wrap">
          {allCategories.map((catName) => {
            const isSelected = activeCategory === catName;
            const count = catName === 'Todas' ? counts['Todas'] || 0 : counts[catName] || 0;

            return (
              <button
                key={catName}
                id={`btn-category-${catName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                type="button"
                onClick={() => onSelectCategory(catName)}
                className={`px-3 py-1 text-xs sm:text-[13px] whitespace-nowrap rounded-full transition-all border flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] font-semibold shadow-2xs'
                    : 'bg-[#FAF9F6] text-[#34495E] border-[#BDC3C7] hover:bg-white hover:text-[#1A1A1A] hover:border-[#1A1A1A]/50 font-normal'
                }`}
              >
                <span>{catName}</span>
                <span 
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium leading-none ${
                    isSelected 
                      ? 'bg-white/20 text-white' 
                      : 'bg-[#BDC3C7]/35 text-[#555]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
