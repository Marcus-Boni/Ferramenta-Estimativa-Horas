import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import * as XLSX from 'xlsx';
import { Task, TaskStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função para converter status em texto para Excel
const getStatusLabel = (status: TaskStatus): string => {
  const statusLabels = {
    'planejada': 'Planejada',
    'em-andamento': 'Em Andamento',
    'pendente': 'Pendente (Aguardando definições)',
    'concluida': 'Concluída',
    'cancelada': 'Cancelada',
  };
  return statusLabels[status] || 'Planejada';
};

// Função para exportar tarefas para Excel com formatação avançada
export const exportToExcel = (tasks: Task[], teamId: string): void => {
  try {
    // Preparar os dados para exportação com contexto e status incluídos
    const exportData = tasks.map((task, index) => ({
      'Nº': index + 1,
      'ID Azure DevOps': task.idDaTarefaAzure || 'N/A',
      'Título da Tarefa': task.tituloDaTarefa,
      'Contexto/Módulo': task.contexto || 'Não informado',
      'Responsável': task.responsavel,
      'Status': getStatusLabel(task.status),
      'Horas Estimadas': task.horasEstimadas + 'h',
      'Data de Criação': task.createdAt ? formatDateOnly(task.createdAt) : 'N/A',
    }));

    // Calcular estatísticas
    const totalHoras = tasks.reduce((sum, task) => sum + task.horasEstimadas, 0);
    const contextos = tasks.reduce((acc, task) => {
      const contexto = task.contexto || 'Não informado';
      acc[contexto] = (acc[contexto] || 0) + task.horasEstimadas;
      return acc;
    }, {} as Record<string, number>);
    
    // Estatísticas por status
    const statusStats = tasks.reduce((acc, task) => {
      const status = getStatusLabel(task.status);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Criar dados do cabeçalho melhorado
    const headerData = [
      ['RELATÓRIO DE ESTIMATIVA DE HORAS - HOURЕSТIMATOR'],
      [''],
      [`📊 EQUIPE: ${teamId.toUpperCase()}`],
      [`📅 DATA DE GERAÇÃO: ${new Date().toLocaleDateString('pt-BR', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`],
      [`📋 TOTAL DE TAREFAS: ${tasks.length}`],
      [`⏱️ TOTAL DE HORAS ESTIMADAS: ${totalHoras}h`],
      [`📈 MÉDIA POR TAREFA: ${tasks.length > 0 ? (totalHoras / tasks.length).toFixed(1) : '0'}h`],
      [''],
      ['📊 DISTRIBUIÇÃO POR CONTEXTO/MÓDULO:'],
      ...Object.entries(contextos).map(([contexto, horas]) => [`• ${contexto}: ${horas}h`]),
      [''],
      ['� DISTRIBUIÇÃO POR STATUS:'],
      ...Object.entries(statusStats).map(([status, quantidade]) => [`• ${status}: ${quantidade} tarefa${quantidade !== 1 ? 's' : ''}`]),
      [''],
      ['�📋 DETALHAMENTO DAS TAREFAS'],
      ['']
    ];

    // Criar workbook e worksheet
    const wb = XLSX.utils.book_new();
    
    // Adicionar dados do cabeçalho
    const ws = XLSX.utils.aoa_to_sheet(headerData);
    
    // Calcular linha de início dos dados (após cabeçalho dinâmico)
    const dataStartRow = headerData.length + 1;
    
    // Adicionar dados das tarefas
    XLSX.utils.sheet_add_json(ws, exportData, { 
      origin: `A${dataStartRow}`,
      skipHeader: false 
    });

    // Adicionar linha de totais
    const lastRow = dataStartRow + tasks.length;
    XLSX.utils.sheet_add_aoa(ws, [
      [''],
      ['', '', '', 'TOTAL GERAL:', totalHoras + 'h', '']
    ], { origin: `A${lastRow + 1}` });

    // Configurar largura das colunas otimizada para incluir contexto e status
    const colWidths = [
      { wch: 6 },   // Nº
      { wch: 16 },  // ID Azure DevOps
      { wch: 35 },  // Título da Tarefa
      { wch: 18 },  // Contexto/Módulo
      { wch: 18 },  // Responsável
      { wch: 25 },  // Status
      { wch: 12 },  // Horas Estimadas
      { wch: 14 },  // Data de Criação
    ];
    ws['!cols'] = colWidths;

    // Aplicar formatação ao cabeçalho principal
    if (!ws['!merges']) ws['!merges'] = [];
    ws['!merges'].push({
      s: { r: 0, c: 0 }, // início (linha 0, coluna 0)
      e: { r: 0, c: 7 }  // fim (linha 0, coluna 7) - ajustado para 8 colunas
    });

    // Formatação do cabeçalho da tabela
    const tableHeaderRow = dataStartRow - 1; // Linha do cabeçalho da tabela
    for (let col = 0; col < 8; col++) { // 8 colunas agora
      const cellAddress = XLSX.utils.encode_cell({ r: tableHeaderRow, c: col });
      if (!ws[cellAddress]) continue;
      ws[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "EA580C" } }, // Cor laranja da OPTSOLV
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } }
        }
      };
    }

    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Estimativas de Horas');

    // Gerar nome do arquivo mais profissional
    const hoje = new Date();
    const dataFormatada = hoje.toISOString().split('T')[0]; // YYYY-MM-DD
    const horaFormatada = hoje.toTimeString().split(' ')[0].replace(/:/g, ''); // HHMMSS
    const fileName = `HourEstimator_${teamId}_${dataFormatada}_${horaFormatada}.xlsx`;

    // Fazer download do arquivo
    XLSX.writeFile(wb, fileName);

    // Log de sucesso
    console.log(`✅ Arquivo Excel exportado: ${fileName}`);
    console.log(`📊 Dados exportados: ${tasks.length} tarefas, ${totalHoras}h total`);
    
  } catch (error) {
    console.error('❌ Erro ao exportar Excel:', error);
    throw new Error('Falha na exportação do arquivo Excel. Tente novamente.');
  }
};

// Função para formatar data de forma consistente
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Função para formatar data apenas (sem hora)
export const formatDateOnly = (date: Date): string => {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Função para validar ID da equipe
export const validateTeamId = (teamId: string): boolean => {
  return teamId.trim().length >= 3 && /^[a-zA-Z0-9-_]+$/.test(teamId.trim());
};
