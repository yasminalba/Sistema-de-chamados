export type UserRole = 'operador' | 'mecanico';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  cargo: string;
  setor?: string;
}

export type Prioridade = 'baixa' | 'media' | 'alta' | 'urgente';

export type StatusChamado = 'aberto' | 'em_atendimento' | 'concluido' | 'cancelado';

export interface Chamado {
  id: string;
  numero: number;
  titulo: string;
  descricao: string;
  equipamento: string;
  setor: string;
  prioridade: Prioridade;
  status: StatusChamado;
  operador_id: string;
  operador_nome: string;
  mecanico_id?: string | null;
  mecanico_nome?: string | null;
  data_abertura: string;
  data_atendimento?: string | null;
  data_encerramento?: string | null;
  solucao_tecnica?: string | null;
  pecas_utilizadas?: string | null;
  tempo_parada_minutos?: number | null;
  causa_raiz?: string | null;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  connected: boolean;
}
