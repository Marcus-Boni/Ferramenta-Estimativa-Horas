'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/custom/Header';
import { TaskTable } from '@/components/custom/TaskTable';
import { AddTaskDialog } from '@/components/custom/AddTaskDialog';
import { Task } from '@/types';
import { getTasks, addTask, updateTask, deleteTask, ensureTeamExists } from '@/lib/firestore';
import { exportToExcel, validateTeamId } from '@/lib/utils';
import { initializeAuth } from '@/lib/firebase';
import { showToast } from '@/lib/toast';

export default function TeamDashboard() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.teamId as string;
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    // Validar teamId
    if (!teamId || !validateTeamId(teamId)) {
      showToast.error('ID da equipe inválido.');
      router.push('/');
      return;
    }

    // Inicializar autenticação Firebase
    const initAuth = async () => {
      try {
        await initializeAuth();
        // Aguardar um pouco para garantir que a autenticação foi processada
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Erro na inicialização da autenticação:', error);
        showToast.error('Erro na autenticação. Tente novamente.');
        router.push('/');
        return;
      }
    };
    
    // Salvar teamId atual no localStorage
    localStorage.setItem('currentTeamId', teamId);
    
    // Função para carregar tarefas
    const loadTasks = async () => {
      setIsLoading(true);
      try {
        await ensureTeamExists(teamId);
        const tasksData = await getTasks(teamId);
        setTasks(tasksData);
      } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
        showToast.error('Erro ao carregar tarefas. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Inicializar e carregar dados
    const initializeAndLoad = async () => {
      await initAuth();
      await loadTasks();
    };
    
    // Executar inicialização
    initializeAndLoad();
  }, [teamId, router]);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      await ensureTeamExists(teamId);
      const tasksData = await getTasks(teamId);
      setTasks(tasksData);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      showToast.error('Erro ao carregar tarefas. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      await addTask(teamId, taskData);
      await loadTasks(); // Recarregar lista de tarefas
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error);
      throw error;
    }
  };

  const handleUpdateTask = async (taskId: string, taskData: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      await updateTask(teamId, taskId, taskData);
      await loadTasks(); // Recarregar lista de tarefas
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      throw error;
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(teamId, taskId);
      await loadTasks(); // Recarregar lista de tarefas
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      throw error;
    }
  };

  const handleExportToExcel = async () => {
    if (tasks.length === 0) {
      showToast.export.empty();
      return;
    }

    setIsExporting(true);
    try {
      await exportToExcel(tasks, teamId);
      
      // Feedback de sucesso melhorado
      const totalTarefas = tasks.length;
      const totalHoras = tasks.reduce((sum, task) => sum + task.horasEstimadas, 0);
      
      showToast.export.success(totalTarefas, totalHoras, teamId);
      
    } catch (error) {
      console.error('❌ Erro ao exportar Excel:', error);
      showToast.export.error();
    } finally {
      setIsExporting(false);
    }
  };

  const handleChangeTeam = () => {
    router.push('/');
  };

  const totalHoras = tasks.reduce((total, task) => total + task.horasEstimadas, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header teamId={teamId} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{tasks.length}</div>
              <p className="text-xs text-muted-foreground">
                tarefas cadastradas
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Horas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{totalHoras.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                horas estimadas
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Média por Tarefa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {tasks.length > 0 ? (totalHoras / tasks.length).toFixed(1) : '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                horas por tarefa
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Controles de ação */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
          <div className="flex flex-wrap gap-2">
            <AddTaskDialog onAddTask={handleAddTask} isLoading={isLoading} />
            <Button
              variant="outline"
              onClick={handleExportToExcel}
              disabled={isExporting || tasks.length === 0}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              {isExporting ? '📊 Exportando...' : '📊 Exportar Excel'}
            </Button>
          </div>
          
          <Button
            variant="outline"
            onClick={handleChangeTeam}
            className="text-muted-foreground hover:text-foreground"
          >
            Trocar Equipe
          </Button>
        </div>

        {/* Tabela de tarefas */}
        <TaskTable
          tasks={tasks}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          isLoading={isLoading}
        />

        {/* Informações adicionais */}
        {!isLoading && tasks.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Informações da Equipe</CardTitle>
              <CardDescription>
                Resumo das estimativas de horas para a equipe {teamId}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Equipe ID:</span>
                  <br />
                  <span className="text-muted-foreground font-mono">{teamId}</span>
                </div>
                <div>
                  <span className="font-medium">Total Tarefas:</span>
                  <br />
                  <span className="text-muted-foreground">{tasks.length}</span>
                </div>
                <div>
                  <span className="font-medium">Total Horas:</span>
                  <br />
                  <span className="text-muted-foreground">{totalHoras.toFixed(1)}h</span>
                </div>
                <div>
                  <span className="font-medium">Última Atualização:</span>
                  <br />
                  <span className="text-muted-foreground">
                    {new Date().toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
