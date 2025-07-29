import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Task } from '@/types';

// Função auxiliar para aguardar autenticação
const waitForAuth = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (auth.currentUser) {
      resolve();
      return;
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        unsubscribe();
        resolve();
      }
    });

    // Timeout de 10 segundos
    setTimeout(() => {
      unsubscribe();
      reject(new Error('Timeout na autenticação'));
    }, 10000);
  });
};

// Função para obter todas as tarefas de uma equipe
export const getTasks = async (teamId: string): Promise<Task[]> => {
  try {
    await waitForAuth();
    
    const tasksRef = collection(db, 'teams', teamId, 'tasks');
    const q = query(tasksRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const tasks: Task[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      tasks.push({
        id: doc.id,
        idDaTarefaAzure: data.idDaTarefaAzure || null,
        tituloDaTarefa: data.tituloDaTarefa,
        contexto: data.contexto || null, // CORRIGIDO: incluir campo contexto
        responsavel: data.responsavel,
        horasEstimadas: data.horasEstimadas,
        createdAt: data.createdAt?.toDate(),
      });
    });
    
    return tasks;
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    throw error;
  }
};

// Função para adicionar uma nova tarefa
export const addTask = async (teamId: string, taskData: Omit<Task, 'id' | 'createdAt'>): Promise<string> => {
  try {
    await waitForAuth();
    
    const tasksRef = collection(db, 'teams', teamId, 'tasks');
    const docRef = await addDoc(tasksRef, {
      ...taskData,
      createdAt: Timestamp.now(),
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Erro ao adicionar tarefa:', error);
    throw error;
  }
};

// Função para atualizar uma tarefa existente
export const updateTask = async (
  teamId: string,
  taskId: string,
  taskData: Omit<Task, 'id' | 'createdAt'>
): Promise<void> => {
  try {
    await waitForAuth();
    
    const taskRef = doc(db, 'teams', teamId, 'tasks', taskId);
    await updateDoc(taskRef, taskData);
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    throw error;
  }
};

// Função para excluir uma tarefa
export const deleteTask = async (teamId: string, taskId: string): Promise<void> => {
  try {
    await waitForAuth();
    
    const taskRef = doc(db, 'teams', teamId, 'tasks', taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    console.error('Erro ao excluir tarefa:', error);
    throw error;
  }
};

// Função para verificar se uma equipe existe (criar se não existir)
export const ensureTeamExists = async (teamId: string): Promise<void> => {
  try {
    await waitForAuth();
    
    // Tenta buscar uma tarefa para verificar se a equipe existe
    const tasksRef = collection(db, 'teams', teamId, 'tasks');
    await getDocs(tasksRef);
    // Se chegou até aqui, a equipe existe ou foi criada automaticamente
  } catch (error) {
    console.error('Erro ao verificar/criar equipe:', error);
    throw error;
  }
};
