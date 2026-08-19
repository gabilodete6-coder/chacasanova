import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GiftItem, HouseInfo, TexturesConfig } from '../types';

export const SUPABASE_URL = 'https://flnytwosxztpzkzxjjia.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsbnl0d29zeHp0cHprenhqamlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NzU4NTcsImV4cCI6MjEwMjM1MTg1N30.hzhOkutPLYcQAkMELqJJ6FiG7Ez-REC5Yr5EfYMZITk';

// Initialize Supabase Client (using CDN window.supabase if available, or npm package)
let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!clientInstance) {
    if (typeof window !== 'undefined' && (window as any).supabase?.createClient) {
      clientInstance = (window as any).supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
      clientInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
  }
  return clientInstance;
}

export const supabase = getSupabaseClient();

/**
 * Maps database row to GiftItem format supporting only 'reserved' for reservation status
 */
export function mapRowToGift(row: any): GiftItem {
  const imagesList = Array.isArray(row.imagens)
    ? row.imagens
    : Array.isArray(row.images)
    ? row.images
    : row.imagem || row.image
    ? [row.imagem || row.image]
    : [];

  const isReserved = Boolean(
    row.reserved === true ||
    row.reserved === 'true' ||
    row.reserved === 1 ||
    row.reserved === '1'
  );

  const reservedBy =
    row.reserved_by ||
    row.reservedBy ||
    row.reserved_to ||
    undefined;

  return {
    id: String(row.id ?? ''),
    name: row.nome || row.name || row.titulo || row.title || 'Presente',
    category: row.categoria || row.category || 'Geral',
    image: row.imagem || row.image || row.foto || row.image_url || imagesList[0] || '',
    images: imagesList,
    description: row.descricao || row.description || '',
    isReserved,
    reservedBy: isReserved ? (reservedBy || 'Convidado') : undefined,
    reservedAt: row.reserved_at || row.reservedAt || undefined,
    reservationMessage: row.reservation_message || undefined,
    isCustomAdded: Boolean(row.is_custom_added ?? row.custom ?? false),
  };
}

/**
 * Maps a GiftItem to a database row payload
 */
export function giftToDbPayload(gift: Partial<GiftItem>) {
  const payload: Record<string, any> = {};
  
  if (gift.id !== undefined) payload.id = gift.id;
  if (gift.name !== undefined) {
    payload.nome = gift.name;
    payload.name = gift.name;
  }
  if (gift.category !== undefined) {
    payload.categoria = gift.category;
    payload.category = gift.category;
  }
  if (gift.image !== undefined) {
    payload.imagem = gift.image;
    payload.image = gift.image;
  }
  if (gift.images !== undefined) {
    payload.imagens = gift.images;
    payload.images = gift.images;
  }
  if (gift.description !== undefined) {
    payload.descricao = gift.description;
    payload.description = gift.description;
  }
  if (gift.isReserved !== undefined) {
    payload.reserved = gift.isReserved;
  }
  if (gift.reservedBy !== undefined) {
    payload.reserved_by = gift.reservedBy;
  }
  if (gift.reservedAt !== undefined) {
    payload.reserved_at = gift.reservedAt;
  }
  if (gift.reservationMessage !== undefined) {
    payload.reservation_message = gift.reservationMessage;
  }

  return payload;
}

/**
 * Fetch all gifts from Supabase table 'presentes'
 */
export async function fetchPresentesFromSupabase(): Promise<GiftItem[] | null> {
  try {
    const { data, error } = await supabase
      .from('presentes')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.warn('Aviso ao buscar presentes do Supabase:', error.message);
      return null;
    }

    if (data && Array.isArray(data)) {
      return data.map(mapRowToGift);
    }
    return [];
  } catch (err) {
    console.error('Erro na conexão com Supabase (presentes):', err);
    return null;
  }
}

/**
 * Fetch all categories from Supabase table 'categorias'
 */
export async function fetchCategoriasFromSupabase(): Promise<string[] | null> {
  try {
    const { data, error } = await supabase
      .from('categorias')
      .select('*');

    if (error) {
      console.warn('Aviso ao buscar categorias do Supabase:', error.message);
      return null;
    }

    if (data && Array.isArray(data)) {
      const categories = data
        .map((row: any) => row.nome || row.name || row.categoria || row.title || '')
        .filter((name: string) => Boolean(name.trim()));
      
      return Array.from(new Set(categories));
    }
    return [];
  } catch (err) {
    console.error('Erro na conexão com Supabase (categorias):', err);
    return null;
  }
}

/**
 * Fetch event info from Supabase (e.g. table 'configuracoes' or 'evento' if exists)
 */
export async function fetchHouseInfoFromSupabase(): Promise<HouseInfo | null> {
  try {
    const { data, error } = await supabase
      .from('configuracoes')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      coupleNames: data.couple_names || data.nomes_noivos || data.coupleNames || '',
      eventDate: data.event_date || data.data_evento || data.eventDate || '',
      location: data.location || data.local || data.localizacao || '',
      welcomeMessage: data.welcome_message || data.mensagem_boas_vindas || data.welcomeMessage || '',
    };
  } catch {
    return null;
  }
}

export interface ReservationResult {
  success: boolean;
  alreadyReserved?: boolean;
  reservedBy?: string;
  errorMessage?: string;
}

/**
 * Reserve or unreserve a gift in Supabase table 'presentes'.
 * When isReserved is true (attempting to reserve), it checks if the item is still available (reserved === false).
 * If another guest reserved it in the meantime, it returns { success: false, alreadyReserved: true }.
 */
export async function updateGiftReservationInSupabase(
  giftId: string,
  isReserved: boolean,
  reservedBy?: string,
  reservedAt?: string,
  reservationMessage?: string
): Promise<ReservationResult> {
  try {
    const numericId = Number(giftId);
    const idToUse = !isNaN(numericId) && String(numericId) === giftId ? numericId : giftId;

    // Concurrency check when attempting to reserve (isReserved === true)
    if (isReserved) {
      const { data: checkData, error: checkError } = await supabase
        .from('presentes')
        .select('reserved, reserved_by')
        .eq('id', idToUse)
        .maybeSingle();

      if (!checkError && checkData) {
        const currentlyReserved = Boolean(
          checkData.reserved === true ||
          checkData.reserved === 'true' ||
          checkData.reserved === 1 ||
          checkData.reserved === '1'
        );

        if (currentlyReserved) {
          return {
            success: false,
            alreadyReserved: true,
            reservedBy: checkData.reserved_by || 'Outro Convidado',
            errorMessage: 'Ops! Este presente acabou de ser reservado por outra pessoa.',
          };
        }
      }
    }

    // Primary update: reserved and reserved_by
    const payload: Record<string, any> = {
      reserved: isReserved,
      reserved_by: isReserved ? (reservedBy || null) : null,
    };
    if (reservedAt) {
      payload.reserved_at = isReserved ? reservedAt : null;
    }
    if (reservationMessage) {
      payload.reservation_message = isReserved ? reservationMessage : null;
    }

    let query = supabase
      .from('presentes')
      .update(payload)
      .eq('id', idToUse);

    if (isReserved) {
      // Atomic condition: only update if still unreserved
      query = query.eq('reserved', false);
    }

    const { data: updateData, error } = await query.select();

    if (!error) {
      if (isReserved && updateData && updateData.length === 0) {
        // No row updated because reserved is already true in DB
        return {
          success: false,
          alreadyReserved: true,
          errorMessage: 'Ops! Este presente acabou de ser reservado por outra pessoa.',
        };
      }
      return { success: true };
    }

    // Fallback: update only 'reserved' column if extra columns do not exist
    let fallbackQuery = supabase
      .from('presentes')
      .update({ reserved: isReserved })
      .eq('id', idToUse);

    if (isReserved) {
      fallbackQuery = fallbackQuery.eq('reserved', false);
    }

    const { data: fallbackData, error: errorOnlyReserved } = await fallbackQuery.select();

    if (isReserved && fallbackData && fallbackData.length === 0) {
      return {
        success: false,
        alreadyReserved: true,
        errorMessage: 'Ops! Este presente acabou de ser reservado por outra pessoa.',
      };
    }

    if (errorOnlyReserved) {
      return { success: false, errorMessage: errorOnlyReserved.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Erro ao atualizar reserva no Supabase:', err);
    return { success: false, errorMessage: err?.message };
  }
}

/**
 * Add a new gift to Supabase table 'presentes'
 */
export async function addGiftToSupabase(gift: GiftItem): Promise<boolean> {
  try {
    const numericId = Number(gift.id);
    const idToUse = !isNaN(numericId) && String(numericId) === gift.id ? numericId : gift.id;

    const payload = {
      id: idToUse,
      nome: gift.name,
      name: gift.name,
      categoria: gift.category,
      category: gift.category,
      imagem: gift.image,
      image: gift.image,
      imagens: gift.images || [gift.image],
      images: gift.images || [gift.image],
      descricao: gift.description || '',
      description: gift.description || '',
      reserved: gift.isReserved || false,
      reserved_by: gift.reservedBy || null,
      reserved_at: gift.reservedAt || null,
      reservation_message: gift.reservationMessage || null,
    };

    const { error } = await supabase
      .from('presentes')
      .upsert([payload]);

    if (!error) return true;

    // Fallback minimal using 'reserved'
    const fallbackPayload = {
      id: idToUse,
      nome: gift.name,
      categoria: gift.category,
      imagem: gift.image,
      descricao: gift.description || '',
      reserved: false,
    };
    const { error: errFallback } = await supabase.from('presentes').upsert([fallbackPayload]);
    return !errFallback;
  } catch (err) {
    console.error('Erro ao adicionar presente no Supabase:', err);
    return false;
  }
}

/**
 * Delete a gift from Supabase table 'presentes'
 */
export async function deleteGiftFromSupabase(giftId: string): Promise<boolean> {
  try {
    const numericId = Number(giftId);
    const idToUse = !isNaN(numericId) && String(numericId) === giftId ? numericId : giftId;

    const { error } = await supabase
      .from('presentes')
      .delete()
      .eq('id', idToUse);

    if (!error) return true;

    // Retry with string id if numeric was tried or vice versa
    const { error: error2 } = await supabase
      .from('presentes')
      .delete()
      .eq('id', giftId);

    return !error2;
  } catch (err) {
    console.error('Erro ao deletar presente no Supabase:', err);
    return false;
  }
}

/**
 * Add a category to Supabase table 'categorias'
 */
export async function addCategoryToSupabase(categoryName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('categorias')
      .insert([{ nome: categoryName, name: categoryName }]);

    if (!error) return true;

    const { error: errPT } = await supabase
      .from('categorias')
      .insert([{ nome: categoryName }]);
    if (!errPT) return true;

    const { error: errEN } = await supabase
      .from('categorias')
      .insert([{ name: categoryName }]);
    return !errEN;
  } catch (err) {
    console.error('Erro ao adicionar categoria no Supabase:', err);
    return false;
  }
}

/**
 * Delete a category from Supabase table 'categorias'
 */
export async function deleteCategoryFromSupabase(categoryName: string): Promise<boolean> {
  try {
    const { error: errPT } = await supabase
      .from('categorias')
      .delete()
      .eq('nome', categoryName);

    if (!errPT) return true;

    const { error: errEN } = await supabase
      .from('categorias')
      .delete()
      .eq('name', categoryName);

    return !errEN;
  } catch (err) {
    console.error('Erro ao remover categoria no Supabase:', err);
    return false;
  }
}

/**
 * Save House Info to Supabase if table exists
 */
export async function saveHouseInfoToSupabase(info: HouseInfo): Promise<boolean> {
  try {
    const payload = {
      couple_names: info.coupleNames,
      nomes_noivos: info.coupleNames,
      event_date: info.eventDate,
      data_evento: info.eventDate,
      location: info.location,
      local: info.location,
      welcome_message: info.welcomeMessage,
      mensagem_boas_vindas: info.welcomeMessage,
    };

    const { error } = await supabase
      .from('configuracoes')
      .upsert([payload]);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Upload texture image file to Supabase Storage and return its public URL
 */
export async function uploadTextureToSupabaseStorage(
  file: File,
  type: 'bambu' | 'inox'
): Promise<{ url: string; isBase64Fallback?: boolean } | null> {
  const extension = file.name.split('.').pop() || 'jpg';
  const cleanExtension = extension.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'jpg';
  const fileName = `textures/${type}_${Date.now()}.${cleanExtension}`;

  // Candidate buckets to try in Supabase Storage
  const bucketsToTry = ['presentes', 'texturas', 'imagens', 'images', 'public'];

  for (const bucketName of bucketsToTry) {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || `image/${cleanExtension}`,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName);

        if (publicUrlData?.publicUrl) {
          return { url: publicUrlData.publicUrl, isBase64Fallback: false };
        }
      }
    } catch {
      // Continue to next bucket
    }
  }

  // If storage upload fails (e.g. bucket doesn't exist yet / strict RLS), convert to Base64 data URL as fallback so user is never blocked
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        resolve({ url: result, isBase64Fallback: true });
      } else {
        resolve(null);
      }
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

/**
 * Save Textures configuration to Supabase table 'configuracoes'
 */
export async function saveTexturesToSupabase(textures: TexturesConfig): Promise<boolean> {
  try {
    const payload = {
      bambu_image: textures.bambuImage || '',
      inox_image: textures.inoxImage || '',
      bambu_url: textures.bambuImage || '',
      inox_url: textures.inoxImage || '',
    };

    const { error } = await supabase
      .from('configuracoes')
      .upsert([payload]);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Fetch Textures configuration from Supabase table 'configuracoes'
 */
export async function fetchTexturesFromSupabase(): Promise<TexturesConfig | null> {
  try {
    const { data, error } = await supabase
      .from('configuracoes')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      bambuImage: data.bambu_image || data.bambu_url || data.bambuImage || undefined,
      inoxImage: data.inox_image || data.inox_url || data.inoxImage || undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Helper to sync all gifts and categories to Supabase
 */
export async function syncAllToSupabase(gifts: GiftItem[], categories: string[], houseInfo?: HouseInfo): Promise<{ success: boolean; message: string }> {
  try {
    let giftsSuccess = 0;
    for (const gift of gifts) {
      const ok = await addGiftToSupabase(gift);
      if (ok) giftsSuccess++;
    }

    let categoriesSuccess = 0;
    for (const cat of categories) {
      const ok = await addCategoryToSupabase(cat);
      if (ok) categoriesSuccess++;
    }

    if (houseInfo) {
      await saveHouseInfoToSupabase(houseInfo);
    }

    return {
      success: true,
      message: `Sincronizados ${giftsSuccess} presentes e ${categoriesSuccess} categorias no Supabase com sucesso!`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Erro ao sincronizar: ${err?.message || 'Falha de conexão'}`,
    };
  }
}

