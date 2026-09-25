import React from 'react';
import {
  Clock,
  Wrench,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  HardHat,
  ShieldCheck,
  ChevronRight,
  AlertOctagon,
  ArrowRight,
} from 'lucide-react';
import { Chamado } from '../types';
import { useAuth } from '../context/AuthContext';

interface ChamadoCardProps {
  chamado: Chamado;
  onViewDetails: (chamado: Chamado) => void;
  onIniciarAtendimento?: (id: string) => Promise<void>;
  onEncerrar?: (chamado: Chamado) => void;
}

export const ChamadoCard: React.FC<ChamadoCardProps> = ({
  chamado,
  onViewDetails,
  onIniciarAtendimento,
  onEncerrar,
}) => {
  const { currentUser } = useAuth();
  const isMecanico = currentUser?.role === 'mecanico';

  const formatRelativeTime = (isoString?: string | null) => {
    if (!isoString) return '';
    try {
      const diffMin = Math.round((Date.now() - new Date(isoString).getTime()) / 60000);
      if (diffMin < 1) return 'Agora mesmo';
      if (diffMin < 60) return `Há ${diffMin} min`;
      const diffHoras = Math.floor(diffMin / 60);
      if (diffHoras < 24) return `Há ${diffHoras}h ${diffMin % 60}m`;
      const diffDias = Math.floor(diffHoras / 24);
      return `Há ${diffDias}d`;
    } catch {
      return '';
    }
  };

  const getPriorityClasses = (p: string) => {
    switch (p) {
      case 'urgente':
        return {
          pill: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
          indicator: 'bg-rose-500',
          cardBorder: 'hover:border-rose-500/50',
        };
      case 'alta':
        return {
          pill: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
          indicator: 'bg-amber-500',
          cardBorder: 'hover:border-amber-500/50',
        };
      case 'media':
        return {
          pill: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
          indicator: 'bg-sky-500',
          cardBorder: 'hover:border-sky-500/50',
        };
      default:
        return {
          pill: 'bg-slate-700/50 text-slate-300 border-slate-600',
          indicator: 'bg-slate-500',
          cardBorder: 'hover:border-slate-600',
        };
    }
  };

  const priorityStyle = getPriorityClasses(chamado.prioridade);

  return (
    <div
      className={`bg-slate-900 border border-slate-800 rounded-2xl p-5 transition duration-200 shadow-lg flex flex-col justify-between group ${priorityStyle.cardBorder}`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
              #{chamado.numero}
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1 ${priorityStyle.pill}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.indicator}`} />
              {chamado.prioridade}
            </span>
          </div>

          {/* Status Badge */}
          {chamado.status === 'aberto' && (
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Aberto
            </span>
          )}
          {chamado.status === 'em_atendimento' && (
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Em Atendimento
            </span>
          )}
          {chamado.status === 'concluido' && (
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Concluído
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          onClick={() => onViewDetails(chamado)}
          className="text-base font-bold text-white group-hover:text-amber-300 transition cursor-pointer line-clamp-2"
        >
          {chamado.titulo}
        </h3>

        {/* Equipment & Sector */}
        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-400">
          <span className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-md border border-slate-800 text-slate-300">
            <Wrench className="w-3 h-3 text-amber-400" />
            <span className="truncate max-w-[180px]">{chamado.equipamento}</span>
          </span>
          <span className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-md border border-slate-800 text-slate-400">
            <MapPin className="w-3 h-3 text-slate-500" />
            <span className="truncate max-w-[140px]">{chamado.setor}</span>
          </span>
        </div>

        {/* Operator's Description Snippet */}
        <p className="mt-3 text-xs text-slate-400 line-clamp-2 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-slate-500 font-medium">Relato: </span>
          {chamado.descricao}
        </p>

        {/* If concluded: show mechanic's solution snippet */}
        {chamado.status === 'concluido' && chamado.solucao_tecnica && (
          <div className="mt-2.5 text-xs bg-emerald-950/20 border border-emerald-500/30 p-2.5 rounded-xl text-emerald-300">
            <div className="flex items-center gap-1 font-semibold text-[11px] text-emerald-400 mb-0.5">
              <ShieldCheck className="w-3 h-3" />
              Solução do Mecânico ({chamado.mecanico_nome}):
            </div>
            <p className="line-clamp-2 text-slate-300">{chamado.solucao_tecnica}</p>
          </div>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatRelativeTime(chamado.data_abertura)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Action button for mechanic */}
          {isMecanico && chamado.status === 'aberto' && onIniciarAtendimento && (
            <button
              onClick={() => onIniciarAtendimento(chamado.id)}
              className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition flex items-center gap-1 shadow-sm"
            >
              <Wrench className="w-3 h-3" />
              Atender
            </button>
          )}

          {isMecanico && chamado.status === 'em_atendimento' && onEncerrar && (
            <button
              onClick={() => onEncerrar(chamado)}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center gap-1 shadow-sm"
            >
              <CheckCircle2 className="w-3 h-3" />
              Encerrar
            </button>
          )}

          <button
            onClick={() => onViewDetails(chamado)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs transition flex items-center gap-1"
          >
            Ver Detalhes
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
