'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Task, TaskStatus } from '@/types';
import { showToast } from '@/lib/toast';

interface AddTaskDialogProps {
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  isLoading?: boolean;
}

export function AddTaskDialog({ onAddTask, isLoading = false }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    idDaTarefaAzure: '',
    tituloDaTarefa: '',
    contexto: '',
    responsavel: '',
    horasEstimadas: '',
    status: 'planejada' as TaskStatus,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Apenas título, responsável e horas são obrigatórios
    if (!formData.tituloDaTarefa || !formData.responsavel || !formData.horasEstimadas) {
      showToast.validation.allFields();
      return;
    }

    const horasEstimadas = parseFloat(formData.horasEstimadas);
    if (isNaN(horasEstimadas) || horasEstimadas <= 0) {
      showToast.validation.invalidHours();
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddTask({
        idDaTarefaAzure: formData.idDaTarefaAzure.trim() || null,
        tituloDaTarefa: formData.tituloDaTarefa.trim(),
        contexto: formData.contexto.trim() || null, // CORRIGIDO: usar null em vez de undefined
        responsavel: formData.responsavel.trim(),
        horasEstimadas,
        status: formData.status,
      });
      
      // Limpar formulário e fechar modal
      setFormData({
        idDaTarefaAzure: '',
        tituloDaTarefa: '',
        contexto: '',
        responsavel: '',
        horasEstimadas: '',
        status: 'planejada' as TaskStatus,
      });
      setOpen(false);
      showToast.success('Tarefa adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error);
      showToast.error('Erro ao adicionar tarefa. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={isLoading} className="bg-primary hover:bg-primary/90">
          Adicionar Tarefa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Tarefa</DialogTitle>
          <DialogDescription>
            Preencha os dados da nova tarefa. Use o campo &quot;Contexto&quot; para organizar por módulo ou funcionalidade do sistema.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="idDaTarefaAzure" className="text-sm font-medium">
                ID da Tarefa Azure <span className="text-muted-foreground text-xs">(opcional)</span>
              </label>
              <Input
                id="idDaTarefaAzure"
                placeholder="Ex: 12345 (deixe em branco se não tiver)"
                value={formData.idDaTarefaAzure}
                onChange={(e) => handleInputChange('idDaTarefaAzure', e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="tituloDaTarefa" className="text-sm font-medium">
                Título da Tarefa *
              </label>
              <Input
                id="tituloDaTarefa"
                placeholder="Ex: Implementar login de usuário"
                value={formData.tituloDaTarefa}
                onChange={(e) => handleInputChange('tituloDaTarefa', e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="contexto" className="text-sm font-medium">
                Contexto/Módulo <span className="text-muted-foreground text-xs">(opcional)</span>
              </label>
              <Input
                id="contexto"
                placeholder="Ex: Tela de Login, Dashboard, Relatórios"
                value={formData.contexto}
                onChange={(e) => handleInputChange('contexto', e.target.value)}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Ajuda a organizar as tarefas por funcionalidade do sistema
              </p>
            </div>
            <div className="grid gap-2">
              <label htmlFor="responsavel" className="text-sm font-medium">
                Responsável *
              </label>
              <Input
                id="responsavel"
                placeholder="Ex: João Silva"
                value={formData.responsavel}
                onChange={(e) => handleInputChange('responsavel', e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status da Tarefa *
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                disabled={isSubmitting}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="planejada">📋 Planejada</option>
                <option value="em-andamento">🚀 Em Andamento</option>
                <option value="pendente">⏳ Pendente (Aguardando definições)</option>
                <option value="concluida">✅ Concluída</option>
                <option value="cancelada">❌ Cancelada</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Use &quot;Pendente&quot; para tarefas que dependem de definições do cliente
              </p>
            </div>
            <div className="grid gap-2">
              <label htmlFor="horasEstimadas" className="text-sm font-medium">
                Horas Estimadas *
              </label>
              <Input
                id="horasEstimadas"
                type="number"
                min="0.5"
                step="0.5"
                placeholder="Ex: 8"
                value={formData.horasEstimadas}
                onChange={(e) => handleInputChange('horasEstimadas', e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? 'Adicionando...' : 'Adicionar Tarefa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
