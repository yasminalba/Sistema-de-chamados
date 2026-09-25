import React, { useState } from 'react';
import {
  X,
  AlertOctagon,
  Wrench,
  Tag,
  MapPin,
  FileText,
  AlertTriangle,
  CheckCircle2,
  HardHat,
} from 'lucide-react';
import { Prioridade, Chamado } from '../types';
import { EQUIPAMENTOS_SUGERIDOS, SETORES_SUGERIDOS } from '../data/initialData';
import { useAuth } from '../context/AuthContext';

interface NovoChamadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (chamadoData: Omit<Chamado, 'id' | 'numero'>) => Promise<void>;
}

export const NovoChamadoModal: React.FC<NovoChamadoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { currentUser } = useAuth();

  const [titulo, setTitulo] = useState('');
  const [equipamento, setEquipamento] = useState('');
  const [setor, setSetor] = useState('');
  const [prioridade, setPrioridade] = useState<Prioridade>('alta');
  const [descricao, setDescricao] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erro, setErro] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!titulo.trim()) {
      setErro('Informe o título do problema.');
      return;
    }
    if (!equipamento.trim()) {
      setErro('Informe o equipamento ou máquina com defeito.');
      return;
    }
    if (!descricao.trim() || descricao.trim().length < 10) {
      setErro('A descrição do operador deve ter ao menos 10 caracteres detalhando a falha.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        titulo: titulo.trim(),
        equipamento: equipamento.trim(),
        setor: setor.trim() || 'Linha Geral de Produção',
        prioridade,
        descricao: descricao.trim(),
        status: 'aberto',
        operador_id: currentUser?.id || 'operador-1',
        operador_nome: `${currentUser?.name || 'Operador'} (${currentUser?.cargo || 'Operador'})`,
        data_abertura: new Date().toISOString(),
      });

      // Limpa os campos
      setTitulo('');
      setEquipamento('');
      setSetor('');
      setDescricao('');
      setPrioridade('alta');
      onClose();
    } catch (e: any) {
      setErro(e.message || 'Erro ao abrir chamado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-850 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Abertura de Chamado Técnico
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-medium">
                  Área do Operador
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Operador: <strong className="text-slate-300">{currentUser?.name}</strong>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {erro && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{erro}</span>
            </div>
          )}

          {/* Título */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Título do Problema *
            </label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Vazamento de óleo sob alta pressão no cabeçote"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
            />
          </div>

          {/* Equipamento & Setor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Equipamento / Máquina *
              </label>
              <input
                type="text"
                list="equipamentos-list"
                required
                value={equipamento}
                onChange={(e) => setEquipamento(e.target.value)}
                placeholder="Selecione ou digite..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
              />
              <datalist id="equipamentos-list">
                {EQUIPAMENTOS_SUGERIDOS.map((eq) => (
                  <option key={eq} value={eq} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Setor / Localização
              </label>
              <input
                type="text"
                list="setores-list"
                value={setor}
                onChange={(e) => setSetor(e.target.value)}
                placeholder="Ex: Usinagem, Linha 01..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
              />
              <datalist id="setores-list">
                {SETORES_SUGERIDOS.map((st) => (
                  <option key={st} value={st} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Prioridade */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Grau de Prioridade *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPrioridade('baixa')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${
                  prioridade === 'baixa'
                    ? 'bg-slate-700/80 border-slate-400 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Baixa</span>
                <span className="text-[10px] font-normal text-slate-400">Pode esperar</span>
              </button>

              <button
                type="button"
                onClick={() => setPrioridade('media')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${
                  prioridade === 'media'
                    ? 'bg-sky-500/20 border-sky-400 text-sky-200 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Média</span>
                <span className="text-[10px] font-normal text-slate-400">Falha moderada</span>
              </button>

              <button
                type="button"
                onClick={() => setPrioridade('alta')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${
                  prioridade === 'alta'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Alta</span>
                <span className="text-[10px] font-normal text-slate-400">Risco iminente</span>
              </button>

              <button
                type="button"
                onClick={() => setPrioridade('urgente')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1 ${
                  prioridade === 'urgente'
                    ? 'bg-rose-500/20 border-rose-400 text-rose-200 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="flex items-center gap-1">
                  <AlertOctagon className="w-3 h-3 text-rose-400" />
                  Urgente
                </span>
                <span className="text-[10px] font-normal text-rose-300">Máquina parada</span>
              </button>
            </div>
          </div>

          {/* Descrição Detalhada */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Informações Descritivas da Falha *
              </label>
              <span className="text-[11px] text-slate-500">
                Seja o mais específico possível
              </span>
            </div>
            <textarea
              required
              rows={4}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva detalhadamente o que aconteceu: sintomas, ruídos anormais, fumaça, vazamento, mensagem no painel digital, hora aproximada do início da falha..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
            />
          </div>

          {/* Informações adicionais do Operador */}
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Notificação enviada imediatamente para a equipe de mecânicos
            </span>
            <span className="font-mono text-slate-500">Status inicial: Aberto</span>
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
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold transition shadow-lg shadow-sky-900/40 flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>Salvando Chamado...</>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Abrir Chamado Técnico
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
