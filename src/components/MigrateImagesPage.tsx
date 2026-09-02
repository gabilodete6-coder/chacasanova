import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  KeyRound, 
  Play, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  Image as ImageIcon,
  Loader2,
  HardDrive,
  Info,
  RefreshCw,
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react';

interface MigrationItem {
  id: string;
  nome: string;
  status: 'migrated' | 'will_migrate' | 'already_url' | 'error' | 'empty';
  originalFormat: 'base64' | 'url' | 'empty';
  sizeKb?: number;
  publicUrl?: string;
  error?: string;
}

interface MigrationReport {
  success: boolean;
  mode: 'dry-run' | 'execute';
  total: number;
  migrated: number;
  ignored: number;
  errors: number;
  totalBase64Bytes: number;
  totalBase64Mb: string;
  items: MigrationItem[];
  error?: string;
}

interface MigrateImagesPageProps {
  onBackToHome: () => void;
}

export function MigrateImagesPage({ onBackToHome }: MigrateImagesPageProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [currentAction, setCurrentAction] = useState<'dry-run' | 'execute' | null>(null);
  const [report, setReport] = useState<MigrationReport | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'migrated' | 'already_url' | 'error'>('all');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  async function handleRunMigration(mode: 'dry-run' | 'execute') {
    if (!password.trim()) {
      setServerError('Por favor, informe a senha de migração (MIGRATION_PASSWORD).');
      return;
    }

    setServerError(null);
    setIsRunning(true);
    setCurrentAction(mode);
    setShowConfirmModal(false);

    try {
      const res = await fetch('/api/admin/migrate-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: password.trim(),
          mode,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || `Erro na migração (HTTP ${res.status})`);
      }

      setReport(data);
    } catch (err: any) {
      setServerError(err.message || 'Erro ao conectar ao servidor de migração.');
    } finally {
      setIsRunning(false);
      setCurrentAction(null);
    }
  }

  const filteredItems = report?.items.filter((item) => {
    if (filter === 'migrated') return item.status === 'migrated' || item.status === 'will_migrate';
    if (filter === 'already_url') return item.status === 'already_url';
    if (filter === 'error') return item.status === 'error' || item.status === 'empty';
    return true;
  }) || [];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBackToHome}
              className="p-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-lg transition border border-stone-800 flex items-center gap-2 text-sm"
              title="Voltar ao início"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao site</span>
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <HardDrive className="w-6 h-6 text-amber-500" />
                <span>Migração Segura: Base64 → Supabase Storage</span>
              </h1>
              <p className="text-xs md:text-sm text-stone-400">
                Ferramenta administrativa temporária para converter imagens da tabela <code className="text-amber-400 bg-stone-900 px-1.5 py-0.5 rounded">presentes</code>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-stone-900 px-3 py-1.5 rounded-full border border-stone-800 text-xs text-stone-400 self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Server-side Privilegiado</span>
          </div>
        </div>

        {/* Security & Password Card */}
        <div className="bg-stone-900/90 rounded-2xl border border-stone-800 p-6 space-y-5 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 shrink-0">
              <KeyRound className="w-6 h-6" />
            </div>
            <div className="space-y-1 flex-1">
              <h2 className="text-base font-semibold text-white">Autenticação de Segurança da Migração</h2>
              <p className="text-xs md:text-sm text-stone-400 leading-relaxed">
                Esta rotina roda exclusivamente no servidor via <code className="text-stone-300">SUPABASE_SERVICE_ROLE_KEY</code>. Informe abaixo a senha definida na variável <code className="text-stone-300">MIGRATION_PASSWORD</code> da Vercel.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="md:col-span-2 relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha de migração (MIGRATION_PASSWORD)"
                disabled={isRunning}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleRunMigration('dry-run')}
                disabled={isRunning || !password}
                className="flex-1 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-stone-200 font-medium px-4 py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm border border-stone-700"
              >
                {isRunning && currentAction === 'dry-run' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Simulando...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 text-amber-400" />
                    <span>Simular (Dry Run)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                disabled={isRunning || !password}
                className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-medium px-4 py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-amber-600/20"
              >
                {isRunning && currentAction === 'execute' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Migrando...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Executar Migração</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {serverError && (
            <div className="p-4 bg-red-950/60 border border-red-800/80 rounded-xl text-red-200 text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-red-300">Falha na execução:</p>
                <p className="text-xs md:text-sm text-red-200/90">{serverError}</p>
              </div>
            </div>
          )}
        </div>

        {/* Safety Guarantees Notice */}
        <div className="bg-stone-900/50 rounded-xl border border-stone-800/80 p-4 text-xs text-stone-400 flex items-center gap-3">
          <Info className="w-5 h-5 text-stone-500 shrink-0" />
          <span>
            <strong>Garantias de Segurança:</strong> 100% Idempotente. Imagens que já possuem URL não são reprocessadas. A coluna <code className="text-stone-300">imagem</code> só é atualizada após confirmação de upload no Storage. Nenhum registro ou reserva é apagado.
          </span>
        </div>

        {/* Results Report Section */}
        {report && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Mode Banner */}
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              report.mode === 'dry-run' 
                ? 'bg-amber-950/30 border-amber-800/50 text-amber-200' 
                : 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
            }`}>
              <div className="flex items-center gap-3">
                {report.mode === 'dry-run' ? (
                  <Search className="w-5 h-5 text-amber-400" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                )}
                <div>
                  <h3 className="font-semibold text-sm">
                    {report.mode === 'dry-run' ? 'Relatório de Simulação (DRY RUN)' : 'Migração Real Concluída'}
                  </h3>
                  <p className="text-xs opacity-80">
                    {report.mode === 'dry-run'
                      ? 'Nenhum dado foi alterado no banco ou Storage. Os dados abaixo representam a previsão de execução.'
                      : 'Arquivos enviados para o bucket "presentes" e URLs atualizadas no banco de dados com sucesso.'}
                  </p>
                </div>
              </div>
              <span className="text-xs uppercase font-mono px-2.5 py-1 rounded bg-stone-900 border border-stone-700">
                {report.mode === 'dry-run' ? 'Simulação' : 'Definitivo'}
              </span>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-1">
                <span className="text-xs text-stone-400">Total no Banco</span>
                <p className="text-2xl font-bold text-white">{report.total}</p>
              </div>
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-1">
                <span className="text-xs text-amber-400">
                  {report.mode === 'dry-run' ? 'A Migrar (Base64)' : 'Migrados com Sucesso'}
                </span>
                <p className="text-2xl font-bold text-amber-400">{report.migrated}</p>
              </div>
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-1">
                <span className="text-xs text-stone-400">Já em URL / Ignorados</span>
                <p className="text-2xl font-bold text-stone-300">{report.ignored}</p>
              </div>
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-1">
                <span className="text-xs text-red-400">Erros</span>
                <p className="text-2xl font-bold text-red-400">{report.errors}</p>
              </div>
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-1 col-span-2 sm:col-span-1">
                <span className="text-xs text-stone-400">Volume Base64</span>
                <p className="text-2xl font-bold text-stone-200">{report.totalBase64Mb} <span className="text-xs font-normal text-stone-400">MB</span></p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 border-b border-stone-800 pb-3">
              <button
                onClick={() => setFilter('all')}
                className={`text-xs px-3 py-1.5 rounded-lg transition ${
                  filter === 'all'
                    ? 'bg-stone-800 text-white font-medium'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Todos ({report.items.length})
              </button>
              <button
                onClick={() => setFilter('migrated')}
                className={`text-xs px-3 py-1.5 rounded-lg transition ${
                  filter === 'migrated'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800 font-medium'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {report.mode === 'dry-run' ? 'A Migrar' : 'Migrados'} ({report.migrated})
              </button>
              <button
                onClick={() => setFilter('already_url')}
                className={`text-xs px-3 py-1.5 rounded-lg transition ${
                  filter === 'already_url'
                    ? 'bg-stone-800 text-stone-200 font-medium'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Já em URL ({report.ignored})
              </button>
              {report.errors > 0 && (
                <button
                  onClick={() => setFilter('error')}
                  className={`text-xs px-3 py-1.5 rounded-lg transition ${
                    filter === 'error'
                      ? 'bg-red-950 text-red-300 border border-red-800 font-medium'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Erros ({report.errors})
                </button>
              )}
            </div>

            {/* Items Table */}
            <div className="bg-stone-900 rounded-xl border border-stone-800 overflow-hidden">
              <div className="max-h-96 overflow-y-auto divide-y divide-stone-800/60 font-mono text-xs">
                {filteredItems.map((item, idx) => (
                  <div key={item.id || idx} className="p-3.5 hover:bg-stone-800/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-stone-500">#{idx + 1}</span>
                        <span className="font-semibold text-white font-sans text-sm">{item.nome}</span>
                        <span className="text-stone-500 text-[11px]">({item.id})</span>
                      </div>
                      <div className="flex items-center gap-3 text-stone-400 text-[11px]">
                        <span>Formato: <strong className="text-stone-300">{item.originalFormat}</strong></span>
                        {item.sizeKb !== undefined && (
                          <span>Tamanho: <strong className="text-amber-400">{item.sizeKb} KB</strong></span>
                        )}
                        {item.publicUrl && (
                          <a
                            href={item.publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-400 hover:underline flex items-center gap-1 truncate max-w-xs"
                          >
                            <span>URL pública</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        )}
                      </div>
                      {item.error && (
                        <p className="text-red-400 font-sans text-xs">{item.error}</p>
                      )}
                    </div>

                    <div>
                      {item.status === 'migrated' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-[11px] font-sans font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Migrado
                        </span>
                      )}
                      {item.status === 'will_migrate' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-800 text-amber-300 text-[11px] font-sans font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          Pronto p/ Migrar
                        </span>
                      )}
                      {item.status === 'already_url' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-800 border border-stone-700 text-stone-300 text-[11px] font-sans">
                          Já possui URL
                        </span>
                      )}
                      {item.status === 'error' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/80 border border-red-800 text-red-300 text-[11px] font-sans font-medium">
                          <XCircle className="w-3.5 h-3.5" />
                          Erro
                        </span>
                      )}
                      {item.status === 'empty' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-800 text-stone-400 text-[11px] font-sans">
                          Sem Imagem
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {filteredItems.length === 0 && (
                  <div className="p-8 text-center text-stone-500 text-sm">
                    Nenhum item corresponde ao filtro selecionado.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 text-amber-400">
                <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Confirmar Migração Definitiva</h3>
                  <p className="text-xs text-stone-400">Esta ação executará o upload e o update no banco</p>
                </div>
              </div>

              <p className="text-sm text-stone-300 leading-relaxed">
                As imagens Base64 serão convertidas e enviadas para o bucket público <code className="text-amber-400 bg-stone-950 px-1.5 py-0.5 rounded">presentes</code> do Supabase Storage. As URLs públicas substituirão os Base64 na coluna <code className="text-amber-400 bg-stone-950 px-1.5 py-0.5 rounded">imagem</code>.
              </p>

              <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-400 space-y-1">
                <p>• Nenhum presente será excluído.</p>
                <p>• Nenhuma reserva ou recado será alterado.</p>
                <p>• O banco só é atualizado após sucesso no Storage.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-sm transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleRunMigration('execute')}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-xl text-sm transition shadow-lg shadow-amber-600/20 flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Sim, Iniciar Migração</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
