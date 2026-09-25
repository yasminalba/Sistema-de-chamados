import React from 'react';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { Prioridade, StatusChamado } from '../types';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  prioridadeFilter: string;
  onPrioridadeFilterChange: (prioridade: string) => void;
  onlyMyChamados: boolean;
  onToggleOnlyMyChamados: (val: boolean) => void;
  isOperador: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  prioridadeFilter,
  onPrioridadeFilterChange,
  onlyMyChamados,
  onToggleOnlyMyChamados,
  isOperador,
}) => {
  const hasActiveFilters =
    searchTerm ||
    statusFilter !== 'todos' ||
    prioridadeFilter !== 'todas' ||
    onlyMyChamados;

  const clearAll = () => {
    onSearchChange('');
    onStatusFilterChange('todos');
    onPrioridadeFilterChange('todas');
    onToggleOnlyMyChamados(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
      <div className="flex flex-col md:flex-row items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por título, máquina, setor, operador ou OS..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="w-full md:w-auto px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
          >
            <option value="todos">Todos os Status</option>
            <option value="aberto">Abertos</option>
            <option value="em_atendimento">Em Atendimento</option>
            <option value="concluido">Concluídos</option>
          </select>

          {/* Prioridade Dropdown */}
          <select
            value={prioridadeFilter}
            onChange={(e) => onPrioridadeFilterChange(e.target.value)}
            className="w-full md:w-auto px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
          >
            <option value="todas">Todas Prioridades</option>
            <option value="urgente">Urgente</option>
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>

          {/* Somente meus chamados checkbox */}
          <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer select-none text-xs text-slate-300 hover:text-white transition whitespace-nowrap">
            <input
              type="checkbox"
              checked={onlyMyChamados}
              onChange={(e) => onToggleOnlyMyChamados(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span>{isOperador ? 'Apenas meus chamados' : 'Meus atendimentos'}</span>
          </label>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-rose-400 hover:text-rose-300 hover:underline transition flex items-center gap-1 whitespace-nowrap self-end md:self-center"
          >
            <X className="w-3 h-3" />
            Limpar Filtros
          </button>
        )}
      </div>
    </div>
  );
};
