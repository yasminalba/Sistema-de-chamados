import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus,
  RefreshCw,
  HardHat,
  ShieldCheck,
  Wrench,
  AlertCircle,
  CheckCircle2,
  Database,
  Inbox,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { FilterBar } from './components/FilterBar';
import { ChamadoCard } from './components/ChamadoCard';
import { NovoChamadoModal } from './components/NovoChamadoModal';
import { EncerrarChamadoModal } from './components/EncerrarChamadoModal';
import { ChamadoDetailsModal } from './components/ChamadoDetailsModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { Chamado } from './types';
import {
  fetchAllChamados,
  insertChamado,
  updateChamadoStatus,
  getSavedConfig,
  getSupabaseClient,
} from './lib/supabase';

function MainDashboard() {
  const { currentUser, switchUser } = useAuth();

  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataSource, setDataSource] = useState<'supabase' | 'local'>('local');

  // Modals state
  const [isNovoChamadoOpen, setIsNovoChamadoOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [selectedChamadoDetails, setSelectedChamadoDetails] = useState<Chamado | null>(null);
  const [chamadoParaEncerrar, setChamadoParaEncerrar] = useState<Chamado | null>(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [prioridadeFilter, setPrioridadeFilter] = useState('todas');
  const [onlyMyChamados, setOnlyMyChamados] = useState(false);

  // Notification Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const isSupabaseConfigured = useMemo(() => {
    const config = getSavedConfig();
    return Boolean(config.url && config.anonKey);
  }, [dataSource, isSupabaseModalOpen]);

  // Carrega os chamados
  const carregarChamados = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setIsRefreshing(true);
    try {
      const res = await fetchAllChamados();
      setChamados(res.chamados);
      setDataSource(res.source);
    } catch (e: any) {
      console.error('Erro ao carregar chamados:', e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    carregarChamados();
  }, [carregarChamados]);

  // Handler: Operador cria chamado
  const handleCriarChamado = async (novoData: Omit<Chamado, 'id' | 'numero'>) => {
    const res = await insertChamado(novoData);
    if (res.success) {
      setChamados((prev) => [res.chamado, ...prev]);
      const destino = res.source === 'supabase' ? 'no Supabase' : 'localmente';
      showToast(`Chamado #${res.chamado.numero} aberto com sucesso ${destino}!`, 'success');
      carregarChamados(true);
    } else {
      showToast(res.error || 'Erro ao criar chamado.', 'error');
    }
  };

  // Handler: Mecânico inicia atendimento
  const handleIniciarAtendimento = async (id: string) => {
    if (!currentUser) return;
    const res = await updateChamadoStatus(id, {
      status: 'em_atendimento',
      mecanico_id: currentUser.id,
      mecanico_nome: `${currentUser.name} (Mecânico)`,
      data_atendimento: new Date().toISOString(),
    });

    if (res.success) {
      setChamados((prev) =>
        prev.map((c) => (c.id === id ? res.updated : c))
      );
      if (selectedChamadoDetails?.id === id) {
        setSelectedChamadoDetails(res.updated);
      }
      showToast(`Atendimento iniciado na OS #${res.updated.numero}!`, 'info');
      carregarChamados(true);
    }
  };

  // Handler: Mecânico encerra chamado
  const handleConfirmarEncerramento = async (
    id: string,
    dadosEncerramento: {
      solucao_tecnica: string;
      pecas_utilizadas: string;
      tempo_parada_minutos: number;
      causa_raiz: string;
      mecanico_id: string;
      mecanico_nome: string;
    }
  ) => {
    const res = await updateChamadoStatus(id, {
      status: 'concluido',
      solucao_tecnica: dadosEncerramento.solucao_tecnica,
      pecas_utilizadas: dadosEncerramento.pecas_utilizadas,
      tempo_parada_minutos: dadosEncerramento.tempo_parada_minutos,
      causa_raiz: dadosEncerramento.causa_raiz,
      mecanico_id: dadosEncerramento.mecanico_id,
      mecanico_nome: dadosEncerramento.mecanico_nome,
      data_encerramento: new Date().toISOString(),
    });

    if (res.success) {
      setChamados((prev) =>
        prev.map((c) => (c.id === id ? res.updated : c))
      );
      if (selectedChamadoDetails?.id === id) {
        setSelectedChamadoDetails(res.updated);
      }
      const destino = res.source === 'supabase' ? 'no Supabase' : 'localmente';
      showToast(`OS #${res.updated.numero} encerrada e salva ${destino}!`, 'success');
      carregarChamados(true);
    }
  };

  // Filtragem
  const isOperador = currentUser?.role === 'operador';
  const isMecanico = currentUser?.role === 'mecanico';

  const chamadosFiltrados = useMemo(() => {
    return chamados.filter((c) => {
      // Busca textual
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesText =
          c.titulo.toLowerCase().includes(query) ||
          c.equipamento.toLowerCase().includes(query) ||
          c.setor.toLowerCase().includes(query) ||
          c.descricao.toLowerCase().includes(query) ||
          c.operador_nome.toLowerCase().includes(query) ||
          (c.mecanico_nome && c.mecanico_nome.toLowerCase().includes(query)) ||
          `#${c.numero}`.includes(query) ||
          String(c.numero).includes(query);

        if (!matchesText) return false;
      }

      // Filtro de Status
      if (statusFilter !== 'todos') {
        if (c.status !== statusFilter) return false;
      }

      // Filtro de Prioridade
      if (prioridadeFilter !== 'todas') {
        if (c.prioridade !== prioridadeFilter) return false;
      }

      // Filtro "Meus chamados"
      if (onlyMyChamados && currentUser) {
        if (isOperador) {
          // Chamados criados pelo operador logado
          if (!c.operador_nome.includes(currentUser.name) && c.operador_id !== currentUser.id) {
            return false;
          }
        } else if (isMecanico) {
          // Chamados atendidos pelo mecânico logado
          if (c.mecanico_id !== currentUser.id && (!c.mecanico_nome || !c.mecanico_nome.includes(currentUser.name))) {
            return false;
          }
        }
      }

      return true;
    });
  }, [chamados, searchTerm, statusFilter, prioridadeFilter, onlyMyChamados, currentUser, isOperador, isMecanico]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border text-xs sm:text-sm font-semibold backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                : 'bg-blue-950/90 border-blue-500/50 text-blue-200'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
            {toast.type === 'info' && <Clock className="w-5 h-5 text-blue-400" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <Header
        onOpenSupabaseConfig={() => {
          setIsNovoChamadoOpen(false);
          setIsSupabaseModalOpen(true);
        }}
        isSupabaseConfigured={isSupabaseConfigured}
        onOpenNovoChamado={() => setIsNovoChamadoOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner do Papel do Usuário (Operador vs Mecânico) */}
        <div
          className={`p-5 rounded-3xl border transition shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
            isOperador
              ? 'bg-gradient-to-r from-sky-950/60 via-slate-900 to-slate-900 border-sky-500/30'
              : 'bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border-amber-500/30'
          }`}
        >
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 shadow-lg ${
                isOperador
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}
            >
              {isOperador ? <HardHat className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  Perfil Atual
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {currentUser?.name} — {currentUser?.cargo}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                {isOperador
                  ? 'Como Operador, abra chamados técnicos com informações descritivas detalhadas para agilizar o reparo das máquinas.'
                  : 'Como Mecânico, acompanhe os chamados abertos, inicie o atendimento e encerre descrevendo detalhadamente o que foi feito.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {isOperador && (
              <button
                onClick={() => setIsNovoChamadoOpen(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-900/40 transition transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Abrir Novo Chamado
              </button>
            )}

            {isMecanico && (
              <div className="text-right text-xs bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Chamados Aguardando:</span>
                <span className="text-amber-400 font-extrabold text-sm">
                  {chamados.filter((c) => c.status === 'aberto').length} na fila
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Supabase Status Banner if in Local Mode */}
        {!isSupabaseConfigured && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 flex-shrink-0 text-amber-400" />
              <span>
                <strong>Modo Local Ativo:</strong> Seus chamados estão sendo guardados no navegador. O sistema está 100% pronto para conectar ao seu banco Supabase.
              </span>
            </div>
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 self-end sm:self-center"
            >
              Conectar Supabase agora &rarr;
            </button>
          </div>
        )}

        {/* Stats KPIs Bar */}
        <StatsBar
          chamados={chamados}
          selectedFilter={statusFilter}
          onSelectFilter={(f) => {
            if (f === 'urgente') {
              setStatusFilter('todos');
              setPrioridadeFilter('urgente');
            } else {
              setStatusFilter(f);
              if (prioridadeFilter === 'urgente') setPrioridadeFilter('todas');
            }
          }}
        />

        {/* Filters */}
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          prioridadeFilter={prioridadeFilter}
          onPrioridadeFilterChange={setPrioridadeFilter}
          onlyMyChamados={onlyMyChamados}
          onToggleOnlyMyChamados={setOnlyMyChamados}
          isOperador={isOperador}
        />

        {/* Chamados Grid Header */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>
              Exibindo <strong>{chamadosFiltrados.length}</strong> de <strong>{chamados.length}</strong> chamados
            </span>
            {dataSource === 'supabase' && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
                Sincronizado Supabase
              </span>
            )}
          </div>

          <button
            onClick={() => carregarChamados(false)}
            disabled={isRefreshing}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-800 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>

        {/* Chamados Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
            <p className="text-sm text-slate-400">Carregando chamados técnicos...</p>
          </div>
        ) : chamadosFiltrados.length === 0 ? (
          <div className="py-16 text-center bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
              <Inbox className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Nenhum chamado encontrado</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Não há ordens de serviço correspondentes aos filtros aplicados.
              </p>
            </div>
            {isOperador && (
              <button
                onClick={() => setIsNovoChamadoOpen(true)}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Abrir o primeiro chamado
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chamadosFiltrados.map((chamado) => (
              <ChamadoCard
                key={chamado.id}
                chamado={chamado}
                onViewDetails={(c) => setSelectedChamadoDetails(c)}
                onIniciarAtendimento={handleIniciarAtendimento}
                onEncerrar={(c) => setChamadoParaEncerrar(c)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <NovoChamadoModal
        isOpen={isNovoChamadoOpen}
        onClose={() => setIsNovoChamadoOpen(false)}
        onSubmit={handleCriarChamado}
      />

      <EncerrarChamadoModal
        chamado={chamadoParaEncerrar}
        isOpen={Boolean(chamadoParaEncerrar)}
        onClose={() => setChamadoParaEncerrar(null)}
        onConfirm={handleConfirmarEncerramento}
      />

      <ChamadoDetailsModal
        chamado={selectedChamadoDetails}
        isOpen={Boolean(selectedChamadoDetails)}
        onClose={() => setSelectedChamadoDetails(null)}
        onIniciarAtendimento={handleIniciarAtendimento}
        onOpenEncerrar={(c) => {
          setSelectedChamadoDetails(null);
          setChamadoParaEncerrar(c);
        }}
      />

      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConfigSaved={() => {
          carregarChamados(false);
          showToast('Configurações do Supabase atualizadas!', 'success');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { currentUser } = useAuth();
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  const isSupabaseConfigured = useMemo(() => {
    const config = getSavedConfig();
    return Boolean(config.url && config.anonKey);
  }, [isSupabaseModalOpen]);

  if (!currentUser) {
    return (
      <>
        <LoginPage
          onOpenSupabaseConfig={() => setIsSupabaseModalOpen(true)}
          isSupabaseConfigured={isSupabaseConfigured}
        />
        <SupabaseConfigModal
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
          onConfigSaved={() => {}}
        />
      </>
    );
  }

  return <MainDashboard />;
}
