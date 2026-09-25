import React from 'react';
import {
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertOctagon,
  Wrench,
} from 'lucide-react';
import { Chamado } from '../types';

interface StatsBarProps {
  chamados: Chamado[];
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  chamados,
  selectedFilter,
  onSelectFilter,
}) => {
  const total = chamados.length;
  const abertos = chamados.filter((c) => c.status === 'aberto').length;
  const emAtendimento = chamados.filter((c) => c.status === 'em_atendimento').length;
  const concluidos = chamados.filter((c) => c.status === 'concluido').length;
  const urgentes = chamados.filter((c) => c.prioridade === 'urgente' && c.status !== 'concluido').length;

  const cards = [
    {
      id: 'todos',
      label: 'Total de Chamados',
      count: total,
      icon: FileText,
      color: 'text-slate-200',
      border: selectedFilter === 'todos' ? 'border-amber-500 bg-slate-800' : 'border-slate-800 bg-slate-900',
      badgeColor: 'bg-slate-800 text-slate-300',
    },
    {
      id: 'aberto',
      label: 'Aguardando Mecânico',
      count: abertos,
      icon: AlertCircle,
      color: 'text-amber-400',
      border: selectedFilter === 'aberto' ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800 bg-slate-900',
      badgeColor: 'bg-amber-500/20 text-amber-300',
    },
    {
      id: 'em_atendimento',
      label: 'Em Atendimento',
      count: emAtendimento,
      icon: Wrench,
      color: 'text-blue-400',
      border: selectedFilter === 'em_atendimento' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-900',
      badgeColor: 'bg-blue-500/20 text-blue-300',
    },
    {
      id: 'concluido',
      label: 'Chamados Encerrados',
      count: concluidos,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      border: selectedFilter === 'concluido' ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 bg-slate-900',
      badgeColor: 'bg-emerald-500/20 text-emerald-300',
    },
    {
      id: 'urgente',
      label: 'Paradas Urgentes',
      count: urgentes,
      icon: AlertOctagon,
      color: 'text-rose-400',
      border: selectedFilter === 'urgente' ? 'border-rose-500 bg-rose-500/10' : 'border-slate-800 bg-slate-900',
      badgeColor: 'bg-rose-500/20 text-rose-300',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.id}
            onClick={() => onSelectFilter(card.id)}
            className={`p-3.5 rounded-2xl border text-left transition duration-150 shadow-md hover:border-slate-600 flex flex-col justify-between ${card.border}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider line-clamp-1">
                {card.label}
              </span>
              <Icon className={`w-4 h-4 flex-shrink-0 ${card.color}`} />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className={`text-2xl font-black ${card.color}`}>
                {card.count}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${card.badgeColor}`}>
                {total > 0 ? `${Math.round((card.count / total) * 100)}%` : '0%'}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
