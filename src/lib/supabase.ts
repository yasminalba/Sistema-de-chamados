import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Chamado } from '../types';
import { INITIAL_CHAMADOS } from '../data/initialData';

const STORAGE_KEY_CONFIG = 'techchamados_supabase_config';
const STORAGE_KEY_CHAMADOS = 'techchamados_local_chamados';

let supabaseInstance: SupabaseClient | null = null;

export interface SupabaseSettings {
  url: string;
  anonKey: string;
}

export function getSavedConfig(): SupabaseSettings {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  try {
    const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        url: parsed.url || envUrl,
        anonKey: parsed.anonKey || envKey,
      };
    }
  } catch (e) {
    console.error('Erro ao ler config do Supabase do localStorage', e);
  }

  return {
    url: envUrl,
    anonKey: envKey,
  };
}

export function saveConfig(url: string, anonKey: string): void {
  const trimmedUrl = url.trim();
  const trimmedKey = anonKey.trim();

  localStorage.setItem(
    STORAGE_KEY_CONFIG,
    JSON.stringify({ url: trimmedUrl, anonKey: trimmedKey })
  );

  if (trimmedUrl && trimmedKey) {
    try {
      supabaseInstance = createClient(trimmedUrl, trimmedKey);
    } catch (e) {
      console.error('Falha ao instanciar Supabase Client', e);
      supabaseInstance = null;
    }
  } else {
    supabaseInstance = null;
  }
}

export function clearConfig(): void {
  localStorage.removeItem(STORAGE_KEY_CONFIG);
  supabaseInstance = null;
}

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const config = getSavedConfig();
  if (config.url && config.anonKey) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey);
      return supabaseInstance;
    } catch (e) {
      console.error('Erro ao inicializar Supabase:', e);
      return null;
    }
  }
  return null;
}

// Inicializa chamados locais se não existirem
function getLocalChamados(): Chamado[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_CHAMADOS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Erro ao carregar chamados locais', e);
  }
  // Primeiro acesso: grava dados iniciais
  localStorage.setItem(STORAGE_KEY_CHAMADOS, JSON.stringify(INITIAL_CHAMADOS));
  return INITIAL_CHAMADOS;
}

function saveLocalChamados(chamados: Chamado[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CHAMADOS, JSON.stringify(chamados));
  } catch (e) {
    console.error('Erro ao salvar chamados locais', e);
  }
}

// Testa a conexão com o Supabase e verifica a tabela chamados
export async function testConnection(
  url: string,
  anonKey: string
): Promise<{ success: boolean; message: string; tableReady?: boolean }> {
  try {
    if (!url || !anonKey) {
      return { success: false, message: 'URL e Chave Anon são obrigatórias.' };
    }
    const testClient = createClient(url.trim(), anonKey.trim());
    
    // Tenta consultar a tabela chamados
    const { data, error } = await testClient.from('chamados').select('id').limit(1);

    if (error) {
      // Se o erro for de tabela não encontrada
      if (error.code === '42P01' || error.message.includes('relation "chamados" does not exist') || error.message.includes('does not exist')) {
        return {
          success: true,
          tableReady: false,
          message: 'Conectou ao Supabase com sucesso, mas a tabela "chamados" ainda não foi criada. Copie e execute o script SQL disponibilizado!',
        };
      }
      return {
        success: false,
        message: `Erro do Supabase: ${error.message} (Código: ${error.code || 'N/A'})`,
      };
    }

    return {
      success: true,
      tableReady: true,
      message: 'Conexão estabelecida com sucesso e tabela "chamados" pronta para uso!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Falha na requisição: ${err.message || 'Verifique a URL e a internet.'}`,
    };
  }
}

// Buscar chamados (Supabase com fallback para LocalStorage)
export async function fetchAllChamados(): Promise<{ chamados: Chamado[]; source: 'supabase' | 'local'; error?: string }> {
  const client = getSupabaseClient();

  if (client) {
    try {
      const { data, error } = await client
        .from('chamados')
        .select('*')
        .order('numero', { ascending: false });

      if (error) {
        console.warn('Erro ao consultar Supabase, usando dados locais temporariamente:', error.message);
        return {
          chamados: getLocalChamados(),
          source: 'local',
          error: `Aviso Supabase: ${error.message}`,
        };
      }

      if (data) {
        // Mapeia caso as colunas venham em snake_case
        const mapped: Chamado[] = data.map((item: any) => ({
          id: String(item.id),
          numero: Number(item.numero || 1),
          titulo: item.titulo || '',
          descricao: item.descricao || '',
          equipamento: item.equipamento || '',
          setor: item.setor || '',
          prioridade: item.prioridade || 'media',
          status: item.status || 'aberto',
          operador_id: item.operador_id || 'operador',
          operador_nome: item.operador_nome || 'Operador',
          mecanico_id: item.mecanico_id || null,
          mecanico_nome: item.mecanico_nome || null,
          data_abertura: item.data_abertura || item.created_at || new Date().toISOString(),
          data_atendimento: item.data_atendimento || null,
          data_encerramento: item.data_encerramento || item.closed_at || null,
          solucao_tecnica: item.solucao_tecnica || null,
          pecas_utilizadas: item.pecas_utilizadas || null,
          tempo_parada_minutos: item.tempo_parada_minutos !== null ? Number(item.tempo_parada_minutos) : null,
          causa_raiz: item.causa_raiz || null,
        }));

        // Atualiza cache local para redundância
        saveLocalChamados(mapped);
        return { chamados: mapped, source: 'supabase' };
      }
    } catch (err: any) {
      console.warn('Exceção ao buscar do Supabase:', err);
    }
  }

  return { chamados: getLocalChamados(), source: 'local' };
}

// Inserir novo chamado
export async function insertChamado(
  novo: Omit<Chamado, 'id' | 'numero'>
): Promise<{ success: boolean; chamado: Chamado; source: 'supabase' | 'local'; error?: string }> {
  const localList = getLocalChamados();
  const proximoNumero = localList.length > 0 ? Math.max(...localList.map((c) => c.numero || 0)) + 1 : 101;
  const localId = `chamado-${Date.now()}`;

  const chamadoCriado: Chamado = {
    ...novo,
    id: localId,
    numero: proximoNumero,
  };

  const client = getSupabaseClient();

  if (client) {
    try {
      const payload = {
        numero: proximoNumero,
        titulo: novo.titulo,
        descricao: novo.descricao,
        equipamento: novo.equipamento,
        setor: novo.setor,
        prioridade: novo.prioridade,
        status: novo.status,
        operador_id: novo.operador_id,
        operador_nome: novo.operador_nome,
        data_abertura: novo.data_abertura,
      };

      const { data, error } = await client.from('chamados').insert([payload]).select().single();

      if (error) {
        console.error('Erro ao salvar chamado no Supabase:', error);
        // Salva localmente para não perder o chamado
        saveLocalChamados([chamadoCriado, ...localList]);
        return {
          success: true,
          chamado: chamadoCriado,
          source: 'local',
          error: `Salvo localmente (Supabase recusou: ${error.message})`,
        };
      }

      if (data) {
        const item = data as any;
        const chamadoSupabase: Chamado = {
          ...chamadoCriado,
          id: String(item.id),
          numero: Number(item.numero || proximoNumero),
        };
        saveLocalChamados([chamadoSupabase, ...localList.filter((c) => c.id !== localId)]);
        return { success: true, chamado: chamadoSupabase, source: 'supabase' };
      }
    } catch (e: any) {
      console.error('Falha de rede ao inserir no Supabase:', e);
    }
  }

  // Fallback LocalStorage
  saveLocalChamados([chamadoCriado, ...localList]);
  return { success: true, chamado: chamadoCriado, source: 'local' };
}

// Atualizar chamado existente (ex: iniciar atendimento ou encerrar)
export async function updateChamadoStatus(
  id: string,
  updates: Partial<Chamado>
): Promise<{ success: boolean; updated: Chamado; source: 'supabase' | 'local'; error?: string }> {
  const localList = getLocalChamados();
  const index = localList.findIndex((c) => c.id === id);

  const updatedChamado: Chamado = index !== -1
    ? { ...localList[index], ...updates }
    : ({ id, ...updates } as Chamado);

  if (index !== -1) {
    localList[index] = updatedChamado;
    saveLocalChamados(localList);
  }

  const client = getSupabaseClient();
  if (client) {
    try {
      const payload: any = {};
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.mecanico_id !== undefined) payload.mecanico_id = updates.mecanico_id;
      if (updates.mecanico_nome !== undefined) payload.mecanico_nome = updates.mecanico_nome;
      if (updates.data_atendimento !== undefined) payload.data_atendimento = updates.data_atendimento;
      if (updates.data_encerramento !== undefined) payload.data_encerramento = updates.data_encerramento;
      if (updates.solucao_tecnica !== undefined) payload.solucao_tecnica = updates.solucao_tecnica;
      if (updates.pecas_utilizadas !== undefined) payload.pecas_utilizadas = updates.pecas_utilizadas;
      if (updates.tempo_parada_minutos !== undefined) payload.tempo_parada_minutos = updates.tempo_parada_minutos;
      if (updates.causa_raiz !== undefined) payload.causa_raiz = updates.causa_raiz;

      const { data, error } = await client
        .from('chamados')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.warn('Supabase update falhou, mantido local:', error.message);
        return { success: true, updated: updatedChamado, source: 'local', error: error.message };
      }

      return { success: true, updated: updatedChamado, source: 'supabase' };
    } catch (e: any) {
      console.warn('Erro de rede ao atualizar no Supabase:', e);
    }
  }

  return { success: true, updated: updatedChamado, source: 'local' };
}

// Sincronizar todos os chamados locais para o Supabase
export async function syncLocalToSupabase(): Promise<{ syncedCount: number; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { syncedCount: 0, error: 'Supabase não está configurado.' };
  }

  const localList = getLocalChamados();
  if (localList.length === 0) {
    return { syncedCount: 0 };
  }

  try {
    const payload = localList.map((c) => ({
      numero: c.numero,
      titulo: c.titulo,
      descricao: c.descricao,
      equipamento: c.equipamento,
      setor: c.setor,
      prioridade: c.prioridade,
      status: c.status,
      operador_id: c.operador_id,
      operador_nome: c.operador_nome,
      mecanico_id: c.mecanico_id || null,
      mecanico_nome: c.mecanico_nome || null,
      data_abertura: c.data_abertura,
      data_atendimento: c.data_atendimento || null,
      data_encerramento: c.data_encerramento || null,
      solucao_tecnica: c.solucao_tecnica || null,
      pecas_utilizadas: c.pecas_utilizadas || null,
      tempo_parada_minutos: c.tempo_parada_minutos || null,
      causa_raiz: c.causa_raiz || null,
    }));

    const { error } = await client.from('chamados').upsert(payload, { onConflict: 'numero' });

    if (error) {
      return { syncedCount: 0, error: error.message };
    }

    return { syncedCount: localList.length };
  } catch (err: any) {
    return { syncedCount: 0, error: err.message };
  }
}

// Script SQL pronto para criar as tabelas e políticas de armazenamento no Supabase
export const SUPABASE_SQL_SCRIPT = `-- ==============================================================================
-- SCRIPT COMPLETO: BANCO DE DADOS + POLÍTICAS DE SEGURANÇA E ARMAZENAMENTO (RLS)
-- Execute no SQL Editor do seu projeto Supabase (supabase.com/dashboard)
-- ==============================================================================

-- 1. Criação da tabela principal de chamados
create table if not exists public.chamados (
  id uuid primary key default gen_random_uuid(),
  numero serial unique not null,
  titulo text not null,
  descricao text not null,
  equipamento text not null,
  setor text not null,
  prioridade text not null check (prioridade in ('baixa', 'media', 'alta', 'urgente')),
  status text not null default 'aberto' check (status in ('aberto', 'em_atendimento', 'concluido', 'cancelado')),
  operador_id text not null,
  operador_nome text not null,
  mecanico_id text,
  mecanico_nome text,
  data_abertura timestamptz not null default now(),
  data_atendimento timestamptz,
  data_encerramento timestamptz,
  solucao_tecnica text,
  pecas_utilizadas text,
  tempo_parada_minutos integer,
  causa_raiz text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Índices de alta performance
create index if not exists idx_chamados_status on public.chamados(status);
create index if not exists idx_chamados_prioridade on public.chamados(prioridade);
create index if not exists idx_chamados_numero on public.chamados(numero desc);
create index if not exists idx_chamados_equipamento on public.chamados(equipamento);
create index if not exists idx_chamados_operador on public.chamados(operador_id);

-- 3. Habilitação de Segurança por Nível de Linha (RLS) na tabela
alter table public.chamados enable row level security;

-- 4. Políticas de Armazenamento/Acesso da Tabela chamados (RLS)
drop policy if exists "chamados_select_policy" on public.chamados;
create policy "chamados_select_policy"
  on public.chamados
  for select
  using (true);

drop policy if exists "chamados_insert_policy" on public.chamados;
create policy "chamados_insert_policy"
  on public.chamados
  for insert
  with check (true);

drop policy if exists "chamados_update_policy" on public.chamados;
create policy "chamados_update_policy"
  on public.chamados
  for update
  using (true);

drop policy if exists "chamados_delete_policy" on public.chamados;
create policy "chamados_delete_policy"
  on public.chamados
  for delete
  using (true);

-- 5. Configuração do Supabase Storage (Bucket para Fotos e Laudos Técnicos)
insert into storage.buckets (id, name, public)
values ('anexos-chamados', 'anexos-chamados', true)
on conflict (id) do update set public = true;

-- Políticas de Armazenamento para Arquivos/Fotos (storage.objects)
drop policy if exists "Permitir visualização pública de arquivos de chamados" on storage.objects;
create policy "Permitir visualização pública de arquivos de chamados"
  on storage.objects for select
  using (bucket_id = 'anexos-chamados');

drop policy if exists "Permitir upload de fotos e laudos de chamados" on storage.objects;
create policy "Permitir upload de fotos e laudos de chamados"
  on storage.objects for insert
  with check (bucket_id = 'anexos-chamados');

drop policy if exists "Permitir atualização de fotos e laudos" on storage.objects;
create policy "Permitir atualização de fotos e laudos"
  on storage.objects for update
  using (bucket_id = 'anexos-chamados');

drop policy if exists "Permitir exclusão de fotos e laudos" on storage.objects;
create policy "Permitir exclusão de fotos e laudos"
  on storage.objects for delete
  using (bucket_id = 'anexos-chamados');

-- 6. Trigger para atualizar updated_at automaticamente
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_chamados_updated_at on public.chamados;
create trigger trigger_chamados_updated_at
  before update on public.chamados
  for each row execute function public.handle_updated_at();

-- 7. Publicação em Tempo Real (Supabase Realtime)
alter publication supabase_realtime add table public.chamados;
`;
