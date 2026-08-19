import React, { useState, useEffect, useRef } from 'react';
import { GiftItem, HouseInfo, TexturesConfig } from '../types';
import { 
  ShieldCheck, 
  Lock, 
  X, 
  Plus, 
  Trash2, 
  Check, 
  Upload, 
  Layers, 
  Gift, 
  Palette,
  Settings, 
  Copy, 
  AlertCircle,
  Unlock,
  Eye,
  EyeOff,
  RotateCcw,
  Link as LinkIcon,
  Database,
  RefreshCw,
  User,
  Heart
} from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  onAuthenticate: (password: string) => boolean;
  onLogout: () => void;
  gifts: GiftItem[];
  categories: string[];
  houseInfo: HouseInfo;
  texturesConfig: TexturesConfig;
  onAddGift: (gift: Omit<GiftItem, 'id' | 'isReserved'>) => void;
  onDeleteGift: (giftId: string) => void;
  onToggleReserveGift: (giftId: string) => void;
  onAddCategory: (categoryName: string) => void;
  onDeleteCategory: (categoryName: string) => void;
  onUpdateHouseInfo: (info: HouseInfo) => void;
  onUpdateTexture: (type: 'bambu' | 'inox', newImageUrl: string) => void;
  onRemoveTexture: (type: 'bambu' | 'inox') => void;
  onSyncSupabase?: () => Promise<void> | void;
  isSupabaseConnected?: boolean | null;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  isAuthenticated,
  onAuthenticate,
  onLogout,
  gifts,
  categories,
  houseInfo,
  texturesConfig,
  onAddGift,
  onDeleteGift,
  onToggleReserveGift,
  onAddCategory,
  onDeleteCategory,
  onUpdateHouseInfo,
  onUpdateTexture,
  onRemoveTexture,
  onSyncSupabase,
  isSupabaseConnected,
}) => {
  // Password state
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<'add_gift' | 'categories' | 'manage_gifts' | 'textures' | 'settings'>('add_gift');

  // Add Gift Form state
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState(categories[0] || 'Cozinha');
  const [newDescription, setNewDescription] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [giftFormSuccess, setGiftFormSuccess] = useState('');
  const [giftFormError, setGiftFormError] = useState('');
  const giftFileInputRef = useRef<HTMLInputElement>(null);

  // Category Form state
  const [newCatInput, setNewCatInput] = useState('');
  const [catError, setCatError] = useState('');

  // Textures upload state
  const [targetTextureType, setTargetTextureType] = useState<'bambu' | 'inox' | null>(null);
  const [bambuUrlInput, setBambuUrlInput] = useState(texturesConfig?.bambuImage || '');
  const [inoxUrlInput, setInoxUrlInput] = useState(texturesConfig?.inoxImage || '');
  const [textureSuccess, setTextureSuccess] = useState('');
  const [textureError, setTextureError] = useState('');
  const textureFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBambuUrlInput(texturesConfig?.bambuImage || '');
    setInoxUrlInput(texturesConfig?.inoxImage || '');
  }, [texturesConfig]);

  // Host summary copy state
  const [copiedSummary, setCopiedSummary] = useState(false);

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

  useEffect(() => {
    if (categories.length > 0 && !categories.includes(newCategory)) {
      setNewCategory(categories[0]);
    }
  }, [categories, newCategory]);

  if (!isOpen) return null;

  // Handle password submission
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAuthenticate(passwordInput)) {
      setPasswordError('');
      setPasswordInput('');
    } else {
      setPasswordError('Senha incorreta. Por favor, tente novamente.');
    }
  };

  // Multiple image upload handler for Add Gift
  const handleGiftImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const readers: Promise<string>[] = Array.from(files).map((file: File) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((results) => {
      setUploadedImages((prev) => [...prev, ...results]);
    });
  };

  const handleRemoveUploadedImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Submit Add Gift
  const handleAddGiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setGiftFormError('Por favor, informe o nome do presente.');
      return;
    }

    const primaryImage = uploadedImages.length > 0 
      ? uploadedImages[0] 
      : 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80';

    onAddGift({
      name: newName.trim(),
      category: newCategory,
      image: primaryImage,
      images: uploadedImages.length > 0 ? uploadedImages : undefined,
      description: newDescription.trim() || undefined,
      isCustomAdded: true,
    });

    // Reset Form
    setNewName('');
    setNewDescription('');
    setUploadedImages([]);
    setGiftFormError('');
    setGiftFormSuccess('Presente adicionado com sucesso à lista!');
    setTimeout(() => setGiftFormSuccess(''), 3000);
  };

  // Add Category
  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCat = newCatInput.trim();
    if (!cleanCat) {
      setCatError('Digite o nome da nova categoria.');
      return;
    }
    if (categories.some((c) => c.toLowerCase() === cleanCat.toLowerCase())) {
      setCatError('Esta categoria já existe.');
      return;
    }

    onAddCategory(cleanCat);
    setNewCatInput('');
    setCatError('');
  };

  // Texture Upload Handler
  const triggerTextureUpload = (type: 'bambu' | 'inox') => {
    setTargetTextureType(type);
    setTextureError('');
    setTextureSuccess('');
    if (textureFileInputRef.current) {
      textureFileInputRef.current.value = '';
      textureFileInputRef.current.click();
    }
  };

  const handleTextureFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && targetTextureType) {
      if (!file.type.startsWith('image/')) {
        setTextureError('Por favor selecione um arquivo de imagem válido (.jpg, .jpeg, .png, .webp).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          onUpdateTexture(targetTextureType, result);
          if (targetTextureType === 'bambu') setBambuUrlInput(result);
          if (targetTextureType === 'inox') setInoxUrlInput(result);
          setTextureSuccess(`Textura de ${targetTextureType === 'bambu' ? 'Bambu' : 'Inox'} convertida para Base64 e salva com sucesso!`);
          setTimeout(() => setTextureSuccess(''), 3500);
        }
      };
      reader.onerror = () => {
        setTextureError('Erro ao converter o arquivo de imagem para Data URL.');
      };
      reader.readAsDataURL(file);
    }
    setTargetTextureType(null);
  };

  const handleApplyUrl = (type: 'bambu' | 'inox') => {
    const url = type === 'bambu' ? bambuUrlInput.trim() : inoxUrlInput.trim();
    if (!url) {
      setTextureError('Por favor insira um link ou URL de imagem válido.');
      return;
    }
    onUpdateTexture(type, url);
    setTextureError('');
    setTextureSuccess(`Link da textura de ${type === 'bambu' ? 'Bambu' : 'Inox'} aplicado com sucesso!`);
    setTimeout(() => setTextureSuccess(''), 3500);
  };

  const handleResetDefaultImage = (type: 'bambu' | 'inox') => {
    const defaultUrl = type === 'bambu' 
      ? './9741231-textura-de-madeira-de-bambu-natural-gratis-foto.jpg' 
      : './inox.jpg';
    onUpdateTexture(type, defaultUrl);
    if (type === 'bambu') setBambuUrlInput(defaultUrl);
    if (type === 'inox') setInoxUrlInput(defaultUrl);
    setTextureError('');
    setTextureSuccess(`Textura de ${type === 'bambu' ? 'Bambu' : 'Inox'} restaurada para a imagem padrão!`);
    setTimeout(() => setTextureSuccess(''), 3500);
  };

  // Copy Full Host Reservations List
  const handleCopyHostReservations = () => {
    const reservedList = gifts.filter((g) => g.isReserved);
    if (reservedList.length === 0) return;

    const listText = reservedList
      .map((g, idx) => `${idx + 1}. ${g.name} (${g.category}) - Reservado por: ${g.reservedBy || 'Convidado'}`)
      .join('\n');

    const text = `📋 LISTA DE PRESENTES RESERVADOS - ${houseInfo.coupleNames}\n\n` +
      `Total de Itens Reservados: ${reservedList.length} de ${gifts.length}\n\n` +
      listText;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 3000);
    });
  };

  return (
    <div 
      id="modal-admin-overlay"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Hidden file input for texture uploads */}
      <input
        type="file"
        ref={textureFileInputRef}
        onChange={handleTextureFileChange}
        accept=".jpg,.jpeg,.png,.webp,.svg,image/jpeg,image/png,image/webp,image/svg+xml,image/*"
        className="hidden"
      />

      <div 
        id="modal-admin-content"
        className="bg-white border-t-4 border-[#1A1A1A] border-x border-b border-[#BDC3C7] max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-[#FAF9F6] border-b border-[#BDC3C7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1A1A1A] text-[#D2B48C] flex items-center justify-center border border-[#BDC3C7]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#34495E] block">
                Área Restrita dos Noivos
              </span>
              <h3 className="font-serif italic text-lg sm:text-xl text-[#1A1A1A] font-semibold">
                Painel Administrativo
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={onLogout}
                className="px-3 py-1.5 text-xs text-[#555] hover:text-[#C0392B] border border-[#BDC3C7] hover:bg-white font-semibold uppercase tracking-wider transition-colors"
                title="Sair do painel"
              >
                Sair
              </button>
            )}
            <button
              id="btn-close-admin-modal"
              type="button"
              onClick={onClose}
              className="w-9 h-9 border border-[#BDC3C7] bg-white text-[#1A1A1A] flex items-center justify-center hover:bg-[#1A1A1A] hover:text-white transition-colors"
              title="Fechar (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 1. PASSWORD GATE (if not authenticated) */}
        {!isAuthenticated ? (
          <div className="p-6 sm:p-10 flex flex-col items-center justify-center text-center space-y-5 my-auto">
            <div className="w-16 h-16 bg-[#FAF9F6] border border-[#BDC3C7] text-[#1A1A1A] flex items-center justify-center shadow-xs">
              <Lock className="w-8 h-8 text-[#34495E]" />
            </div>

            <div className="space-y-1 max-w-sm">
              <h4 className="font-serif italic text-2xl text-[#1A1A1A]">
                Acesso Protegido por Senha
              </h4>
              <p className="text-xs text-[#555]">
                Digite a senha de 6 dígitos dos anfitriões para gerenciar presentes, categorias, fotos de textura e dados do evento.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="w-full max-w-xs space-y-4">
              <div className="relative">
                <input
                  id="input-admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  placeholder="Digite a senha..."
                  className="w-full pl-4 pr-10 py-3 bg-[#FAF9F6] border border-[#BDC3C7] focus:border-[#1A1A1A] focus:bg-white text-center text-base tracking-widest font-mono text-[#1A1A1A] focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7F8C8D] hover:text-[#1A1A1A]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {passwordError && (
                <div className="p-2.5 bg-[#FDEDEC] border border-[#C0392B]/40 text-[#C0392B] text-xs flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <button
                id="btn-submit-admin-password"
                type="submit"
                className="w-full py-3 bg-[#1A1A1A] hover:bg-[#34495E] text-white text-xs font-bold uppercase tracking-widest transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4 text-[#D2B48C]" />
                <span>Entrar no Painel</span>
              </button>
            </form>
          </div>
        ) : (
          /* 2. AUTHENTICATED ADMIN DASHBOARD */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Tabs Navigation */}
            <div className="flex items-center gap-1 border-b border-[#BDC3C7] bg-[#FAF9F6] px-4 sm:px-6 overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab('add_gift')}
                className={`py-3 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  activeTab === 'add_gift'
                    ? 'border-[#1A1A1A] text-[#1A1A1A] bg-white'
                    : 'border-transparent text-[#555] hover:text-[#1A1A1A]'
                }`}
              >
                <Plus className="w-4 h-4 text-[#D2B48C]" />
                <span>Adicionar Presente</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('categories')}
                className={`py-3 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  activeTab === 'categories'
                    ? 'border-[#1A1A1A] text-[#1A1A1A] bg-white'
                    : 'border-transparent text-[#555] hover:text-[#1A1A1A]'
                }`}
              >
                <Layers className="w-4 h-4 text-[#34495E]" />
                <span>Categorias</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('manage_gifts')}
                className={`py-3 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  activeTab === 'manage_gifts'
                    ? 'border-[#1A1A1A] text-[#1A1A1A] bg-white'
                    : 'border-transparent text-[#555] hover:text-[#1A1A1A]'
                }`}
              >
                <Gift className="w-4 h-4 text-[#34495E]" />
                <span>Presentes ({gifts.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('textures')}
                className={`py-3 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  activeTab === 'textures'
                    ? 'border-[#1A1A1A] text-[#1A1A1A] bg-white'
                    : 'border-transparent text-[#555] hover:text-[#1A1A1A]'
                }`}
              >
                <Palette className="w-4 h-4 text-[#D2B48C]" />
                <span>Texturas da Paleta</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`py-3 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  activeTab === 'settings'
                    ? 'border-[#1A1A1A] text-[#1A1A1A] bg-white'
                    : 'border-transparent text-[#555] hover:text-[#1A1A1A]'
                }`}
              >
                <Settings className="w-4 h-4 text-[#34495E]" />
                <span>Dados do Evento</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* TAB 1: ADD GIFT */}
              {activeTab === 'add_gift' && (
                <form onSubmit={handleAddGiftSubmit} className="space-y-4 max-w-xl mx-auto">
                  <div className="space-y-1">
                    <h4 className="font-serif italic text-lg text-[#1A1A1A] font-semibold">
                      Novo Item na Lista de Presentes
                    </h4>
                    <p className="text-xs text-[#555]">
                      Adicione um novo presente com nome, categoria e foto carregada direto do seu dispositivo (.jpg, .jpeg, .png).
                    </p>
                  </div>

                  {giftFormSuccess && (
                    <div className="p-3 bg-[#E8F8F5] border border-[#27AE60] text-[#27AE60] text-xs font-bold flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>{giftFormSuccess}</span>
                    </div>
                  )}

                  {giftFormError && (
                    <div className="p-3 bg-[#FDEDEC] border border-[#C0392B] text-[#C0392B] text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>{giftFormError}</span>
                    </div>
                  )}

                  {/* Nome do Presente */}
                  <div className="space-y-1.5">
                    <label htmlFor="input-new-gift-name" className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                      Nome do Presente <span className="text-[#C0392B]">*</span>
                    </label>
                    <input
                      id="input-new-gift-name"
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Ex: Jogo de Taças de Cristal"
                      className="w-full p-3 bg-[#FAF9F6] border border-[#BDC3C7] focus:border-[#1A1A1A] focus:bg-white text-sm text-[#1A1A1A] focus:outline-none"
                    />
                  </div>

                  {/* Categoria */}
                  <div className="space-y-1.5">
                    <label htmlFor="select-new-gift-category" className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                      Categoria do Presente <span className="text-[#C0392B]">*</span>
                    </label>
                    <select
                      id="select-new-gift-category"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full p-3 bg-[#FAF9F6] border border-[#BDC3C7] focus:border-[#1A1A1A] focus:bg-white text-sm text-[#1A1A1A] focus:outline-none"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Descrição Opcional */}
                  <div className="space-y-1.5">
                    <label htmlFor="input-new-gift-desc" className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                      Descrição / Observação (Opcional)
                    </label>
                    <input
                      id="input-new-gift-desc"
                      type="text"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="Ex: Cor neutra, acabamento madeira/inox"
                      className="w-full p-3 bg-[#FAF9F6] border border-[#BDC3C7] focus:border-[#1A1A1A] focus:bg-white text-sm text-[#1A1A1A] focus:outline-none"
                    />
                  </div>

                  {/* Upload de Imagem (Permite selecionar foto: .jpeg, .jpg, .png, .webp, .svg) */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                      Fotos do Presente (.jpg, .jpeg, .png, .webp, .svg)
                    </label>
                    
                    <input
                      type="file"
                      ref={giftFileInputRef}
                      onChange={handleGiftImageUpload}
                      multiple
                      accept=".jpg,.jpeg,.png,.webp,.svg,image/jpeg,image/png,image/webp,image/svg+xml,image/*"
                      className="hidden"
                    />

                    <div 
                      onClick={() => giftFileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#BDC3C7] hover:border-[#1A1A1A] p-6 bg-[#FAF9F6] text-center cursor-pointer transition-colors"
                    >
                      <Upload className="w-8 h-8 text-[#34495E] mx-auto mb-2" />
                      <p className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                        Clique para escolher foto(s) do seu computador
                      </p>
                      <p className="text-[11px] text-[#7F8C8D] mt-1">
                        Formatos aceitos: JPG, JPEG, PNG, WEBP e SVG (Você pode selecionar mais de uma foto)
                      </p>
                    </div>

                    {/* Image Previews */}
                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                        {uploadedImages.map((imgUrl, idx) => (
                          <div key={idx} className="relative aspect-square border border-[#BDC3C7] bg-white group overflow-hidden">
                            <img src={imgUrl} alt={`Prévia ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveUploadedImage(idx)}
                              className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-xs text-xs opacity-90 hover:opacity-100"
                              title="Remover foto"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            {idx === 0 && (
                              <span className="absolute bottom-1 left-1 px-1 bg-[#1A1A1A]/80 text-white text-[9px] font-bold">
                                Principal
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    id="btn-submit-new-gift"
                    type="submit"
                    className="w-full py-3.5 bg-[#1A1A1A] hover:bg-[#34495E] text-white text-xs font-bold uppercase tracking-widest transition-all shadow-xs flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4 text-[#D2B48C]" />
                    <span>Salvar Presente na Lista</span>
                  </button>
                </form>
              )}

              {/* TAB 2: CATEGORIES MANAGER */}
              {activeTab === 'categories' && (
                <div className="space-y-6 max-w-xl mx-auto">
                  <div className="space-y-1">
                    <h4 className="font-serif italic text-lg text-[#1A1A1A] font-semibold">
                      Gerenciar Categorias
                    </h4>
                    <p className="text-xs text-[#555]">
                      Crie novas categorias para organizar os presentes ou exclua as que não for utilizar.
                    </p>
                  </div>

                  {/* Add Category Input */}
                  <form onSubmit={handleAddCategorySubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={newCatInput}
                      onChange={(e) => {
                        setNewCatInput(e.target.value);
                        if (catError) setCatError('');
                      }}
                      placeholder="Nome da nova categoria (Ex: Varanda, Mesa Posta)"
                      className="flex-1 p-3 bg-[#FAF9F6] border border-[#BDC3C7] focus:border-[#1A1A1A] focus:bg-white text-sm text-[#1A1A1A] focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-5 py-3 bg-[#1A1A1A] hover:bg-[#34495E] text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <Plus className="w-4 h-4 text-[#D2B48C]" />
                      <span>Adicionar</span>
                    </button>
                  </form>

                  {catError && (
                    <p className="text-xs text-[#C0392B] font-semibold">{catError}</p>
                  )}

                  {/* Categories List */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#34495E] block">
                      Categorias Ativas ({categories.length})
                    </span>

                    <div className="divide-y divide-[#BDC3C7] border border-[#BDC3C7]">
                      {categories.map((cat) => {
                        const giftsCount = gifts.filter((g) => g.category === cat).length;
                        return (
                          <div key={cat} className="p-3 bg-white flex items-center justify-between gap-3">
                            <div>
                              <strong className="text-sm text-[#1A1A1A] font-semibold block">{cat}</strong>
                              <span className="text-[11px] text-[#7F8C8D]">
                                {giftsCount} {giftsCount === 1 ? 'presente vinculado' : 'presentes vinculados'}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => onDeleteCategory(cat)}
                              className="p-2 text-[#7F8C8D] hover:text-[#C0392B] hover:bg-[#FDEDEC] transition-colors"
                              title="Excluir categoria"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: MANAGE GIFTS */}
              {activeTab === 'manage_gifts' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#BDC3C7]">
                    <div>
                      <h4 className="font-serif italic text-lg text-[#1A1A1A] font-semibold">
                        Lista Geral de Presentes ({gifts.length})
                      </h4>
                      <p className="text-xs text-[#555]">
                        Acompanhe quais presentes já foram reservados e por quem.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyHostReservations}
                      className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
                        copiedSummary ? 'bg-[#27AE60] text-white' : 'bg-[#1A1A1A] hover:bg-[#34495E] text-white'
                      }`}
                    >
                      {copiedSummary ? (
                        <>
                          <Check className="w-4 h-4 text-[#D2B48C]" />
                          <span>Lista Copiada!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-[#D2B48C]" />
                          <span>Copiar Todas as Reservas</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                    {gifts.map((gift) => (
                      <div
                        key={gift.id}
                        className={`p-3 border flex items-center justify-between gap-3 ${
                          gift.isReserved ? 'bg-[#FAF9F6] border-[#34495E]' : 'bg-white border-[#BDC3C7]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={gift.image}
                            alt={gift.name}
                            className="w-12 h-12 object-cover border border-[#BDC3C7] shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="text-[10px] uppercase font-bold text-[#34495E] block">
                              {gift.category}
                            </span>
                            <h5 className="font-serif italic text-sm text-[#1A1A1A] font-semibold truncate">
                              {gift.name}
                            </h5>
                            {gift.isReserved ? (
                              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#E8F8F5] border border-[#27AE60] text-[#1A1A1A] text-xs font-medium shadow-2xs">
                                  <User className="w-3.5 h-3.5 text-[#27AE60] shrink-0" />
                                  <span>
                                    Reservado por: <strong className="text-[#1A1A1A] font-bold">{gift.reservedBy || 'Convidado'}</strong>
                                  </span>
                                </span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#7F8C8D] inline-flex items-center gap-1 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#27AE60]"></span>
                                Disponível
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => onToggleReserveGift(gift.id)}
                            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-colors ${
                              gift.isReserved
                                ? 'border-[#BDC3C7] bg-white text-[#1A1A1A] hover:bg-[#FAF9F6]'
                                : 'border-[#27AE60] bg-[#E8F8F5] text-[#27AE60] hover:bg-[#27AE60] hover:text-white'
                            }`}
                          >
                            {gift.isReserved ? 'Liberar Item' : 'Marcar Reservado'}
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteGift(gift.id)}
                            className="p-2 text-[#7F8C8D] hover:text-[#C0392B] hover:bg-[#FDEDEC] transition-colors"
                            title="Excluir presente"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: PALETTE TEXTURES (Bambu & Inox Upload / URL) */}
              {activeTab === 'textures' && (
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div className="space-y-1">
                    <h4 className="font-serif italic text-lg text-[#1A1A1A] font-semibold">
                      Texturas da Paleta de Cores (Bambu & Inox)
                    </h4>
                    <p className="text-xs text-[#555]">
                      Personalize as texturas de <strong>Bambu</strong> e <strong>Inox</strong> fazendo o upload de uma imagem do seu dispositivo (convertida para Base64) ou inserindo uma URL pública (.jpg, .jpeg, .png, .webp, .svg).
                    </p>
                  </div>

                  {textureSuccess && (
                    <div className="p-3 bg-[#E8F8F5] border border-[#27AE60] text-[#27AE60] text-xs font-bold flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{textureSuccess}</span>
                    </div>
                  )}

                  {textureError && (
                    <div className="p-3 bg-[#FDEDEC] border border-[#C0392B] text-[#C0392B] text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{textureError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Texture Card 1: Bambu */}
                    <div className="p-4 bg-[#FAF9F6] border border-[#BDC3C7] flex flex-col items-center space-y-4">
                      {/* Swatch Preview with direct background style */}
                      <div 
                        className="w-20 h-20 rounded-full border-4 border-[#C5A059] shadow-md relative overflow-hidden flex items-center justify-center transition-transform hover:scale-105"
                        style={{
                          backgroundColor: '#D2B48C',
                          backgroundImage: texturesConfig?.bambuImage ? `url("${texturesConfig.bambuImage}")` : undefined,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                        }}
                      >
                        {texturesConfig?.bambuImage ? (
                          <img
                            src={texturesConfig.bambuImage}
                            alt="Textura Bambu"
                            className="w-full h-full object-cover rounded-full pointer-events-none"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-[10px] text-[#7F8C8D] font-bold uppercase tracking-wider">
                            Cor Padrão
                          </span>
                        )}
                      </div>
                      
                      <div className="text-center">
                        <strong className="text-sm text-[#1A1A1A] block font-semibold">
                          Bambu
                        </strong>
                        <span className="text-[11px] text-[#555]">
                          {texturesConfig?.bambuImage?.startsWith('data:') 
                            ? 'Foto personalizada (Base64 local)' 
                            : texturesConfig?.bambuImage 
                            ? 'Imagem ativa' 
                            : 'Utilizando cor neutra padrão'}
                        </span>
                      </div>

                      {/* Action 1: Upload File */}
                      <div className="w-full space-y-2">
                        <button
                          type="button"
                          onClick={() => triggerTextureUpload('bambu')}
                          className="w-full py-2.5 bg-white hover:bg-[#1A1A1A] hover:text-white border border-[#BDC3C7] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#D2B48C]" />
                          <span>Carregar Foto do Aparelho</span>
                        </button>
                      </div>

                      {/* Action 2: Link / URL Input */}
                      <div className="w-full space-y-1.5 pt-2 border-t border-[#BDC3C7]/60">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-[#34495E] flex items-center gap-1">
                          <LinkIcon className="w-3 h-3" />
                          <span>Ou colar Link / URL da imagem:</span>
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={bambuUrlInput}
                            onChange={(e) => setBambuUrlInput(e.target.value)}
                            placeholder="https://... ou ./bambu.jpg"
                            className="flex-1 px-2.5 py-1.5 border border-[#BDC3C7] text-xs focus:border-[#1A1A1A] focus:outline-hidden bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleApplyUrl('bambu')}
                            className="px-3 py-1.5 bg-[#34495E] hover:bg-[#1A1A1A] text-white text-xs font-bold uppercase transition-colors shrink-0 cursor-pointer"
                          >
                            Aplicar
                          </button>
                        </div>
                      </div>

                      {/* Action 3: Reset options */}
                      <div className="w-full pt-2 border-t border-[#BDC3C7]/60 flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => handleResetDefaultImage('bambu')}
                          className="w-full py-1 text-[11px] text-[#34495E] hover:bg-[#EAECEE] border border-transparent font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Restaurar Imagem Padrão</span>
                        </button>

                        {texturesConfig?.bambuImage && (
                          <button
                            type="button"
                            onClick={() => {
                              onRemoveTexture('bambu');
                              setBambuUrlInput('');
                              setTextureSuccess('Textura de Bambu configurada para a cor sólida padrão!');
                              setTimeout(() => setTextureSuccess(''), 3000);
                            }}
                            className="w-full py-1 text-[11px] text-[#C0392B] hover:bg-[#FDEDEC] border border-transparent font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remover Foto (Usar apenas cor)</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Texture Card 2: Inox */}
                    <div className="p-4 bg-[#FAF9F6] border border-[#BDC3C7] flex flex-col items-center space-y-4">
                      {/* Swatch Preview with direct background style */}
                      <div 
                        className="w-20 h-20 rounded-full border-4 border-[#95A5A6] shadow-md relative overflow-hidden flex items-center justify-center transition-transform hover:scale-105"
                        style={{
                          backgroundColor: '#BDC3C7',
                          backgroundImage: texturesConfig?.inoxImage ? `url("${texturesConfig.inoxImage}")` : undefined,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                        }}
                      >
                        {texturesConfig?.inoxImage ? (
                          <img
                            src={texturesConfig.inoxImage}
                            alt="Textura Inox"
                            className="w-full h-full object-cover rounded-full pointer-events-none"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-[10px] text-[#7F8C8D] font-bold uppercase tracking-wider">
                            Cor Padrão
                          </span>
                        )}
                      </div>
                      
                      <div className="text-center">
                        <strong className="text-sm text-[#1A1A1A] block font-semibold">
                          Inox
                        </strong>
                        <span className="text-[11px] text-[#555]">
                          {texturesConfig?.inoxImage?.startsWith('data:') 
                            ? 'Foto personalizada (Base64 local)' 
                            : texturesConfig?.inoxImage 
                            ? 'Imagem ativa' 
                            : 'Utilizando cor neutra padrão'}
                        </span>
                      </div>

                      {/* Action 1: Upload File */}
                      <div className="w-full space-y-2">
                        <button
                          type="button"
                          onClick={() => triggerTextureUpload('inox')}
                          className="w-full py-2.5 bg-white hover:bg-[#1A1A1A] hover:text-white border border-[#BDC3C7] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#95A5A6]" />
                          <span>Carregar Foto do Aparelho</span>
                        </button>
                      </div>

                      {/* Action 2: Link / URL Input */}
                      <div className="w-full space-y-1.5 pt-2 border-t border-[#BDC3C7]/60">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-[#34495E] flex items-center gap-1">
                          <LinkIcon className="w-3 h-3" />
                          <span>Ou colar Link / URL da imagem:</span>
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={inoxUrlInput}
                            onChange={(e) => setInoxUrlInput(e.target.value)}
                            placeholder="https://... ou ./inox.jpg"
                            className="flex-1 px-2.5 py-1.5 border border-[#BDC3C7] text-xs focus:border-[#1A1A1A] focus:outline-hidden bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleApplyUrl('inox')}
                            className="px-3 py-1.5 bg-[#34495E] hover:bg-[#1A1A1A] text-white text-xs font-bold uppercase transition-colors shrink-0 cursor-pointer"
                          >
                            Aplicar
                          </button>
                        </div>
                      </div>

                      {/* Action 3: Reset options */}
                      <div className="w-full pt-2 border-t border-[#BDC3C7]/60 flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => handleResetDefaultImage('inox')}
                          className="w-full py-1 text-[11px] text-[#34495E] hover:bg-[#EAECEE] border border-transparent font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Restaurar Imagem Padrão</span>
                        </button>

                        {texturesConfig?.inoxImage && (
                          <button
                            type="button"
                            onClick={() => {
                              onRemoveTexture('inox');
                              setInoxUrlInput('');
                              setTextureSuccess('Textura de Inox configurada para a cor sólida padrão!');
                              setTimeout(() => setTextureSuccess(''), 3000);
                            }}
                            className="w-full py-1 text-[11px] text-[#C0392B] hover:bg-[#FDEDEC] border border-transparent font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remover Foto (Usar apenas cor)</span>
                          </button>
                        )}
                      </div>
                    </div>

                  </div>

                  <div className="bg-white p-3.5 border border-[#BDC3C7] text-xs text-[#555] leading-relaxed">
                    💡 <strong>Como funciona:</strong> Ao fazer o upload de uma imagem do seu aparelho, ela é convertida diretamente para <strong>Data URL (Base64)</strong> e armazenada no <code>localStorage</code> do navegador, sendo aplicada de imediato no estilo de background dos círculos da paleta de cores. Você também pode digitar ou colar qualquer link público de imagem.
                  </div>
                </div>
              )}

              {/* TAB 5: EVENT INFO (FIXED) & SUPABASE DATABASE */}
              {activeTab === 'settings' && (
                <div className="space-y-6 max-w-xl mx-auto">
                  <div className="space-y-1">
                    <h4 className="font-serif italic text-lg text-[#1A1A1A] font-semibold">
                      Informações do Evento (Fixadas)
                    </h4>
                    <p className="text-xs text-[#555]">
                      Os dados principais do Chá de Casa Nova estão fixados diretamente no código da aplicação.
                    </p>
                  </div>

                  {/* Read-only Event Details Card */}
                  <div className="bg-[#FAF9F6] border border-[#BDC3C7] p-4 sm:p-5 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between pb-2 border-b border-[#BDC3C7]/60">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#34495E]">
                        Dados Fixos
                      </span>
                      <span className="px-2 py-0.5 bg-[#E8F8F5] text-[#27AE60] border border-[#27AE60]/40 text-[10px] font-bold uppercase tracking-wider">
                        Fixado no Código
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[#7F8C8D] uppercase tracking-wider text-[10px] font-bold block">
                          Título / Badge:
                        </span>
                        <strong className="text-[#1A1A1A]">CHÁ DE CASA NOVA • Lar doce lar</strong>
                      </div>

                      <div>
                        <span className="text-[#7F8C8D] uppercase tracking-wider text-[10px] font-bold block">
                          Nomes do Casal:
                        </span>
                        <strong className="text-[#1A1A1A]">Gabrielle & Wehington</strong>
                      </div>

                      <div>
                        <span className="text-[#7F8C8D] uppercase tracking-wider text-[10px] font-bold block">
                          Data e Horário:
                        </span>
                        <strong className="text-[#1A1A1A]">Sábado, 17 de Outubro • 16h</strong>
                      </div>

                      <div>
                        <span className="text-[#7F8C8D] uppercase tracking-wider text-[10px] font-bold block">
                          Localização:
                        </span>
                        <strong className="text-[#1A1A1A]">Condomínio Jade • R. Geraldo Pereira de Brito, 75</strong>
                      </div>

                      <div>
                        <span className="text-[#7F8C8D] uppercase tracking-wider text-[10px] font-bold block">
                          Texto de Boas-Vindas:
                        </span>
                        <p className="text-[#555] italic leading-relaxed pt-1">
                          &ldquo;Estamos muito felizes em compartilhar esse momento tão especial com você! Preparamos esta lista com muito carinho para equipar nosso novo lar. Fique à vontade para escolher o item que desejar e comprar onde preferir. Deixamos abaixo a nossa paleta de cores, caso queira segui-la ao escolher o seu presente.&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Supabase Cloud Database Integration Info & Actions */}
                  <div className="pt-4 border-t border-[#BDC3C7] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-[#34495E]" />
                        <h5 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                          Banco de Dados Supabase (Nuvem)
                        </h5>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isSupabaseConnected !== false
                          ? 'bg-[#E8F8F5] text-[#27AE60] border border-[#27AE60]/40'
                          : 'bg-[#FDEDEC] text-[#C0392B] border border-[#C0392B]/40'
                      }`}>
                        {isSupabaseConnected !== false ? '● Conectado' : '○ Offline / Local'}
                      </span>
                    </div>
                    
                    <p className="text-[11px] text-[#555] leading-relaxed">
                      Sua aplicação está configurada para persistir reservas, presentes e categorias diretamente no Supabase (tabela <code>presentes</code> com <code>reserved</code> e <code>reserved_by</code>) com sincronização em tempo real.
                    </p>

                    {onSyncSupabase && (
                      <button
                        type="button"
                        onClick={onSyncSupabase}
                        className="w-full py-2.5 bg-[#FAF9F6] hover:bg-[#34495E] hover:text-white border border-[#BDC3C7] text-[#1A1A1A] text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Sincronizar Lista Atual com Supabase</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
