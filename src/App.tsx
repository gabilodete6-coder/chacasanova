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
import { 
  fetchPresentesFromSupabase, 
  fetchPresentesWithRetry,
  isStatementTimeoutError,
  fetchCategoriasFromSupabase, 
  fetchHouseInfoFromSupabase,
  fetchTexturesFromSupabase,
  saveTexturesToSupabase,
  updateGiftReservationInSupabase,
  addGiftToSupabase,
  deleteGiftFromSupabase,
  addCategoryToSupabase,
  deleteCategoryFromSupabase,
  saveHouseInfoToSupabase,
  syncAllToSupabase,
  mapRowToGift,
  supabase
} from './lib/supabase';
import { Navbar } from './components/Navbar';
import { HeroHeader } from './components/HeroHeader';
import { CategoryFilters } from './components/CategoryFilters';
import { GiftCard } from './components/GiftCard';
import { ReservedSidebar } from './components/ReservedSidebar';
import { ReserveModal } from './components/ReserveModal';
import { MyReservationsModal } from './components/MyReservationsModal';
import { AdminModal } from './components/AdminModal';
import { MigrateImagesPage } from './components/MigrateImagesPage';
import { Footer } from './components/Footer';
import { 
  FilterX, 
  Check, 
  Info,
  Loader2,
  RefreshCw,
  AlertCircle,
  Gift
} from 'lucide-react';

export function App() {
  // 1. Core State directly from Supabase (Zero mock fallback)
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [isLoadingGifts, setIsLoadingGifts] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [categories, setCategories] = useState<string[]>([
    'Cozinha',
    'Cama & Banho',
    'Eletros',
    'Decoração',
    'Área de Serviço',
  ]);

  const [houseInfo, setHouseInfo] = useState<HouseInfo>(initialHouseInfo);

  const [texturesConfig, setTexturesConfig] = useState<TexturesConfig>(() => {
    const saved = localStorage.getItem('cha_casa_nova_textures_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const bambu = (parsed.bambuImage && !parsed.bambuImage.startsWith('./')) ? parsed.bambuImage : initialTexturesConfig.bambuImage;
        const inox = (parsed.inoxImage && !parsed.inoxImage.startsWith('./')) ? parsed.inoxImage : initialTexturesConfig.inoxImage;
        return {
          bambuImage: bambu,
          inoxImage: inox,
        };
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

  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean | null>(null);

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

  // 5. Temporary Migration Page Route (/admin/migrar-imagens or #admin-migrar)
  const [isMigrationPage, setIsMigrationPage] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname || '';
    const hash = window.location.hash || '';
    return path.includes('migrar-imagens') || hash.includes('migrar-imagens') || hash.includes('admin-migrar');
  });

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname || '';
      const hash = window.location.hash || '';
      const isMigrate = path.includes('migrar-imagens') || hash.includes('migrar-imagens') || hash.includes('admin-migrar');
      setIsMigrationPage(isMigrate);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // References
  const giftsSectionRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);
  const initialMountFiredRef = useRef(false);

  // Function to load all data from Supabase with auto-retry, friendly timeout message, and single-dispatch guard
  const loadDataFromSupabase = async (force: boolean = false) => {
    // Evita múltiplos disparos simultâneos ou concorrentes (Requisito 3)
    if (isFetchingRef.current && !force) {
      return;
    }

    isFetchingRef.current = true;
    setIsLoadingGifts(true);
    setLoadError(null);

    try {
      // 1. Busca principal da tabela 'presentes' com retry automático após 1s em caso de falha/timeout (Requisito 1)
      const presentesRes = await fetchPresentesWithRetry();

      if (presentesRes.error || !presentesRes.data) {
        setIsSupabaseConnected(false);
        setGifts([]);

        // 2. Mensagem amigável ao usuário sem expor erros técnicos (Requisito 2)
        if (presentesRes.isTimeout || isStatementTimeoutError(presentesRes.error)) {
          setLoadError('Conexão temporariamente lenta. Clique no botão abaixo para tentar novamente.');
        } else {
          setLoadError('Conexão temporariamente lenta. Clique no botão abaixo para tentar novamente.');
        }
      } else {
        setIsSupabaseConnected(true);
        setLoadError(null);
        setGifts(presentesRes.data.map(mapRowToGift));
      }

      // 2. Busca secundária assíncrona/não-bloqueante de categorias e texturas para não sobrecarregar a conexão
      fetchCategoriasFromSupabase()
        .then((cats) => {
          if (cats && cats.length > 0) {
            setCategories(cats);
          }
        })
        .catch((err) => console.warn('Aviso categorias:', err));

      fetchTexturesFromSupabase()
        .then((tex) => {
          if (tex && (tex.bambuImage || tex.inoxImage)) {
            setTexturesConfig((prev) => ({
              bambuImage: (tex.bambuImage && !tex.bambuImage.startsWith('./')) ? tex.bambuImage : (prev.bambuImage || initialTexturesConfig.bambuImage),
              inoxImage: (tex.inoxImage && !tex.inoxImage.startsWith('./')) ? tex.inoxImage : (prev.inoxImage || initialTexturesConfig.inoxImage),
            }));
          }
        })
        .catch((err) => console.warn('Aviso texturas:', err));
    } catch (err: any) {
      console.error('Erro na conexão com Supabase:', err);
      setIsSupabaseConnected(false);
      setGifts([]);

      // Mensagem amigável (Requisito 2)
      if (isStatementTimeoutError(err)) {
        setLoadError('Conexão temporariamente lenta. Clique no botão abaixo para tentar novamente.');
      } else {
        setLoadError('Conexão temporariamente lenta. Clique no botão abaixo para tentar novamente.');
      }
    } finally {
      setIsLoadingGifts(false);
      isFetchingRef.current = false;
    }
  };

  // Load directly from Supabase table 'presentes' once on mount and subscribe to Realtime channel
  useEffect(() => {
    // Garante que a requisição inicial rode apenas 1 única vez na montagem da tela (Requisito 3)
    if (!initialMountFiredRef.current) {
      initialMountFiredRef.current = true;
      loadDataFromSupabase();
    }

    // Subscribe to real-time changes in table 'presentes' and 'categorias'
    const channel = supabase
      .channel('realtime-supabase-gifts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'presentes' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newGift = mapRowToGift(payload.new);
            setGifts((prev) => {
              if (prev.some((g) => g.id === newGift.id)) return prev;
              return [newGift, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedGift = mapRowToGift(payload.new);
            setGifts((prev) =>
              prev.map((g) => (g.id === updatedGift.id ? updatedGift : g))
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedId = String(payload.old?.id || '');
            if (deletedId) {
              setGifts((prev) => prev.filter((g) => g.id !== deletedId));
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categorias' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newCat = payload.new.nome || payload.new.name || '';
            if (newCat) {
              setCategories((prev) => (prev.includes(newCat) ? prev : [...prev, newCat]));
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedCat = payload.old?.nome || payload.old?.name || '';
            if (deletedCat) {
              setCategories((prev) => prev.filter((c) => c !== deletedCat));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Save guest preference to localStorage
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
    }, 4500);
  };

  const scrollToGifts = () => {
    if (giftsSectionRef.current) {
      giftsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 5. Reservation Handlers with simultaneous access verification
  const handleOpenReserveModal = (gift: GiftItem) => {
    setSelectedGiftForReserve(gift);
    setIsReserveModalOpen(true);
  };

  const handleConfirmReservation = async (name: string, message?: string) => {
    if (!selectedGiftForReserve) return { success: false };
    const targetGift = selectedGiftForReserve;
    const reservedAt = new Date().toISOString();

    setGuestName(name);

    // Call Supabase with concurrency check
    const result = await updateGiftReservationInSupabase(
      targetGift.id,
      true,
      name,
      reservedAt,
      message
    );

    if (result.alreadyReserved || !result.success) {
      // The gift was already reserved by another user concurrently
      const warningText = result.errorMessage || 'Ops! Este presente acabou de ser reservado por outra pessoa.';
      
      // Update local item state to show as reserved
      setGifts((prevGifts) =>
        prevGifts.map((g) => {
          if (g.id === targetGift.id) {
            return {
              ...g,
              isReserved: true,
              reservedBy: result.reservedBy || 'Outro Convidado',
            };
          }
          return g;
        })
      );

      showToast(warningText, 'info');
      return { success: false, error: warningText };
    }

    // Reservation succeeded
    setGifts((prevGifts) =>
      prevGifts.map((g) => {
        if (g.id === targetGift.id) {
          return {
            ...g,
            isReserved: true,
            reservedBy: name,
            reservedAt: reservedAt,
            reservationMessage: message,
          };
        }
        return g;
      })
    );

    // Add to my reserved items
    setMyReservedGiftIds((prev) => new Set([...prev, targetGift.id]));

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

    showToast(`O presente "${targetGift.name}" foi reservado com sucesso!`, 'success');
    return { success: true };
  };

  const handleCancelReservation = async (giftId: string) => {
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

    // Async Supabase update on table 'presentes'
    await updateGiftReservationInSupabase(giftId, false);
  };

  // 6. Admin Authentication & Actions (Server-side validation)
  const handleAdminAuthenticate = async (pass: string): Promise<boolean> => {
    if (!pass || !pass.trim()) return false;
    try {
      const res = await fetch('/api/admin/verify-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        setIsAdminAuthenticated(true);
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Falha de rede ao verificar senha admin:', err);
      return false;
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
  };

  const handleAddGift = async (newGiftData: Omit<GiftItem, 'id' | 'isReserved'>) => {
    const newId = `gift-custom-${Date.now()}`;
    const newGift: GiftItem = {
      ...newGiftData,
      id: newId,
      isReserved: false,
    };
    setGifts((prev) => [newGift, ...prev]);
    showToast(`"${newGift.name}" foi adicionado com sucesso!`);

    // Async Supabase insert into 'presentes'
    await addGiftToSupabase(newGift);
  };

  const handleDeleteGift = async (giftId: string) => {
    // 1. Direct DELETE on Supabase table 'presentes'
    const { error } = await supabase
      .from('presentes')
      .delete()
      .eq('id', giftId);

    if (error) {
      console.error('Erro ao excluir presente do Supabase:', error);
      showToast('Não foi possível excluir o presente no Supabase. Tente novamente.', 'info');
      return;
    }

    // 2. Update screen state ONLY after confirmation
    setGifts((prev) => prev.filter((g) => g.id !== giftId));
    setMyReservedGiftIds((prev) => {
      const next = new Set(prev);
      next.delete(giftId);
      return next;
    });
    showToast('Presente excluído com sucesso do Supabase.', 'info');
  };

  const handleToggleReserveGift = async (giftId: string) => {
    const targetGift = gifts.find((g) => g.id === giftId);
    if (!targetGift) return;
    const isNowReserved = !targetGift.isReserved;

    setGifts((prev) =>
      prev.map((g) => {
        if (g.id === giftId) {
          return {
            ...g,
            isReserved: isNowReserved,
            reservedBy: isNowReserved ? 'Anfitrião' : undefined,
          };
        }
        return g;
      })
    );

    // Async Supabase update on 'presentes'
    await updateGiftReservationInSupabase(
      giftId,
      isNowReserved,
      isNowReserved ? 'Anfitrião' : undefined
    );
  };

  const handleAddCategory = async (categoryName: string) => {
    setCategories((prev) => [...prev, categoryName]);
    showToast(`Categoria "${categoryName}" criada com sucesso!`);

    // Async Supabase insert into 'categorias'
    await addCategoryToSupabase(categoryName);
  };

  const handleDeleteCategory = async (categoryName: string) => {
    setCategories((prev) => prev.filter((c) => c !== categoryName));
    if (activeCategory === categoryName) {
      setActiveCategory('Todas');
    }
    showToast(`Categoria "${categoryName}" removida.`, 'info');

    // Async Supabase delete from 'categorias'
    await deleteCategoryFromSupabase(categoryName);
  };

  const handleUpdateHouseInfo = async (info: HouseInfo) => {
    setHouseInfo(info);
    await saveHouseInfoToSupabase(info);
  };

  const handleManualSyncSupabase = async () => {
    const res = await syncAllToSupabase(gifts, categories, houseInfo);
    showToast(res.message, res.success ? 'success' : 'info');
  };

  const handleUpdateTexture = async (type: 'bambu' | 'inox', newImageUrl: string) => {
    const updated: TexturesConfig = {
      ...texturesConfig,
      [type === 'bambu' ? 'bambuImage' : 'inoxImage']: newImageUrl,
    };
    setTexturesConfig(updated);
    await saveTexturesToSupabase(updated);
  };

  const handleRemoveTexture = async (type: 'bambu' | 'inox') => {
    const updated: TexturesConfig = {
      ...texturesConfig,
      [type === 'bambu' ? 'bambuImage' : 'inoxImage']: '',
    };
    setTexturesConfig(updated);
    await saveTexturesToSupabase(updated);
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

  // Progressive image and card loading strategy: render initial 12 items, expand seamlessly on scroll
  const INITIAL_BATCH_SIZE = 12;
  const BATCH_INCREMENT = 12;
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_BATCH_SIZE);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);

  // Reset visible items count when filters or search change so top results are immediate
  useEffect(() => {
    setVisibleCount(INITIAL_BATCH_SIZE);
  }, [activeCategory, statusFilter, searchQuery]);

  // Seamlessly load more items into the DOM when the user scrolls near the end of the current batch
  useEffect(() => {
    const sentinel = loadMoreSentinelRef.current;
    if (!sentinel) return;

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setVisibleCount(filteredGifts.length);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => {
            if (prev < filteredGifts.length) {
              return Math.min(prev + BATCH_INCREMENT, filteredGifts.length);
            }
            return prev;
          });
        }
      },
      { rootMargin: '450px 0px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredGifts.length, visibleCount]);

  const displayedGifts = useMemo(() => {
    return filteredGifts.slice(0, visibleCount);
  }, [filteredGifts, visibleCount]);

  if (isMigrationPage) {
    return (
      <MigrateImagesPage
        onBackToHome={() => {
          if (window.location.pathname.includes('migrar-imagens')) {
            window.history.pushState({}, '', '/');
          } else {
            window.location.hash = '';
          }
          setIsMigrationPage(false);
        }}
      />
    );
  }

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

              {/* Gifts Loading / Error / Empty / Content */}
              {isLoadingGifts ? (
                <div className="space-y-6">
                  {/* Dedicated Loading Spinner Box */}
                  <div className="py-12 px-6 text-center bg-white border border-[#BDC3C7] shadow-xs flex flex-col items-center justify-center space-y-3">
                    <div className="w-12 h-12 rounded-full border-2 border-[#D2B48C] border-t-transparent animate-spin flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-[#1A1A1A] animate-spin" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-serif italic text-xl sm:text-2xl text-[#1A1A1A] font-semibold">
                        Carregando presentes...
                      </h3>
                      <p className="text-xs text-[#7F8C8D]">
                        Buscando a lista atualizada no banco de dados.
                      </p>
                    </div>
                  </div>

                  {/* Skeleton placeholder grid */}
                  <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6 opacity-60">
                    {[1, 2, 3, 4, 5, 6].map((idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-[#BDC3C7] p-2.5 sm:p-5 space-y-2.5 sm:space-y-4 animate-pulse shadow-xs"
                      >
                        <div className="w-full aspect-4/3 bg-[#FAF9F6] border border-[#BDC3C7]/40" />
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="w-12 sm:w-20 h-2.5 sm:h-3 bg-[#EAECEE]" />
                          <div className="w-3/4 h-3.5 sm:h-5 bg-[#EAECEE]" />
                          <div className="w-full h-2.5 sm:h-3 bg-[#FAF9F6]" />
                        </div>
                        <div className="w-full h-8 sm:h-10 bg-[#FAF9F6] border border-[#BDC3C7]" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : loadError ? (
                /* Error state with retry button */
                <div className="py-14 px-6 text-center bg-white border border-[#E74C3C]/40 p-8 shadow-xs space-y-4 max-w-lg mx-auto">
                  <div className="w-14 h-14 bg-[#FDEDEC] border border-[#E74C3C] text-[#C0392B] mx-auto flex items-center justify-center">
                    <AlertCircle className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif italic text-2xl text-[#1A1A1A]">
                      Não foi possível carregar os presentes
                    </h3>
                    <p className="text-xs text-[#555] leading-relaxed">
                      {loadError}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => loadDataFromSupabase(true)}
                    className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#34495E] transition-all shadow-xs cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Tentar Novamente</span>
                  </button>
                </div>
              ) : gifts.length === 0 ? (
                /* Truly empty list from Supabase (0 items total) */
                <div className="py-16 text-center bg-white border border-[#BDC3C7] p-8 shadow-xs space-y-4 max-w-md mx-auto">
                  <div className="w-14 h-14 bg-[#FAF9F6] border border-[#BDC3C7] text-[#34495E] mx-auto flex items-center justify-center">
                    <Gift className="w-7 h-7 text-[#D2B48C]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif italic text-2xl text-[#1A1A1A]">
                      Nenhum presente disponível no momento
                    </h3>
                    <p className="text-xs text-[#555] leading-relaxed">
                      A lista de presentes ainda não possui itens cadastrados ou está sendo atualizada pelos noivos.
                    </p>
                  </div>
                </div>
              ) : filteredGifts.length === 0 ? (
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
                    className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#34495E] transition-all shadow-xs cursor-pointer"
                  >
                    <span>Limpar Filtros e Ver Todos</span>
                  </button>
                </div>
              ) : (
                /* Gifts Cards Responsive Grid (2 columns on mobile and tablet, 3 on xl) */
                <>
                  <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
                    {displayedGifts.map((gift, index) => (
                      <GiftCard
                        key={gift.id}
                        gift={gift}
                        priority={index < 6}
                        isMyReservation={myReservedGiftIds.has(gift.id)}
                        onReserve={handleOpenReserveModal}
                        onCancelReservation={handleCancelReservation}
                      />
                    ))}
                  </div>

                  {/* Progressive loading sentinel for auto-loading next batch smoothly */}
                  {visibleCount < filteredGifts.length && (
                    <div ref={loadMoreSentinelRef} className="h-2 w-full mt-4" aria-hidden="true" />
                  )}
                </>
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
        onUpdateHouseInfo={handleUpdateHouseInfo}
        onUpdateTexture={handleUpdateTexture}
        onRemoveTexture={handleRemoveTexture}
        onSyncSupabase={handleManualSyncSupabase}
        isSupabaseConnected={isSupabaseConnected}
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
