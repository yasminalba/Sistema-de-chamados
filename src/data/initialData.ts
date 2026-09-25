import { Chamado } from '../types';

export const INITIAL_CHAMADOS: Chamado[] = [
  {
    id: 'chamado-101',
    numero: 101,
    titulo: 'Vazamento de fluido na prensa hidráulica',
    descricao: 'Mangueira principal do pistão esquerdo está gotejando óleo hidráulico sob alta pressão. Pressão caiu de 180 bar para 130 bar.',
    equipamento: 'Prensa Hidráulica 200T - PH-02',
    setor: 'Estamparia Pesada',
    prioridade: 'alta',
    status: 'aberto',
    operador_id: 'operador-1',
    operador_nome: 'Marcos Souza (Operador)',
    data_abertura: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 'chamado-102',
    numero: 102,
    titulo: 'Ruído metálico no eixo do Torno CNC',
    descricao: 'Ao ultrapassar 1200 RPM, ouve-se atrito excessivo e vibração na placa do cabeçote fixo. Necessária verificação de rolamentos e alinhamento.',
    equipamento: 'Torno CNC Romi Centur 30D',
    setor: 'Usinagem de Precisão',
    prioridade: 'urgente',
    status: 'em_atendimento',
    operador_id: 'operador-1',
    operador_nome: 'Marcos Souza (Operador)',
    mecanico_id: 'mecanico-1',
    mecanico_nome: 'Carlos Mecânico',
    data_abertura: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
    data_atendimento: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'chamado-100',
    numero: 100,
    titulo: 'Esteira transportadora travando com carga',
    descricao: 'Esteira 03 desacelera e desliza a lona quando caixas pesadas entram no setor de pesagem.',
    equipamento: 'Esteira Transportadora ET-03',
    setor: 'Linha de Embalagem',
    prioridade: 'media',
    status: 'concluido',
    operador_id: 'operador-1',
    operador_nome: 'Marcos Souza (Operador)',
    mecanico_id: 'mecanico-1',
    mecanico_nome: 'Carlos Mecânico',
    data_abertura: new Date(Date.now() - 360 * 60 * 1000).toISOString(),
    data_atendimento: new Date(Date.now() - 300 * 60 * 1000).toISOString(),
    data_encerramento: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    solucao_tecnica: 'Ajustada a tensão do esticador da lona mecânica, realizada limpeza das polias motrizes com desengraxante industrial e lubrificação dos mancais com graxa EP-2.',
    pecas_utilizadas: 'Graxa de lítio EP-2 (300g), spray desengraxante industrial.',
    tempo_parada_minutos: 65,
    causa_raiz: 'Frouxidão natural por vibração e acúmulo de poeira de papelão na polia.',
  }
];

export const EQUIPAMENTOS_SUGERIDOS = [
  'Prensa Hidráulica 200T - PH-02',
  'Torno CNC Romi Centur 30D',
  'Fresadora Universal FU-01',
  'Esteira Transportadora ET-03',
  'Injetora de Plástico Engel 150T',
  'Compressor de Ar Parafuso Atlas Copco',
  'Robô Soldador Kuka KR-16',
  'Caldeira a Vapor CV-01',
  'Empilhadeira Elétrica Yale 2.5T',
  'Ponte Rolante 10 Toneladas'
];

export const SETORES_SUGERIDOS = [
  'Usinagem de Precisão',
  'Estamparia Pesada',
  'Linha de Montagem',
  'Linha de Embalagem',
  'Calderaria e Solda',
  'Injeção Plástica',
  'Almoxarifado & Logística',
  'Utilidades & Compressores'
];
