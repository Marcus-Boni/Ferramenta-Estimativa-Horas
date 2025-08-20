# HourEstimator - Ferramenta de Estimativa de Horas

Uma aplicação web moderna para substituir planilhas Excel manuais de estimativa de horas de tarefas do Azure DevOps. A aplicação é focada em uma única equipe por vez, acessada através de um ID de equipe.

## 🚀 Funcionalidades

- **Acesso por Equipe**: Sistema de acesso baseado em ID de equipe
- **Dashboard Completa**: Visualização clara das tarefas e estatísticas
- **CRUD de Tarefas**: Criar, editar, visualizar e excluir tarefas
- **Exportação Excel**: Download das estimativas em formato .xlsx profissional
- **Interface Moderna**: Design limpo e profissional inspirado na OPTSOLV
- **Dark Mode**: Alternância entre tema claro e escuro com detecção automática do sistema
- **Responsivo**: Funciona perfeitamente em desktop e mobile
- **Toasts Inteligentes**: Notificações elegantes com feedback visual
- **Contexto/Módulo**: Organização de tarefas por funcionalidade do sistema

## 🛠️ Stack Tecnológica

- **Framework**: Next.js 14+ (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS v4
- **Componentes UI**: shadcn/ui
- **Backend & DB**: Firebase (Autenticação Anônima + Firestore)
- **Exportação**: xlsx para geração de arquivos Excel
- **Temas**: next-themes para dark/light mode
- **Notificações**: react-hot-toast para feedback visual

## 📋 Pré-requisitos

- Node.js 18.17 ou superior
- npm ou yarn
- Conta no Firebase

## 🔧 Configuração

### 1. Clone o repositório
```bash
git clone https://github.com/Marcus-Boni/Ferramenta-Estimativa-Horas.git
cd ferramenta-estimativa-horas
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configuração do Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Crie um novo projeto ou use um existente
3. Ative a autenticação e habilite o método "Anônimo"
4. Crie um banco de dados Firestore
5. Configure as regras de segurança do Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acesso às equipes e suas tarefas para usuários autenticados
    match /teams/{teamId}/tasks/{taskId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. Configuração das variáveis de ambiente

1. Copie o arquivo de exemplo:
```bash
cp .env.local.example .env.local
```

2. Edite o arquivo `.env.local` com as configurações do seu projeto Firebase:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
```

## 🚀 Executando a aplicação

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

A aplicação estará disponível em [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── [teamId]/
│   │   └── page.tsx          # Dashboard da equipe
│   ├── globals.css           # Estilos globais
│   ├── layout.tsx           # Layout principal
│   └── page.tsx             # Página inicial (seleção de equipe)
├── components/
│   ├── ui/                  # Componentes shadcn/ui
│   └── custom/
│       ├── Header.tsx       # Cabeçalho da aplicação
│       ├── TaskTable.tsx    # Tabela de tarefas
│       ├── AddTaskDialog.tsx # Modal para adicionar tarefa
│       └── EditTaskDialog.tsx # Modal para editar tarefa
├── lib/
│   ├── firebase.ts          # Configuração do Firebase
│   ├── firestore.ts         # Funções do Firestore
│   └── utils.ts             # Funções utilitárias
└── types/
    └── index.ts             # Tipos TypeScript
```

## 📊 Estrutura de Dados (Firestore)

### Coleção: `teams`
- **Documento**: `teamId` (ex: "optsolv-dev-team-1")
  - **Subcoleção**: `tasks`
    - **Campos**:
      - `idDaTarefaAzure`: string (opcional)
      - `tituloDaTarefa`: string
      - `contexto`: string (opcional - módulo/funcionalidade)
      - `responsavel`: string
      - `horasEstimadas`: number
      - `createdAt`: timestamp

## 🎨 Design System

A aplicação utiliza a cor laranja da OPTSOLV (`#EA580C`) como cor primária, criando uma interface limpa e profissional. Conta com suporte completo ao **dark mode**, alternando automaticamente conforme a preferência do sistema ou permitindo seleção manual.

### Funcionalidades visuais:
- **Tema claro/escuro**: Alternância automática baseada na preferência do sistema
- **Transições suaves**: Animações elegantes entre temas
- **Contraste otimizado**: Cores ajustadas para máxima legibilidade em ambos os temas
- **Persistência de preferência**: Lembrança da escolha manual do usuário

### Componentes principais:
- **Button**: Botões com estilo corporativo
- **Table**: Tabelas responsivas para visualização de dados
- **Dialog**: Modais para formulários
- **Card**: Cards para organização de conteúdo
- **Input**: Campos de entrada padronizados

## 🔒 Segurança

- Autenticação anônima do Firebase
- Isolamento de dados por equipe
- Validação de entrada de dados
- Regras de segurança do Firestore

## 📱 Funcionalidades Detalhadas

### 1. Acesso por Equipe
- Validação de ID de equipe (mínimo 3 caracteres)
- Persistência do ID no localStorage
- Navegação direta para dashboard da equipe

### 2. Dashboard
- Estatísticas em tempo real (total de tarefas, horas, média)
- Controles de ação (adicionar, exportar, trocar equipe)
- Tabela responsiva com todas as tarefas

### 3. CRUD de Tarefas
- **Criar**: Modal com validação de campos obrigatórios
- **Editar**: Modal pré-preenchido com dados existentes
- **Excluir**: Confirmação antes da exclusão
- **Visualizar**: Tabela com todos os detalhes

### 4. Exportação Excel
- Download automático de arquivo .xlsx profissionalmente formatado
- Nome do arquivo com data, hora e ID da equipe
- Cabeçalho corporativo com informações da equipe
- Inclusão do campo contexto/módulo para melhor organização
- Resumo executivo com totais e estatísticas
- Formatação com cores corporativas da OPTSOLV

### 5. Dark Mode
- **Detecção automática**: Respeita a preferência do sistema operacional
- **Alternância manual**: Botão no header para trocar temas
- **Persistência**: Lembrança da preferência manual do usuário
- **Transições suaves**: Animações elegantes entre temas
- **Cores otimizadas**: Paleta específica para cada tema garantindo legibilidade

### Outros provedores
A aplicação é compatível com qualquer provedor que suporte Next.js 14+

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. 

---

Desenvolvido com ❤️ para melhorar o processo de estimativa de horas.
