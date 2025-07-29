'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditTaskDialog } from './EditTaskDialog';
import { Task, TaskStatus } from '@/types';
import { formatDate } from '@/lib/utils';
import { showToast } from '@/lib/toast';

interface TaskTableProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  isLoading?: boolean;
}

const getStatusBadge = (status: TaskStatus) => {
  const statusConfig = {
    'planejada': { 
      label: '📋 Planejada', 
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' 
    },
    'em-andamento': { 
      label: '🚀 Em Andamento', 
      className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' 
    },
    'pendente': { 
      label: '⏳ Pendente', 
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' 
    },
    'concluida': { 
      label: '✅ Concluída', 
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
    },
    'cancelada': { 
      label: '❌ Cancelada', 
      className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' 
    },
  };

  const config = statusConfig[status] || statusConfig['planejada'];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};

export function TaskTable({ tasks, onUpdateTask, onDeleteTask, isLoading = false }: TaskTableProps) {
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!taskToDelete?.id) return;
    
    setIsDeleting(true);
    try {
      await onDeleteTask(taskToDelete.id);
      setTaskToDelete(null);
      showToast.success('Tarefa excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      showToast.error('Erro ao excluir tarefa. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsEditDialogOpen(true);
  };

  const totalHoras = tasks.reduce((total, task) => total + task.horasEstimadas, 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tarefas da Equipe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Carregando tarefas...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tarefas da Equipe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-muted-foreground mb-2">
              Nenhuma tarefa encontrada para esta equipe.
            </div>
            <div className="text-sm text-muted-foreground">
              Adicione uma nova tarefa para começar.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tarefas da Equipe</CardTitle>
          <div className="text-sm text-muted-foreground">
            Total: {totalHoras.toFixed(1)} horas
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID Azure</TableHead>
                  <TableHead>Título da Tarefa</TableHead>
                  <TableHead className="w-[140px]">Contexto/Módulo</TableHead>
                  <TableHead className="w-[140px]">Responsável</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[100px] text-right">Horas Est.</TableHead>
                  <TableHead className="w-[130px]">Data Criação</TableHead>
                  <TableHead className="w-[110px] text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-mono text-sm">
                      {task.idDaTarefaAzure || '-'}
                    </TableCell>
                    <TableCell className="max-w-[250px]">
                      <div className="truncate" title={task.tituloDaTarefa}>
                        {task.tituloDaTarefa}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[140px]">
                      <div className="truncate text-sm" title={task.contexto || 'Não informado'}>
                        {task.contexto || (
                          <span className="text-muted-foreground italic">Não informado</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{task.responsavel}</TableCell>
                    <TableCell>
                      {getStatusBadge(task.status)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {task.horasEstimadas.toFixed(1)}h
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {task.createdAt ? formatDate(task.createdAt) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTask(task)}
                          className="h-8 px-2"
                        >
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTaskToDelete(task)}
                          className="h-8 px-2 text-destructive hover:text-destructive"
                        >
                          Excluir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!taskToDelete} onOpenChange={() => setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a tarefa &quot;{taskToDelete?.tituloDaTarefa}&quot;?
              <br />
              <strong>Esta ação não pode ser desfeita.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de edição */}
      <EditTaskDialog
        task={taskToEdit}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUpdateTask={onUpdateTask}
      />
    </>
  );
}
