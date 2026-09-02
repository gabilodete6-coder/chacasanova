import { createClient } from '@supabase/supabase-js';

export interface MigrationItemResult {
  id: string;
  nome: string;
  status: 'migrated' | 'will_migrate' | 'already_url' | 'error' | 'empty';
  originalFormat: 'base64' | 'url' | 'empty';
  sizeKb?: number;
  publicUrl?: string;
  error?: string;
}

export interface MigrationResponse {
  success: boolean;
  mode: 'dry-run' | 'execute';
  total: number;
  migrated: number;
  ignored: number;
  errors: number;
  totalBase64Bytes: number;
  totalBase64Mb: string;
  items: MigrationItemResult[];
  error?: string;
}

function parseDataUrl(dataUrl: any) {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
    return null;
  }

  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9\+\-\.]+);base64,(.+)$/s);
  if (!match) {
    return null;
  }

  const mimeType = match[1];
  const base64Data = match[2];
  const buffer = Buffer.from(base64Data, 'base64');

  let ext = 'webp';
  if (mimeType.includes('png')) ext = 'png';
  else if (mimeType.includes('webp')) ext = 'webp';
  else if (mimeType.includes('svg')) ext = 'svg';
  else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';

  return {
    mimeType,
    ext,
    buffer,
    sizeBytes: buffer.length,
  };
}

export async function handleMigrationRequest(body: { password?: string; mode?: string }): Promise<{ status: number; data: any }> {
  const { password, mode = 'dry-run' } = body || {};

  const configuredPassword = process.env.MIGRATION_PASSWORD;
  const supabaseUrl = process.env.SUPABASE_URL || 'https://flnytwosxztpzkzxjjia.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // 1. Validate Migration Password
  if (!configuredPassword) {
    return {
      status: 500,
      data: {
        success: false,
        error: 'A variável de ambiente MIGRATION_PASSWORD não está configurada no servidor Vercel.',
      },
    };
  }

  if (!password || password.trim() !== configuredPassword.trim()) {
    return {
      status: 401,
      data: {
        success: false,
        error: 'Senha de migração incorreta. Verifique a senha configurada em MIGRATION_PASSWORD.',
      },
    };
  }

  // 2. Validate Service Role Key (Mandatory, no fallback to anon)
  if (!serviceRoleKey || !serviceRoleKey.trim()) {
    return {
      status: 500,
      data: {
        success: false,
        error: 'A variável de ambiente SUPABASE_SERVICE_ROLE_KEY não está configurada no servidor. É necessária para autorizar o upload no Storage e UPDATE seguro.',
      },
    };
  }

  const bucketName = process.env.STORAGE_BUCKET || 'presentes';

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  // 3. Fetch records from 'presentes'
  const { data: rows, error: selectError } = await supabase
    .from('presentes')
    .select('id, nome, name, imagem')
    .order('id', { ascending: true });

  if (selectError || !rows) {
    return {
      status: 500,
      data: {
        success: false,
        error: `Erro ao consultar a tabela 'presentes': ${selectError?.message || 'Erro desconhecido'}`,
      },
    };
  }

  const items: MigrationItemResult[] = [];
  let migratedCount = 0;
  let ignoredCount = 0;
  let errorCount = 0;
  let totalBase64Bytes = 0;

  for (const row of rows) {
    const id = row.id;
    const nome = row.nome || row.name || `Presente #${id}`;
    const rawImage = row.imagem || '';

    // A. Check if already public HTTP/HTTPS URL
    if (typeof rawImage === 'string' && (rawImage.startsWith('http://') || rawImage.startsWith('https://'))) {
      items.push({
        id,
        nome,
        status: 'already_url',
        originalFormat: 'url',
        publicUrl: rawImage,
      });
      ignoredCount++;
      continue;
    }

    // B. Check if Base64
    const parsed = parseDataUrl(rawImage);
    if (!parsed) {
      items.push({
        id,
        nome,
        status: 'empty',
        originalFormat: 'empty',
        error: 'Imagem vazia ou formato não reconhecido',
      });
      ignoredCount++;
      continue;
    }

    const sizeKb = Number((parsed.sizeBytes / 1024).toFixed(1));
    totalBase64Bytes += parsed.sizeBytes;

    // C. Deterministic file path: migrated/{id}.{ext}
    const cleanId = String(id).replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `migrated/${cleanId}.${parsed.ext}`;

    if (mode === 'dry-run') {
      items.push({
        id,
        nome,
        status: 'will_migrate',
        originalFormat: 'base64',
        sizeKb,
        publicUrl: `https://${supabaseUrl.replace('https://', '')}/storage/v1/object/public/${bucketName}/${fileName}`,
      });
      continue;
    }

    // D. Mode: 'execute' (Real Migration)
    try {
      // 1. Upload bytes to Supabase Storage 'presentes'
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, parsed.buffer, {
          contentType: parsed.mimeType,
          cacheControl: '31536000',
          upsert: true,
        });

      if (uploadError || !uploadData) {
        throw new Error(`Falha no upload para o Storage: ${uploadError?.message || 'Erro desconhecido'}`);
      }

      // 2. Get Public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      const publicUrl = urlData?.publicUrl;
      if (!publicUrl) {
        throw new Error('Não foi possível gerar a URL pública no Storage.');
      }

      // 3. Update ONLY column 'imagem' in DB (Not column 'image')
      const { error: dbUpdateError } = await supabase
        .from('presentes')
        .update({
          imagem: publicUrl,
        })
        .eq('id', id);

      if (dbUpdateError) {
        throw new Error(`Upload concluído, mas falha ao atualizar banco na coluna imagem: ${dbUpdateError.message}`);
      }

      items.push({
        id,
        nome,
        status: 'migrated',
        originalFormat: 'base64',
        sizeKb,
        publicUrl,
      });
      migratedCount++;
    } catch (err: any) {
      errorCount++;
      items.push({
        id,
        nome,
        status: 'error',
        originalFormat: 'base64',
        sizeKb,
        error: err?.message || 'Erro durante a migração',
      });
    }
  }

  const totalBase64Mb = (totalBase64Bytes / (1024 * 1024)).toFixed(2);

  return {
    status: 200,
    data: {
      success: true,
      mode: mode === 'execute' ? 'execute' : 'dry-run',
      total: rows.length,
      migrated: mode === 'execute' ? migratedCount : items.filter((i) => i.status === 'will_migrate').length,
      ignored: ignoredCount,
      errors: errorCount,
      totalBase64Bytes,
      totalBase64Mb,
      items,
    },
  };
}

// Default export for Vercel Serverless Function (/api/admin/migrate-images)
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método não permitido. Use POST.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }

    const { status, data } = await handleMigrationRequest(body || {});
    return res.status(status).json(data);
  } catch (error: any) {
    console.error('Erro na rota de migração:', error);
    return res.status(500).json({ success: false, error: error?.message || 'Erro interno no servidor' });
  }
}
