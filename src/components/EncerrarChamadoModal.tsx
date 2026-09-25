import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Wrench,
  Clock,
  Package,
  AlertTriangle,
  HelpCircle,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';
import { Chamado } from '../types';
import { useAuth } from '../context/AuthContext';

interface EncerrarChamadoModalProps {
  chamado: Chamado | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    id: string,
    dadosEncerramento: {
      solucao_tecnica: string;
      pecas_utilizadas: string;
      tempo_parada_minutos: number;
      causa_raiz: string;
      mecanico_id: string;
      mecanico_nome: string;
    }
  ) => Promise<void>;
}

export const EncerrarChamadoModal: React.FC<EncerrarChamadoModalProps> = ({
  chamado,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { currentUser } = useAuth();

  const [solucao, setSolucao] = useState('');
  const [pecas, setPecas] = useState('');
  const [tempoMinutos, setTempoMinutos] = useState<number>(45);
  const [causaRaiz, setCausaRaiz] = useState('Desgaste Natural de Componentes');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erro, setErro] = useState('');

  if (!isOpen || !chamado) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!solucao.trim() || solucao.trim().length < 10) {
      setErro('A descrição do que foi feito pelo mecânico é obrigatória (mínimo 10 caracteres).');
      return;
    }

    try {
      setIsSubmitting(true);
      await onConfirm(chamado.id, {
        solucao_tecnica: solucao.trim(),
        pecas_utilizadas: pecas.trim() || 'Nenhuma peça substituída (apenas ajuste/lubrificação)',
        tempo_parada_minutos: Number(tempoMinutos) || 0,
        causa_raiz: causaRaiz,
        mecanico_id: currentUser?.id || 'mecanico-1',
        mecanico_nome: `${currentUser?.name || 'Mecânico'} (Manutenção)`,
      });

      // Limpa e fecha
      setSolucao('');
      setPecas('');
      setTempoMinutos(45);
      onClose();
    } catch (e: any) {
      setErro(e.message || 'Falha ao encerrar o chamado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const setTempoRapido = (min: number) => {
    setTempoMinutos(min);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-850 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Encerramento de Chamado
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  OS #{chamado.numero}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Mecânico Responsável: <strong className="text-slate-300">{currentUser?.name}</strong>
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

        {/* Resumo do chamado em atendimento */}
        <div className="bg-slate-950/60 px-6 py-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-400">Equipamento: </span>
            <strong className="text-slate-200">{chamado.equipamento}</strong>
          </div>
          <div>
            <span className="text-slate-400">Aberto por: </span>
            <span className="text-slate-300">{chamado.operador_nome}</span>
          </div>
          <div className="w-full text-slate-400 italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-[11px]">
            &quot;{chamado.descricao}&quot;
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {erro && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{erro}</span>
            </div>
          )}

          {/* O que foi feito / Solução Técnica (CRÍTICO) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-4 h-4" />
                Descreva detalhadamente o que foi feito *
              </label>
              <span className="text-[11px] text-slate-500">
                Laudo do Mecânico
              </span>
            </div>
            <textarea
              required
              rows={4}
              value={solucao}
              onChange={(e) => setSolucao(e.target.value)}
              placeholder="Descreva todo o procedimento executado: desmontagem, reparo realizado, testes elétricos/mecânicos, alinhamento, lubrificação, calibragem e liberação da máquina para a produção..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
            />
          </div>

          {/* Peças e Materiais Utilizados */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-amber-400" />
              Peças / Materiais Utilizados
            </label>
            <input
              type="text"
              value={pecas}
              onChange={(e) => setPecas(e.target.value)}
              placeholder="Ex: Rolamento blindado 6204, Retentor de borracha nitrílica, 500ml Óleo ISO 68..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tempo de Parada / Intervenção */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                Tempo de Intervenção (minutos)
              </label>
              <input
                type="number"
                min="1"
                required
                value={tempoMinutos}
                onChange={(e) => setTempoMinutos(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 font-mono"
              />
              <div className="flex gap-1.5 mt-2">
                {[15, 30, 45, 60, 120].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTempoRapido(t)}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    {t >= 60 ? `${t / 60}h` : `${t}min`}
                  </button>
                ))}
              </div>
            </div>

            {/* Diagnóstico / Causa Raiz */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Causa Raiz Identificada
              </label>
              <select
                value={causaRaiz}
                onChange={(e) => setCausaRaiz(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="Desgaste Natural de Componentes">Desgaste Natural de Componentes</option>
                <option value="Falta ou Inadequação de Lubrificação">Falta ou Inadequação de Lubrificação</option>
                <option value="Fadiga Mecânica / Sobrecarga">Fadiga Mecânica / Sobrecarga</option>
                <option value="Falha Elétrica / Eletrônica">Falha Elétrica / Eletrônica</option>
                <option value="Desalinhamento ou Folga Estrutural">Desalinhamento ou Folga Estrutural</option>
                <option value="Operação Inadequada / Erro Operacional">Operação Inadequada / Erro Operacional</option>
                <option value="Contaminação por Cavaco/Poeira">Contaminação por Cavaco/Poeira</option>
              </select>
            </div>
          </div>

          {/* Footer note */}
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              O chamado será marcado como <strong>CONCLUÍDO</strong> e a máquina liberada
            </span>
            <span className="font-mono text-emerald-400">Status: Concluído</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition shadow-lg shadow-emerald-900/40 flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>Gravando Encerramento...</>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Encerrar Chamado Técnico
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
