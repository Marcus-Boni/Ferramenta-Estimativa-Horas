import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configurações de otimização para produção
  compress: true,
  poweredByHeader: false,
  
  // Configurações de imagens (caso adicione imagens no futuro)
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400, // 24 horas
  },

  // Configurações experimentais para melhor performance
  experimental: {
    scrollRestoration: true,
  },

  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Otimizações do webpack para bibliotecas específicas
  webpack: (config, { isServer }) => {
    // Otimizar bundle para Firebase
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
};

export default nextConfig;
