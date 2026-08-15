import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  GiftItem, 
  HouseInfo,
  TexturesConfig
} from './types';
import { 
  initialGifts, 
  initialHouseInfo, 
  initialCategories,
  initialTexturesConfig
} from './data/initialData';
import { Navbar } from './components/Navbar';
import { HeroHeader } from './components/HeroHeader';
import { CategoryFilters } from './components/CategoryFilters';
import { GiftCard } from './components/GiftCard';
import { ReservedSidebar } from './components/ReservedSidebar';
import { ReserveModal } from './components/ReserveModal';
import { MyReservationsModal } from './components/MyReservationsModal';
import { AdminModal } from './components/AdminModal';
import { Footer } from './components/Footer';
import { 
  FilterX, 
  Check, 
  Info
} from 'lucide-react';

const ADMIN_PASSWORD = '149610';

export function App() {
  // 1. Core State with LocalStorage
  const [gifts, setGifts] = useState<GiftItem[]>(() => {
    const saved = localStorage.getItem('cha_casa_nova_gifts_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved gifts:', e);
      }
    }
    return initialGifts;
  });

  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('cha_casa_nova_categories_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved categories:', e);
      }
    }
    return initialCategories;
  });

  const [houseInfo, setHouseInfo] = useState<HouseInfo>(() => {
    const saved = localStorage.getItem('cha_casa_nova_house_info_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved house info:', e);
      }
    }
    return initialHouseInfo;
  });

  const [texturesConfig, setTexturesConfig] = useState<TexturesConfig>(() => {
    const saved = localStorage.getItem('cha_casa_nova_textures_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved textures:', e);
      }
    }
    return initialTexturesConfig;
  });

  const [guestName, setGuestName] = useState<string>(() => {
    return localStorage.getItem('cha_casa_nova_guest_name_v2') || '';
  });

  const [myReservedGiftIds, setMyReservedGiftIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('cha_casa_nova_my_reservations_v2');
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading my reservations:', e);
      }
    }
    return new Set<string>();
  });

  // 2. Filter & Search State
  const [activeCategory, setActiveCategory] = useState<string>('Todas');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'reserved' | 'my_reserved'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 3. Modals State
  const [selectedGiftForReserve, setSelectedGiftForReserve] = useState<GiftItem | null>(null);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [isMyReservationsOpen, setIsMyReservationsOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // 4. Toast Notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // References
  const giftsSectionRef = useRef<HTMLDivElement>(null);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('cha_casa_nova_gifts_v2', JSON.stringify(gifts));
  }, [gifts]);

  useEffect(() => {
    localStorage.setItem('cha_casa_nova_categories_v2', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('cha_casa_nova_house_info_v2', JSON.stringify(houseInfo));
  }, [houseInfo]);

  useEffect(() => {
    localStorage.setItem('cha_casa_nova_textures_v2', JSON.stringify(texturesConfig));
  }, [texturesConfig]);

  useEffect(() => {
    localStorage.setItem('cha_casa_nova_guest_name_v2', guestName);
  }, [guestName]);

  useEffect(() => {
    localStorage.setItem('cha_casa_nova_my_reservations_v2', JSON.stringify(Array.from(myReservedGiftIds)));
  }, [myReservedGiftIds]);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const scrollToGifts = () => {
    if (giftsSectionRef.current) {
      giftsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 5. Reservation Handlers
  const handleOpenReserveModal = (gift: GiftItem) => {
    setSelectedGiftForReserve(gift);
    setIsReserveModalOpen(true);
  };

  const handleConfirmReservation = (name: string, message?: string) => {
    if (!selectedGiftForReserve) return;

    setGuestName(name);

    // Update gift in list
    setGifts((prevGifts) =>
      prevGifts.map((g) => {
        if (g.id === selectedGiftForReserve.id) {
          return {
            ...g,
            isReserved: true,
            reservedBy: name,
            reservedAt: new Date().toISOString(),
            reservationMessage: message,
          };
        }
        return g;
      })
    );

    // Add to my reserved items
    setMyReservedGiftIds((prev) => new Set([...prev, selectedGiftForReserve.id]));

    // Close modal
    setIsReserveModalOpen(false);
    setSelectedGiftForReserve(null);

    // Confetti celebration
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D2B48C', '#34495E', '#1A1A1A', '#27AE60'],
    });

    showToast(`O presente "${selectedGiftForReserve.name}" foi reservado com sucesso!`, 'success');
  };

  const handleCancelReservation = (giftId: string) => {
    const gift = gifts.find((g) => g.id === giftId);
    
    setGifts((prevGifts) =>
      prevGifts.map((g) => {
        if (g.id === giftId) {
          return {
            ...g,
            isReserved: false,
            reservedBy: undefined,
            reservedAt: undefined,
            reservationMessage: undefined,
          };
        }
        return g;
      })
    );

    setMyReservedGiftIds((prev) => {
      const next = new Set(prev);
      next.delete(giftId);
      return next;
    });

    showToast(`Reserva do item "${gift?.name || 'Presente'}" cancelada. O item agora está disponível.`, 'info');
  };

  // 6. Admin Authentication & Actions
  const handleAdminAuthenticate = (pass: string) => {
    if (pass === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
  };

  const handleAddGift = (newGiftData: Omit<GiftItem, 'id' | 'isReserved'>) => {
    const newId = `gift-custom-${Date.now()}`;
    const newGift: GiftItem = {
      ...newGiftData,
      id: newId,
      isReserved: false,
    };
    setGifts((prev) => [newGift, ...prev]);
    showToast(`"${newGift.name}" foi adicionado com sucesso!`);
  };

  const handleDeleteGift = (giftId: string) => {
    setGifts((prev) => prev.filter((g) => g.id !== giftId));
    setMyReservedGiftIds((prev) => {
      const next = new Set(prev);
      next.delete(giftId);
      return next;
    });
    showToast('Presente excluído da lista.', 'info');
  };

  const handleToggleReserveGift = (giftId: string) => {
    setGifts((prev) =>
      prev.map((g) => {
        if (g.id === giftId) {
          const isNowReserved = !g.isReserved;
          return {
            ...g,
            isReserved: isNowReserved,
            reservedBy: isNowReserved ? 'Anfitrião' : undefined,
          };
        }
        return g;
      })
    );
  };

  const handleAddCategory = (categoryName: string) => {
    setCategories((prev) => [...prev, categoryName]);
    showToast(`Categoria "${categoryName}" criada com sucesso!`);
  };

  const handleDeleteCategory = (categoryName: string) => {
    setCategories((prev) => prev.filter((c) => c !== categoryName));
    if (activeCategory === categoryName) {
      setActiveCategory('Todas');
    }
    showToast(`Categoria "${categoryName}" removida.`, 'info');
  };

  const handleUpdateTexture = (type: 'bambu' | 'inox', newImageUrl: string) => {
    setTexturesConfig((prev) => ({
      ...prev,
      [type === 'bambu' ? 'bambuImage' : 'inoxImage']: newImageUrl,
    }));
  };

  const handleRemoveTexture = (type: 'bambu' | 'inox') => {
    setTexturesConfig((prev) => ({
      ...prev,
      [type === 'bambu' ? 'bambuImage' : 'inoxImage']: '',
    }));
  };

  // 7. Computed Data with Automatic Sorting (Available items FIRST, Reserved items LAST)
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Todas: gifts.length,
    };
    categories.forEach((cat) => {
      counts[cat] = gifts.filter((g) => g.category === cat).length;
    });
    return counts;
  }, [gifts, categories]);

  const reservedCount = useMemo(() => {
    return gifts.filter((g) => g.isReserved).length;
  }, [gifts]);

  const myReservedGiftsList = useMemo(() => {
    return gifts.filter((g) => myReservedGiftIds.has(g.id));
  }, [gifts, myReservedGiftIds]);

  const filteredGifts = useMemo(() => {
    const filtered = gifts.filter((gift) => {
      // Category filter
      if (activeCategory !== 'Todas' && gift.category !== activeCategory) {
        return false;
      }

      // Status filter
      if (statusFilter === 'available' && gift.isReserved) {
        return false;
      }
      if (statusFilter === 'reserved' && !gift.isReserved) {
        return false;
      }
      if (statusFilter === 'my_reserved' && !myReservedGiftIds.has(gift.id)) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = gift.name.toLowerCase().includes(q);
        const matchesDesc = gift.description?.toLowerCase().includes(q) || false;
        const matchesCategory = gift.category.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCategory) {
          return false;
        }
      }

      return true;
    });

    // Automatic Sorting: Available items appear FIRST, Reserved items go to the END
    return filtered.sort((a, b) => {
      if (!a.isReserved && b.isReserved) return -1;
      if (a.isReserved && !b.isReserved) return 1;
      return 0;
    });
  }, [gifts, activeCategory, statusFilter, searchQuery, myReservedGiftIds]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A1A1A] flex flex-col font-sans selection:bg-[#D2B48C] selection:text-[#1A1A1A]">
      
      {/* Toast Banner */}
      {toastMessage && (
        <div 
          id="toast-notification"
          className={`fixed bottom-6 right-6 z-50 px-5 py-4 border shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200 max-w-md ${
            toastMessage.type === 'success' 
              ? 'bg-[#1A1A1A] text-white border-[#D2B48C]' 
              : 'bg-[#34495E] text-white border-[#BDC3C7]'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <Check className="w-5 h-5 text-[#D2B48C] shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-white shrink-0" />
          )}
          <span className="text-xs font-semibold leading-snug">{toastMessage.text}</span>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        houseInfo={houseInfo}
        myReservedCount={myReservedGiftsList.length}
        onOpenMyReservations={() => setIsMyReservationsOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onScrollToGifts={scrollToGifts}
      />

      {/* Main Content */}
      <main className="flex-1">
        
        {/* Top Header with Quick Shortcut & Color Palette with Texture Photos */}
        <HeroHeader
          houseInfo={houseInfo}
          texturesConfig={texturesConfig}
          totalGifts={gifts.length}
          reservedCount={reservedCount}
          onExploreClick={scrollToGifts}
        />

        {/* Gift Registry Section */}
        <section 
          id="lista-presentes" 
          ref={giftsSectionRef} 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16"
        >
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#34495E] block">
              Escolha e Reserve
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif italic text-[#1A1A1A] font-semibold">
              Lista de Presentes do Nosso Lar
            </h2>
            <p className="text-xs sm:text-sm text-[#555] leading-relaxed">
              Fique à vontade para escolher o presente que mais gostar. Os itens disponíveis aparecem no início da lista. Você pode comprar na loja de sua preferência!
            </p>
          </div>

          {/* Main Registry Layout with Responsive Grid and Sticky Sidebar */}
          <div className="flex flex-col lg:flex-row items-start gap-8">
            
            {/* Left/Main Column: Filters + Gift Cards */}
            <div className="flex-1 w-full space-y-8">
              
              {/* Category & Status Filters */}
              <CategoryFilters
                categories={categories}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
                statusFilter={statusFilter}
                onSelectStatusFilter={setStatusFilter}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                counts={categoryCounts}
                myReservationsCount={myReservedGiftsList.length}
              />

              {/* Filter Status Reset Button if empty */}
              {filteredGifts.length === 0 ? (
                <div className="py-16 text-center bg-white border border-[#BDC3C7] p-8 shadow-xs space-y-4">
                  <div className="w-14 h-14 bg-[#FAF9F6] border border-[#BDC3C7] text-[#34495E] mx-auto flex items-center justify-center">
                    <FilterX className="w-7 h-7" />
                  </div>
                  <h3 className="font-serif italic text-2xl text-[#1A1A1A]">
                    Nenhum presente encontrado
                  </h3>
                  <p className="text-xs text-[#555] max-w-md mx-auto">
                    Não encontramos nenhum item com os filtros selecionados ou termo &ldquo;{searchQuery}&rdquo;.
                  </p>
                  <button
                    id="btn-reset-filters"
                    type="button"
                    onClick={() => {
                      setActiveCategory('Todas');
                      setStatusFilter('all');
                      setSearchQuery('');
                    }}
                    className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#34495E] transition-all shadow-xs"
                  >
                    <span>Limpar Filtros e Ver Todos</span>
                  </button>
                </div>
              ) : (
                /* Gifts Cards Responsive Grid (2 to 3 columns on desktop, 1 on mobile) */
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredGifts.map((gift) => (
                    <GiftCard
                      key={gift.id}
                      gift={gift}
                      isMyReservation={myReservedGiftIds.has(gift.id)}
                      onReserve={handleOpenReserveModal}
                      onCancelReservation={handleCancelReservation}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right/Sticky Sidebar: Meus Itens Reservados */}
            <div className="w-full lg:w-80 lg:sticky lg:top-24">
              <ReservedSidebar
                reservedGifts={myReservedGiftsList}
                guestName={guestName}
                houseInfo={houseInfo}
                onCancelReservation={handleCancelReservation}
              />
            </div>

          </div>

        </section>

      </main>

      {/* Modals */}
      <ReserveModal
        gift={selectedGiftForReserve}
        isOpen={isReserveModalOpen}
        onClose={() => {
          setIsReserveModalOpen(false);
          setSelectedGiftForReserve(null);
        }}
        onConfirm={handleConfirmReservation}
        initialGuestName={guestName}
      />

      <MyReservationsModal
        isOpen={isMyReservationsOpen}
        onClose={() => setIsMyReservationsOpen(false)}
        reservedGifts={myReservedGiftsList}
        guestName={guestName}
        houseInfo={houseInfo}
        onCancelReservation={handleCancelReservation}
      />

      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        isAuthenticated={isAdminAuthenticated}
        onAuthenticate={handleAdminAuthenticate}
        onLogout={handleAdminLogout}
        gifts={gifts}
        categories={categories}
        houseInfo={houseInfo}
        texturesConfig={texturesConfig}
        onAddGift={handleAddGift}
        onDeleteGift={handleDeleteGift}
        onToggleReserveGift={handleToggleReserveGift}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        onUpdateHouseInfo={setHouseInfo}
        onUpdateTexture={handleUpdateTexture}
        onRemoveTexture={handleRemoveTexture}
      />

      {/* Footer */}
      <Footer
        houseInfo={houseInfo}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
      />

    </div>
  );
}
export default App;
