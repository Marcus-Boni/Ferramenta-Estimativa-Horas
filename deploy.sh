#!/bin/bash

# Script de Deploy Automático para Vercel
# Ferramenta de Estimativa de Horas - OPTSOLV

echo "🚀 Iniciando processo de deploy..."

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto"
    exit 1
fi

# Verificar se as variáveis de ambiente estão configuradas
if [ ! -f ".env.local" ]; then
    echo "⚠️  Aviso: Arquivo .env.local não encontrado"
    echo "📝 Configure as variáveis do Firebase antes do deploy"
fi

# Limpar cache e dependências
echo "🧹 Limpando cache..."
rm -rf .next
rm -rf node_modules/.cache

# Instalar dependências
echo "📦 Instalando dependências..."
npm ci

# Verificar TypeScript
echo "🔍 Verificando tipos TypeScript..."
npm run type-check

# Executar linting
echo "🧐 Verificando código com ESLint..."
npm run lint

# Build da aplicação
echo "🏗️  Fazendo build da aplicação..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
    
    # Verificar se Vercel CLI está instalado
    if ! command -v vercel &> /dev/null; then
        echo "📥 Instalando Vercel CLI..."
        npm i -g vercel
    fi
    
    echo "🚀 Fazendo deploy na Vercel..."
    vercel --prod
    
    echo "🎉 Deploy concluído!"
    echo "📋 Checklist pós-deploy:"
    echo "   ✅ Verificar se a aplicação está funcionando"
    echo "   ✅ Testar funcionalidades principais"
    echo "   ✅ Verificar variáveis de ambiente no painel Vercel"
    echo "   ✅ Configurar domínio personalizado (se necessário)"
    
else
    echo "❌ Erro no build. Corrija os erros antes do deploy."
    exit 1
fi
