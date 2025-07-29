import toast, { ToastOptions } from 'react-hot-toast';

// Configurações personalizadas para os toasts
const toastConfig: ToastOptions = {
  duration: 4000,
  style: {
    maxWidth: '500px',
    padding: '16px',
    fontSize: '14px',
  },
};

export const showToast = {
  // Toast de sucesso
  success: (message: string, options?: ToastOptions) => {
    return toast.success(message, {
      ...toastConfig,
      icon: '✅',
      ...options,
    });
  },

  // Toast de erro
  error: (message: string, options?: ToastOptions) => {
    return toast.error(message, {
      ...toastConfig,
      icon: '❌',
      duration: 6000, // Erros ficam mais tempo na tela
      ...options,
    });
  },

  // Toast de informação
  info: (message: string, options?: ToastOptions) => {
    return toast(message, {
      ...toastConfig,
      icon: 'ℹ️',
      ...options,
    });
  },

  // Toast de carregamento
  loading: (message: string, options?: ToastOptions) => {
    return toast.loading(message, {
      ...toastConfig,
      ...options,
    });
  },

  // Toast de aviso
  warning: (message: string, options?: ToastOptions) => {
    return toast(message, {
      ...toastConfig,
      icon: '⚠️',
      style: {
        ...toastConfig.style,
        borderLeft: '4px solid #f59e0b',
      },
      ...options,
    });
  },

  // Toast personalizado para exportação
  export: {
    success: (totalTarefas: number, totalHoras: number, teamId: string) => {
      return toast.success(
        `Exportação concluída com sucesso!\n📊 ${totalTarefas} tarefas • ⏱️ ${totalHoras}h • 👥 ${teamId}`,
        {
          ...toastConfig,
          icon: '📊',
          duration: 5000,
          style: {
            ...toastConfig.style,
            whiteSpace: 'pre-line',
            background: '#f0fdf4',
            color: '#166534',
            border: '1px solid #bbf7d0',
          },
        }
      );
    },
    
    empty: () => {
      return toast.error('📋 Não há tarefas para exportar.\nAdicione algumas tarefas primeiro.', {
        ...toastConfig,
        icon: '📋',
        style: {
          ...toastConfig.style,
          whiteSpace: 'pre-line',
        },
      });
    },
    
    error: () => {
      return toast.error('❌ Erro ao exportar dados para Excel.\nTente novamente ou verifique se o navegador permite downloads.', {
        ...toastConfig,
        icon: '❌',
        duration: 6000,
        style: {
          ...toastConfig.style,
          whiteSpace: 'pre-line',
        },
      });
    },
  },

  // Toast para validações
  validation: {
    teamId: () => {
      return toast.error('ID da equipe deve ter pelo menos 3 caracteres e conter apenas letras, números, hífens e underscores.', {
        ...toastConfig,
        icon: '🏷️',
        duration: 5000,
      });
    },
    
    allFields: () => {
      return toast.error('Por favor, preencha todos os campos obrigatórios.', {
        ...toastConfig,
        icon: '📝',
      });
    },
    
    invalidHours: () => {
      return toast.error('Por favor, insira um valor válido para as horas estimadas.', {
        ...toastConfig,
        icon: '⏰',
      });
    },
  },

  // Remover toast específico
  dismiss: (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },

  // Promise toast para operações assíncronas
  promise: <T>(
    promise: Promise<T>,
    msgs: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, {
      loading: `🔄 ${msgs.loading}`,
      success: `✅ ${msgs.success}`,
      error: `❌ ${msgs.error}`,
    }, toastConfig);
  },
};
