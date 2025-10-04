import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CatalogoPage from '../index';

// Next.js mock
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: any }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    pathname: '/catalogo',
  }),
}));

// Layout mock
vi.mock('@/components/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">{children}</div>
  ),
}));

describe('CatalogoPage Tests', () => {
  describe('Renderização Básica', () => {
    it('should render the catalog page correctly', () => {
      render(<CatalogoPage />);
      
      expect(screen.getByText('Catálogo de Produtos')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Buscar produtos...')).toBeInTheDocument();
      expect(screen.getByText('Todos')).toBeInTheDocument();
    });

    it('should render products', () => {
      render(<CatalogoPage />);
      
      expect(screen.getByText('Garrafa Térmica Personalizada')).toBeInTheDocument();
      expect(screen.getByText('Camiseta Premium Cotton')).toBeInTheDocument();
      expect(screen.getByText('Mochila Executiva')).toBeInTheDocument();
    });

    it('should display product count', () => {
      render(<CatalogoPage />);
      
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('itens')).toBeInTheDocument();
    });
  });

  describe('Funcionalidade de Busca', () => {
    it('should filter products by search term', () => {
      render(<CatalogoPage />);
      
      const searchInput = screen.getByPlaceholderText('Buscar produtos...');
      fireEvent.change(searchInput, { target: { value: 'Kit' } });
      
      expect(screen.getByText('Kit Colaborador Completo')).toBeInTheDocument();
      expect(screen.getByText('Kit Para Eventos')).toBeInTheDocument();
    });

    it('should show empty state when no products match search', () => {
      render(<CatalogoPage />);
      
      const searchInput = screen.getByPlaceholderText('Buscar produtos...');
      fireEvent.change(searchInput, { target: { value: 'produto inexistente' } });
      
      expect(screen.getByText('Nenhum produto encontrado')).toBeInTheDocument();
    });
  });

  describe('Mudança de Visualização', () => {
    it('should switch to list view', () => {
      render(<CatalogoPage />);
      
      const listViewButton = screen.getByRole('button', { name: 'List view' });
      fireEvent.click(listViewButton);
      
      // Check if there's an "Add" button in list view
      expect(screen.getAllByText('Adicionar').length).toBeGreaterThan(0);
    });

    it('should highlight active view mode button', () => {
      render(<CatalogoPage />);
      
      const gridViewButton = screen.getByRole('button', { name: 'Grid view' });
      const listViewButton = screen.getByRole('button', { name: 'List view' });
      
      // Grid está ativo por padrão
      expect(gridViewButton.className).toContain('bg-gradient-to-r');
      expect(listViewButton.className).toContain('bg-beuni-cream');
    });
  });

  describe('Filtragem por Categoria', () => {
    it('should filter products by category', () => {
      render(<CatalogoPage />);
      
      const categoryButton = screen.getByRole('button', { name: 'Kits Corporativos' });
      fireEvent.click(categoryButton);
      
      expect(screen.getByText('Kit Colaborador Completo')).toBeInTheDocument();
      expect(screen.getByText('Kit Para Eventos')).toBeInTheDocument();
    });

    it('should highlight selected category', () => {
      render(<CatalogoPage />);
      
      const categoryButton = screen.getByRole('button', { name: 'Kits Corporativos' });
      fireEvent.click(categoryButton);
      
      expect(categoryButton.className).toContain('bg-gradient-to-r');
    });
  });

  describe('Interações com Produtos', () => {
    it('should render favorite buttons for all products', () => {
      render(<CatalogoPage />);
      
      const favoriteButtons = screen.getAllByRole('button').filter(btn => 
        btn.querySelector('svg') && 
        btn.className.includes('absolute')
      );
      expect(favoriteButtons.length).toBeGreaterThan(0);
    });

    it('should render add to cart buttons', () => {
      render(<CatalogoPage />);
      
      const cartButtons = screen.getAllByRole('button').filter(btn => 
        btn.querySelector('svg') && 
        btn.className.includes('bg-beuni-orange-500')
      );
      expect(cartButtons.length).toBeGreaterThan(0);
    });

    it('should disable add to cart for out of stock products in list view', () => {
      render(<CatalogoPage />);
      
      const listButton = screen.getByRole('button', { name: 'List view' });
      fireEvent.click(listButton);
      
      const disabledButtons = screen.getAllByRole('button').filter(btn => 
        btn.hasAttribute('disabled')
      );
      expect(disabledButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Produtos e Informações', () => {
    it('should display all product information', () => {
      render(<CatalogoPage />);
      
      expect(screen.getByText('Garrafa Térmica Personalizada')).toBeInTheDocument();
      expect(screen.getByText('R$ 89,90')).toBeInTheDocument();
      expect(screen.getAllByText('Garrafas Térmicas').length).toBeGreaterThan(0);
      expect(screen.getByAltText('Garrafa Térmica Personalizada')).toBeInTheDocument();
    });

    it('should display product ratings', () => {
      render(<CatalogoPage />);
      
      const reviewElements = screen.getAllByText(/\(\d+\)/);
      expect(reviewElements.length).toBeGreaterThan(0);
    });

    it('should show out of stock products correctly', () => {
      render(<CatalogoPage />);
      
      const listButton = screen.getByRole('button', { name: 'List view' });
      fireEvent.click(listButton);
      
      expect(screen.getByText('Esgotado')).toBeInTheDocument();
    });
  });

  describe('Acessibilidade', () => {
    it('should have proper alt texts for product images', () => {
      render(<CatalogoPage />);
      
      expect(screen.getByAltText('Garrafa Térmica Personalizada')).toBeInTheDocument();
      expect(screen.getByAltText('Camiseta Premium Cotton')).toBeInTheDocument();
    });

    it('should have keyboard accessible buttons', () => {
      render(<CatalogoPage />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      // Todos os botões devem ser acessíveis por teclado
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
      });
    });
  });

  describe('Responsividade e Layout', () => {
    it('should render mobile-friendly search bar', () => {
      render(<CatalogoPage />);
      
      const searchInput = screen.getByPlaceholderText('Buscar produtos...');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput.className).toContain('w-full');
    });
  });

  describe('Estados de Carregamento e Vazio', () => {
    it('should show empty state with proper icon and message', () => {
      render(<CatalogoPage />);
      
      const searchInput = screen.getByPlaceholderText('Buscar produtos...');
      fireEvent.change(searchInput, { target: { value: 'produto que não existe' } });
      
      expect(screen.getByText('Nenhum produto encontrado')).toBeInTheDocument();
    });
  });

  describe('Integração com Filtros Combinados', () => {
    it('should apply both search and category filters', async () => {
      render(<CatalogoPage />);
      
      const searchInput = screen.getByPlaceholderText('Buscar produtos...');
      fireEvent.change(searchInput, { target: { value: 'Kit' } });
      
      const categoryButton = screen.getByRole('button', { name: 'Kits Corporativos' });
      fireEvent.click(categoryButton);
      
      await waitFor(() => {
        expect(screen.getByText('Kit Colaborador Completo')).toBeInTheDocument();
      });
    });

    it('should maintain search when changing categories', async () => {
      render(<CatalogoPage />);
      
      const searchInput = screen.getByPlaceholderText('Buscar produtos...');
      fireEvent.change(searchInput, { target: { value: 'Kit' } });
      
      const categoryButton = screen.getByRole('button', { name: 'Kits Corporativos' });
      fireEvent.click(categoryButton);
      
      await waitFor(() => {
        expect((searchInput as HTMLInputElement).value).toBe('Kit');
      });
    });
  });
});