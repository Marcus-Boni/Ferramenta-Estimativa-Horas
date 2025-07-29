'use client';

import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';

interface HeaderProps {
  teamId?: string;
}

export function Header({ teamId }: HeaderProps) {
  return (
    <header className="w-full bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">⏱️</span>
              <h1 className="text-2xl font-bold text-primary">
                HourEstimator
              </h1>
            </div>
            {teamId && (
              <div className="hidden sm:block">
                <Card className="px-3 py-1 bg-primary/10 border-primary/20">
                  <span className="text-sm font-medium text-primary">
                    Equipe: {teamId}
                  </span>
                </Card>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-sm text-muted-foreground hidden md:block">
              Ferramenta de Estimativa de Horas
            </span>
            <ThemeToggle />
          </div>
        </div>
        
        {teamId && (
          <div className="sm:hidden pb-3">
            <Card className="px-3 py-1 bg-primary/10 border-primary/20 inline-block">
              <span className="text-sm font-medium text-primary">
                Equipe: {teamId}
              </span>
            </Card>
          </div>
        )}
      </div>
    </header>
  );
}
