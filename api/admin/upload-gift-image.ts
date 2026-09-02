import { createClient } from '@supabase/supabase-js';

export interface UploadImageRequestBody {
  image?: string; // Data URL or base64
  giftId?: string;
  fileName?: string;
  contentType?: string;
  adminPassword?: string;
}

export interface UploadImageResponse {
  success: boolean;
  publicUrl?: string;
  filePath?: string;
  error?: string;
}

function parseBase64Image(dataUrlOrBase64: string, fallbackContentType?: string) {
  if (!dataUrlOrBase64 || typeof dataUrlOrBase64 !== 'string') {
    return null;
  }

  let mimeType = fallbackContentType || 'image/webp';
  let base64Data = dataUrlOrBase64;

  if (dataUrlOrBase64.startsWith('data:')) {
    const match = dataUrlOrBase64.match(/^data:([a-zA-Z0-9\+\-\.\/]+);base64,(.+)$/s);
    if (match) {
      mimeType = match[1];
      base64Data = match[2];
    } else {
      return null;
    }
  }

  const buffer = Buffer.from(base64Data, 'base64');
  if (!buffer || buffer.length === 0) {
    return null;
  }

  let ext = 'webp';
  if (mimeType.includes('png')) ext = 'png';
  else if (mimeType.includes('webp')) ext = 'webp';
  else if (mimeType.includes('svg')) ext = 'svg';
  else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';

  return {
    buffer,
    mimeType,
    ext,
    sizeBytes: buffer.length,
  };
}

export async function handleUploadGiftImageRequest(
  body: UploadImageRequestBody,
  headers: Record<string, string | string[] | undefined> = {}
): Promise<{ status: number; data: UploadImageResponse }> {
  const supabaseUrl = process.env.SUPABASE_URL || 'https://flnytwosxztpzkzxjjia.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // 1. Validate Service Role Key (Server-only secret)
  if (!serviceRoleKey || !serviceRoleKey.trim()) {
    return {
      status: 500,
      data: {
        success: false,
        error: 'A variável de ambiente SUPABASE_SERVICE_ROLE_KEY não está configurada no servidor Vercel. Ela é obrigatória para uploads administrativos no Storage.',
      },
    };
  }

  // 2. Validate Admin Authentication
  const configuredPassword = process.env.ADMIN_PASSWORD || process.env.MIGRATION_PASSWORD;
  const providedHeaderPassword = headers['x-admin-password'] || headers['x-admin-key'];
  const providedPassword = (
    typeof providedHeaderPassword === 'string'
      ? providedHeaderPassword
      : Array.isArray(providedHeaderPassword)
      ? providedHeaderPassword[0]
      : body?.adminPassword
  ) || '';

  // If a password is configured in Vercel env, strictly enforce it
  if (configuredPassword && configuredPassword.trim()) {
    if (!providedPassword || providedPassword.trim() !== configuredPassword.trim()) {
      // Also allow 149610 if configuredPassword isn't explicitly ADMIN_PASSWORD
      const isLegacyMatch = !process.env.ADMIN_PASSWORD && providedPassword.trim() === '149610';
      if (!isLegacyMatch) {
        return {
          status: 401,
          data: {
            success: false,
            error: 'Acesso não autorizado. Senha administrativa inválida.',
          },
        };
      }
    }
  }

  // 3. Parse Base64 Image Payload
  const rawImage = body?.image;
  if (!rawImage) {
    return {
      status: 400,
      data: {
        success: false,
        error: 'Nenhuma imagem foi fornecida para upload.',
      },
    };
  }

  const parsed = parseBase64Image(rawImage, body.contentType);
  if (!parsed) {
    return {
      status: 400,
      data: {
        success: false,
        error: 'Formato de imagem inválido ou payload corrompido.',
      },
    };
  }

  // 4. Build unique filename for bucket 'presentes'
  const cleanId = String(body.giftId || 'gift').replace(/[^a-zA-Z0-9_-]/g, '_');
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const fileName = `gifts/${cleanId}-${timestamp}-${randomSuffix}.${parsed.ext}`;
  const bucketName = process.env.STORAGE_BUCKET || 'presentes';

  // 5. Initialize Supabase Client with Service Role (Bypasses public RLS)
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  try {
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, parsed.buffer, {
        contentType: parsed.mimeType,
        cacheControl: '31536000',
        upsert: true,
      });

    if (uploadError || !uploadData) {
      console.error('Erro no upload com Service Role:', uploadError);
      return {
        status: 500,
        data: {
          success: false,
          error: `Falha no Supabase Storage: ${uploadError?.message || 'Erro desconhecido ao salvar arquivo'}`,
        },
      };
    }

    // 6. Retrieve public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    const publicUrl = urlData?.publicUrl;
    if (!publicUrl) {
      return {
        status: 500,
        data: {
          success: false,
          error: 'Imagem enviada, mas não foi possível gerar a URL pública no Supabase Storage.',
        },
      };
    }

    return {
      status: 200,
      data: {
        success: true,
        publicUrl,
        filePath: fileName,
      },
    };
  } catch (err: any) {
    console.error('Exceção ao processar upload:', err);
    return {
      status: 500,
      data: {
        success: false,
        error: `Erro interno no servidor ao processar upload: ${err?.message || 'Erro desconhecido'}`,
      },
    };
  }
}

// Vercel Serverless Function Default Export (/api/admin/upload-gift-image)
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

    const { status, data } = await handleUploadGiftImageRequest(body || {}, req.headers || {});
    return res.status(status).json(data);
  } catch (error: any) {
    console.error('Erro na rota de upload de imagem:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Erro interno no servidor',
    });
  }
}
