'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/custom/Header';
import { validateTeamId } from '@/lib/utils';
import { initializeAuth } from '@/lib/firebase';
import { showToast } from '@/lib/toast';

export default function Home() {
  const [teamId, setTeamId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'access' | 'create'>('access');
  const router = useRouter();

  useEffect(() => {
    // Inicializar autenticação Firebase quando a página carregar
    initializeAuth();
    
    // Verificar se há um teamId salvo no localStorage
    const savedTeamId = localStorage.getItem('currentTeamId');
    if (savedTeamId) {
      setTeamId(savedTeamId);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedTeamId = teamId.trim();
    
    if (!validateTeamId(trimmedTeamId)) {
      showToast.validation.teamId();
      return;
    }

    setIsLoading(true);
    try {
      // Salvar o teamId no localStorage
      localStorage.setItem('currentTeamId', trimmedTeamId);
      
      // Navegar para a dashboard da equipe
      router.push(`/${trimmedTeamId}`);
    } catch (error) {
      console.error('Erro ao acessar equipe:', error);
      showToast.error('Erro ao acessar equipe. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomTeamId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const randomChars = Math.random().toString(36).substring(2, 8);
    return `team-${randomChars}-${timestamp}`;
  };

  const handleCreateNewTeam = () => {
    const newTeamId = generateRandomTeamId();
    setTeamId(newTeamId);
    setMode('create');
  };

  const handleBackToAccess = () => {
    setMode('access');
    setTeamId('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-md mx-auto px-4 pt-16">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {mode === 'access' ? 'Acesso por Equipe' : 'Criar Nova Equipe'}
            </CardTitle>
            <CardDescription>
              {mode === 'access' 
                ? 'Digite o ID da sua equipe para acessar as estimativas de horas'
                : 'Confirme o ID gerado para sua nova equipe ou edite se preferir'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mode === 'create' && (
              <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-md">
                <p className="text-sm text-primary font-medium">
                  ✨ ID da equipe gerado automaticamente
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Você pode editá-lo se preferir um nome personalizado
                </p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="teamId" className="text-sm font-medium">
                  ID da Equipe *
                </label>
                <Input
                  id="teamId"
                  type="text"
                  placeholder="Ex: optsolv-dev-team-1"
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  disabled={isLoading}
                  className="text-center mt-2"
                />
                <p className="text-xs text-muted-foreground">
                  Mínimo 3 caracteres. Apenas letras, números, hífens e underscores.
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isLoading || !teamId.trim()}
              >
                {isLoading ? 'Acessando...' : mode === 'access' ? 'Acessar Dashboard' : 'Criar Equipe'}
              </Button>
            </form>
            
            <div className="mt-6 space-y-4">
              {mode === 'access' ? (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    Ainda não tem uma equipe?
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleCreateNewTeam}
                    disabled={isLoading}
                    className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    Criar Nova Equipe
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={handleBackToAccess}
                    disabled={isLoading}
                    className="w-full"
                  >
                    ← Voltar para Acessar Equipe
                  </Button>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
              <p>
                Esta ferramenta substitui a planilha Excel manual de estimativa de horas,
                proporcionando uma experiência mais moderna e colaborativa.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
