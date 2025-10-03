import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Layout from '../Layout';

// Mock simples para Next.js router
const mockPush = vi.fn();
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    pathname: '/dashboard',
    asPath: '/dashboard',
    query: {},
    isReady: true,
  }),
}));

// Mock para react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock para Next.js Link
vi.mock('next/link', () => ({
  default: function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  },
}));

// Mock da API
vi.mock('@/lib/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
  endpoints: {
    notificacoes: '/api/notificacoes',
    notificacoesNaoLidas: '/api/notificacoes/nao-lidas',
    marcarTodasNotificacoesLidas: '/api/notificacoes/marcar-lidas',
  },
  removeAuthToken: vi.fn(),
}));

// Mock simplificado do UserContext
const mockUser = {
  id: 1,
  nome_completo: 'Test User',
  email: 'test@example.com',
  imagem_perfil: 'profile.jpg',
  imageTimestamp: 1234567890,
};

vi.mock('@/contexts/UserContext', () => ({
  useUser: vi.fn(),
}));

describe('Layout Component - Basic Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
  });

  describe('Loading States', () => {
    it('deve mostrar spinner quando isLoading é true', () => {
      const { useUser } = require('@/contexts/UserContext');
      useUser.mockReturnValue({
        user: null,
        isLoading: true,
        login: vi.fn(),
        logout: vi.fn(),
      });

      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      const spinner = screen.getByRole('generic');
      expect(spinner).toHaveClass('animate-spin');
    });

    it('deve redirecionar para login quando não autenticado', async () => {
      const { useUser } = require('@/contexts/UserContext');
      useUser.mockReturnValue({
        user: null,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
      });

      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      // Aguardar o redirect
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  describe('Authenticated Layout', () => {
    beforeEach(() => {
      const { useUser } = require('@/contexts/UserContext');
      useUser.mockReturnValue({
        user: mockUser,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
      });
    });

    it('deve renderizar conteúdo quando autenticado', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('deve renderizar estrutura básica do layout', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      // Verificar elementos principais do layout
      const sidebar = screen.getByRole('complementary');
      const main = screen.getByRole('main');
      
      expect(sidebar).toBeInTheDocument();
      expect(main).toBeInTheDocument();
    });

    it('deve mostrar nome do usuário', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('deve renderizar logo da aplicação', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      const logo = screen.getByAltText('Beuni Logo');
      expect(logo).toBeInTheDocument();
    });

    it('deve aplicar classes responsivas corretas', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      const sidebar = screen.getByRole('complementary');
      expect(sidebar).toHaveClass('fixed', 'h-full');
    });

    it('deve lidar com usuário sem imagem de perfil', () => {
      const { useUser } = require('@/contexts/UserContext');
      useUser.mockReturnValue({
        user: { ...mockUser, imagem_perfil: null },
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
      });

      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  describe('Navigation Structure', () => {
    beforeEach(() => {
      const { useUser } = require('@/contexts/UserContext');
      useUser.mockReturnValue({
        user: mockUser,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
      });
    });

    it('deve verificar se elementos de navegação estão presentes', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      // Verificar se textos de navegação estão presentes (sem procurar elementos específicos)
      const layoutText = screen.getByRole('main').closest('body')?.textContent;
      
      expect(layoutText).toContain('Dashboard');
      expect(layoutText).toContain('Colaboradores');
      expect(layoutText).toContain('Test User');
    });

    it('deve ter botões interativos na interface', () => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Error Scenarios', () => {
    it('deve lidar com contexto de usuário undefined', () => {
      const { useUser } = require('@/contexts/UserContext');
      useUser.mockReturnValue({
        user: undefined,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
      });

      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      // Deve redirecionar para login
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('deve renderizar com dados mínimos do usuário', () => {
      const { useUser } = require('@/contexts/UserContext');
      useUser.mockReturnValue({
        user: {
          id: 1,
          nome_completo: 'Minimal User',
          email: 'minimal@test.com',
          imagem_perfil: null,
          imageTimestamp: null,
        },
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
      });

      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
      expect(screen.getByText('Minimal User')).toBeInTheDocument();
    });
  });
});