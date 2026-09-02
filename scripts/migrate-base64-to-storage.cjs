#!/usr/bin/env node
/**
 * Script de Migração de Imagens Base64 para Supabase Storage
 * 
 * Uso:
 *   node scripts/migrate-base64-to-storage.cjs
 * 
 * Ou com Service Role Key (recomendado se as RLS do Storage exigirem permissões de admin):
 *   SUPABASE_SERVICE_ROLE_KEY="sua-service-role-key" node scripts/migrate-base64-to-storage.cjs
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://flnytwosxztpzkzxjjia.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsbnl0d29zeHp0cHprenhqamlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3NzU4NTcsImV4cCI6MjEwMjM1MTg1N30.hzhOkutPLYcQAkMELqJJ6FiG7Ez-REC5Yr5EfYMZITk';
const BUCKET_NAME = process.env.STORAGE_BUCKET || 'presentes';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

function parseDataUrl(dataUrl) {
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

  let ext = 'jpg';
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

async function ensureBucketExists() {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (!error && buckets) {
      const exists = buckets.some(b => b.name === BUCKET_NAME || b.id === BUCKET_NAME);
      if (exists) {
        console.log(`[STORAGE] Bucket "${BUCKET_NAME}" encontrado e pronto para uso.`);
        return true;
      }
    }
  } catch (err) {
    // Ignora se não for permitido listar
  }

  // Tenta criar o bucket se tivermos credenciais administrativas
  try {
    const { data, error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    });

    if (!error && data) {
      console.log(`[STORAGE] Bucket "${BUCKET_NAME}" criado com sucesso com acesso público.`);
      return true;
    }
  } catch (err) {
    // Continua
  }

  console.log(`[STORAGE] Usando bucket "${BUCKET_NAME}". (Certifique-se de que ele foi criado no Supabase Dashboard)`);
  return true;
}

async function runMigration() {
  console.log('=====================================================');
  console.log('  MIGRAÇÃO DE IMAGENS: BASE64 -> SUPABASE STORAGE');
  console.log('=====================================================');
  console.log(`URL do Supabase: ${SUPABASE_URL}`);
  console.log(`Bucket Alvo:     ${BUCKET_NAME}`);
  console.log('-----------------------------------------------------\n');

  await ensureBucketExists();

  console.log('[1/3] Buscando todos os presentes no banco de dados...');
  const { data: rows, error } = await supabase
    .from('presentes')
    .select('id, nome, name, imagem, image')
    .order('id', { ascending: true });

  if (error || !rows) {
    console.error('[ERRO FATAL] Não foi possível consultar a tabela "presentes":', error?.message || error);
    process.exit(1);
  }

  console.log(`[2/3] Total de registros encontrados: ${rows.length}`);
  console.log('[3/3] Iniciando processo de migração...\n');

  let countMigrated = 0;
  let countIgnored = 0;
  let countErrors = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const indexStr = `(${i + 1}/${rows.length})`;
    const id = row.id;
    const nome = row.nome || row.name || `Presente #${id}`;
    const rawImage = row.imagem || row.image || '';

    // Verifica se já é uma URL HTTP/HTTPS (Idempotência)
    if (typeof rawImage === 'string' && (rawImage.startsWith('http://') || rawImage.startsWith('https://'))) {
      console.log(`[IGNORADO] ${indexStr} ID: ${id} - "${nome}" (já possui URL pública: ${rawImage.substring(0, 45)}...)`);
      countIgnored++;
      continue;
    }

    // Verifica se é Base64
    const parsed = parseDataUrl(rawImage);
    if (!parsed) {
      if (!rawImage || rawImage.trim() === '') {
        console.log(`[IGNORADO] ${indexStr} ID: ${id} - "${nome}" (campo de imagem vazio)`);
        countIgnored++;
      } else {
        console.log(`[IGNORADO] ${indexStr} ID: ${id} - "${nome}" (formato não reconhecido como Base64 Data URL)`);
        countIgnored++;
      }
      continue;
    }

    // Gera nome de arquivo único e seguro
    const cleanId = String(id).replace(/[^a-zA-Z0-9_-]/g, '_');
    const timestamp = Date.now();
    const fileName = `${cleanId}-${timestamp}.${parsed.ext}`;

    try {
      // 1. Envia o buffer para o Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, parsed.buffer, {
          contentType: parsed.mimeType,
          cacheControl: '31536000',
          upsert: true,
        });

      if (uploadError || !uploadData) {
        throw new Error(`Falha no upload para Storage: ${uploadError?.message || 'Erro desconhecido'}`);
      }

      // 2. Obtém a URL pública gerada
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName);

      const publicUrl = urlData?.publicUrl;
      if (!publicUrl) {
        throw new Error('Não foi possível obter a URL pública do arquivo enviado.');
      }

      // 3. Atualiza atomicamente a coluna 'imagem' no banco apenas APÓS sucesso do upload
      const { error: dbUpdateError } = await supabase
        .from('presentes')
        .update({
          imagem: publicUrl,
          image: publicUrl,
        })
        .eq('id', id);

      if (dbUpdateError) {
        throw new Error(`Imagem enviada ao Storage, mas falha ao atualizar banco: ${dbUpdateError.message}`);
      }

      const sizeKb = (parsed.sizeBytes / 1024).toFixed(1);
      console.log(`[MIGRADO]  ${indexStr} ID: ${id} - "${nome}" (${sizeKb} KB) -> ${publicUrl}`);
      countMigrated++;
    } catch (err) {
      console.error(`[ERRO]     ${indexStr} ID: ${id} - "${nome}" - Motivo: ${err.message}`);
      countErrors++;
    }
  }

  console.log('\n=====================================================');
  console.log('  RESUMO FINAL DA MIGRAÇÃO');
  console.log('=====================================================');
  console.log(`Total de presentes analisados: ${rows.length}`);
  console.log(`Migrados com sucesso:          ${countMigrated}`);
  console.log(`Já estavam em URL (ignorados): ${countIgnored}`);
  console.log(`Erros durante a execução:      ${countErrors}`);
  console.log('=====================================================\n');

  if (countMigrated > 0) {
    console.log('✅ Migração concluída com sucesso! Os presentes atualizados agora usam URLs leves do Supabase Storage.');
  } else if (countErrors > 0) {
    console.log('⚠️  Algumas imagens não puderam ser migradas. Se houver erro de permissão (RLS), forneça a SUPABASE_SERVICE_ROLE_KEY ou crie o bucket com acesso público no Dashboard do Supabase.');
  } else {
    console.log('ℹ️  Nenhuma imagem pendente de migração foi encontrada.');
  }
}

runMigration().catch(err => {
  console.error('[ERRO NÃO TRATADO]:', err);
  process.exit(1);
});
