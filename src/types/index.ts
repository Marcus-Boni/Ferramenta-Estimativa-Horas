export interface Task {
  id?: string;
  idDaTarefaAzure?: string | null;
  tituloDaTarefa: string;
  contexto?: string | null; 
  responsavel: string;
  horasEstimadas: number;
  createdAt?: Date;
}

export interface TeamData {
  id: string;
  name?: string;
  createdAt?: Date;
}
