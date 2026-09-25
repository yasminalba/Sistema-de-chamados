import React from 'react';
import {
  X,
  Clock,
  MapPin,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  HardHat,
  ShieldCheck,
  Package,
  Calendar,
  AlertOctagon,
  ArrowRight,
} from 'lucide-react';
import { Chamado } from '../types';
import { useAuth } from '../context/AuthContext';

interface ChamadoDetailsModalProps {
  chamado: Chamado | null;
  isOpen: boolean;
  onClose: () => void;
  onIniciarAtendimento?: (id: string) => Promise<void>;
  onOpenEncerrar?: (chamado: Chamado) => void;
}

export const ChamadoDetailsModal: React.FC<ChamadoDetailsModalProps> = ({
  chamado,
  isOpen,
  onClose,
  onIniciarAtendimento,
  onOpenEncerrar,
}) => {
  const { currentUser } = useAuth();

  if (!isOpen || !chamado) return null;

  const isMecanico = currentUser?.role === 'mecanico';

  const formatData = (d?: string | null) => {
    if (!d) return '--';
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(d));
    } catch {
      return d;
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'urgente':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'alta':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'media':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'concluido':
        return {
          label: 'Concluído',
          class: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        };
      case 'em_atendimento':
        return {
          label: 'Em Atendimento',
          class: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        };
      default:
        return {
          label: 'Aberto (Pendente)',
          class: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        };
    }
  };

  const statusInfo = getStatusBadge(chamado.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-850 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-sm font-mono px-2.5 py-1 rounded-lg bg-slate-800 text-amber-400 font-bold border border-slate-700">
              OS #{chamado.numero}
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${statusInfo.class}`}
              >
                {statusInfo.label}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getPriorityBadge(
                  chamado.prioridade
                )}`}
              >
                Prioridade {chamado.prioridade}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Título & Equipamento */}
          <div>
            <h2 className="text-xl font-extrabold text-white leading-tight">
              {chamado.titulo}
            </h2>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-200 font-semibold bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60">
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                {chamado.equipamento}
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {chamado.setor}
              </span>
            </div>
          </div>

          {/* Timeline / Seção 1: Operador (Abertura) */}
          <div className="relative pl-6 border-l-2 border-sky-500/40 space-y-2">
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center text-slate-950">
              <HardHat className="w-2.5 h-2.5" />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                Relato do Operador (Abertura)
              </span>
              <span className="text-slate-400 flex items-center gap-1 font-mono text-[11px]">
                <Calendar className="w-3 h-3" />
                {formatData(chamado.data_abertura)}
              </span>
            </div>

            <div className="text-xs text-slate-300">
              Aberto por: <strong className="text-white">{chamado.operador_nome}</strong>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm whitespace-pre-line leading-relaxed">
              {chamado.descricao}
            </div>
          </div>

          {/* Seção 2: Atendimento pelo Mecânico */}
          {chamado.data_atendimento && (
            <div className="relative pl-6 border-l-2 border-blue-500/40 space-y-2">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <Clock className="w-2.5 h-2.5" />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-blue-400 uppercase tracking-wider">
                  Atendimento Iniciado
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  {formatData(chamado.data_atendimento)}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Mecânico responsável: <strong className="text-white">{chamado.mecanico_nome || 'Mecânico de Plantão'}</strong>
              </p>
            </div>
          )}

          {/* Seção 3: Encerramento pelo Mecânico */}
          {chamado.status === 'concluido' ? (
            <div className="relative pl-6 border-l-2 border-emerald-500/40 space-y-3">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950">
                <CheckCircle2 className="w-2.5 h-2.5" />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Laudo de Encerramento do Mecânico
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  {formatData(chamado.data_encerramento)}
                </span>
              </div>

              <div className="text-xs text-slate-300">
                Encerrado por: <strong className="text-emerald-300">{chamado.mecanico_nome}</strong>
              </div>

              {/* Descrição do que foi feito */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  O que foi feito / Solução Técnica:
                </label>
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-200 text-sm whitespace-pre-line leading-relaxed">
                  {chamado.solucao_tecnica}
                </div>
              </div>

              {/* Peças e Detalhes da Intervenção */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Peças Utilizadas
                  </span>
                  <strong className="text-slate-200 mt-0.5 block">
                    {chamado.pecas_utilizadas || 'Nenhuma'}
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Tempo de Parada
                  </span>
                  <strong className="text-amber-400 mt-0.5 block font-mono">
                    {chamado.tempo_parada_minutos ? `${chamado.tempo_parada_minutos} min` : 'N/A'}
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Causa Raiz
                  </span>
                  <strong className="text-slate-200 mt-0.5 block truncate">
                    {chamado.causa_raiz || 'Não especificada'}
                  </strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-850/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Chamado em aberto / aguardando conclusão do mecânico.</span>
              <span className="text-amber-400 font-mono">Status: {chamado.status}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-850 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-medium transition"
          >
            Fechar
          </button>

          {/* Action buttons if user is Mecanico */}
          {isMecanico && chamado.status === 'aberto' && onIniciarAtendimento && (
            <button
              onClick={() => {
                onIniciarAtendimento(chamado.id);
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition flex items-center gap-2 shadow-lg shadow-blue-900/30"
            >
              <Wrench className="w-4 h-4" />
              Iniciar Atendimento
            </button>
          )}

          {isMecanico && chamado.status === 'em_atendimento' && onOpenEncerrar && (
            <button
              onClick={() => {
                onClose();
                onOpenEncerrar(chamado);
              }}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-900/30"
            >
              <CheckCircle2 className="w-4 h-4" />
              Encerrar Chamado & Descrever Ações
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
