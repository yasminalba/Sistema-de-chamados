import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  X,
  Server,
  Zap,
} from 'lucide-react';
import {
  getSavedConfig,
  saveConfig,
  clearConfig,
  testConnection,
  syncLocalToSupabase,
  SUPABASE_SQL_SCRIPT,
} from '../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [activeTab, setActiveTab] = useState<'config' | 'sql' | 'instrucoes'>('config');
  const [copiedSql, setCopiedSql] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    tableReady?: boolean;
  } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const current = getSavedConfig();
      setUrl(current.url);
      setAnonKey(current.anonKey);
      setTestResult(null);
      setSyncResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await testConnection(url, anonKey);
    setTestResult(res);
    setIsTesting(false);
  };

  const handleSave = () => {
    saveConfig(url, anonKey);
    onConfigSaved();
    onClose();
  };

  const handleClear = () => {
    clearConfig();
    setUrl('');
    setAnonKey('');
    setTestResult(null);
    onConfigSaved();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    const res = await syncLocalToSupabase();
    if (res.error) {
      setSyncResult({ success: false, message: `Erro ao sincronizar: ${res.error}` });
    } else {
      setSyncResult({
        success: true,
        message: `${res.syncedCount} chamado(s) sincronizado(s) com o Supabase com sucesso!`,
      });
      onConfigSaved();
    }
    setIsSyncing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-850 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Conexão com o Supabase
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  Pronto para uso
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Configure as chaves do seu banco de dados para sincronização em nuvem
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
              activeTab === 'config'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            Credenciais de Acesso
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
              activeTab === 'sql'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            Script SQL da Tabela
          </button>
          <button
            onClick={() => setActiveTab('instrucoes')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
              activeTab === 'instrucoes'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Passo a Passo
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'config' && (
            <>
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 leading-relaxed">
                💡 O sistema funciona perfeitamente em modo local (dados salvos no navegador). Para salvar os chamados diretamente na nuvem do seu Supabase, informe a URL e a Chave Anon abaixo:
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Project URL (Supabase URL)
                  </label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://exemplo-seu-projeto.supabase.co"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Encontrado no painel do Supabase: Project Settings → API → Project URL
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Anon / Public Key
                  </label>
                  <input
                    type="password"
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Encontrado em: Project Settings → API → Project API keys (anon public)
                  </span>
                </div>
              </div>

              {/* Status do Teste */}
              {testResult && (
                <div
                  className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
                    testResult.success
                      ? testResult.tableReady
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                        : 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                      : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400 mt-0.5" />
                  )}
                  <div>
                    <strong className="block font-semibold">
                      {testResult.success ? 'Conexão validada' : 'Falha na conexão'}
                    </strong>
                    <p className="mt-0.5">{testResult.message}</p>
                    {testResult.success && testResult.tableReady === false && (
                      <button
                        onClick={() => setActiveTab('sql')}
                        className="mt-2 text-xs font-semibold underline text-amber-200 hover:text-white"
                      >
                        Ver Script SQL para criar a tabela no Supabase &rarr;
                      </button>
                    )}
                  </div>
                </div>
              )}

              {syncResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                    syncResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {syncResult.success ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                  )}
                  <span>{syncResult.message}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTest}
                    disabled={isTesting || !url || !anonKey}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                    {isTesting ? 'Testando...' : 'Testar Conexão'}
                  </button>

                  {url && anonKey && (
                    <button
                      onClick={handleSync}
                      disabled={isSyncing}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      <Database className="w-3.5 h-3.5" />
                      {isSyncing ? 'Sincronizando...' : 'Sincronizar Chamados Locais'}
                    </button>
                  )}
                </div>

                {url && (
                  <button
                    onClick={handleClear}
                    className="text-xs text-rose-400 hover:text-rose-300 hover:underline transition"
                  >
                    Limpar Configuração
                  </button>
                )}
              </div>
            </>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-300">
                  Execute este script no <strong>SQL Editor</strong> do painel do Supabase para criar a tabela com as colunas certas e as permissões de acesso:
                </p>
                <button
                  onClick={handleCopySql}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copiar SQL
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs overflow-x-auto max-h-72 select-all">
                  {SUPABASE_SQL_SCRIPT}
                </pre>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-[11px] text-slate-400 space-y-1">
                <p>✅ Inclui campos para Operador (abertura descritiva) e Mecânico (encerramento e solução técnica).</p>
                <p>✅ Inclui políticas RLS para leitura e escrita através da chave anônima pública.</p>
              </div>
            </div>
          )}

          {activeTab === 'instrucoes' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                    1
                  </span>
                  <div>
                    <h4 className="font-semibold text-white">Acesse o Supabase</h4>
                    <p className="text-slate-400 mt-0.5">
                      Vá para{' '}
                      <a
                        href="https://supabase.com/dashboard"
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:underline inline-flex items-center gap-1"
                      >
                        supabase.com/dashboard <ExternalLink className="w-3 h-3 inline" />
                      </a>{' '}
                      e crie ou selecione o seu projeto gratuito.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                    2
                  </span>
                  <div>
                    <h4 className="font-semibold text-white">Execute o Script SQL</h4>
                    <p className="text-slate-400 mt-0.5">
                      No menu lateral do Supabase, clique em <strong>SQL Editor</strong>, cole o código da aba <strong>Script SQL</strong> e clique no botão <strong>RUN</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                    3
                  </span>
                  <div>
                    <h4 className="font-semibold text-white">Copie as chaves de API</h4>
                    <p className="text-slate-400 mt-0.5">
                      Acesse <strong>Project Settings → API</strong>. Copie o <strong>Project URL</strong> e o <strong>Project API Key (anon/public)</strong> e cole aqui na aba de Credenciais.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                    4
                  </span>
                  <div>
                    <h4 className="font-semibold text-white">Pronto!</h4>
                    <p className="text-slate-400 mt-0.5">
                      Cada novo chamado aberto pelo Operador ou encerrado pelo Mecânico será automaticamente gravado na tabela <code>chamados</code> do seu Supabase.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-850 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-medium transition"
          >
            Fechar
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition shadow-lg shadow-emerald-900/40"
          >
            Salvar e Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};
