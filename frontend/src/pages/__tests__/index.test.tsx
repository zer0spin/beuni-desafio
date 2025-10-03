import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRouter } from 'next/router';
import HomePage from '../index';

// Mock do Next.js router
const mockPush = vi.fn();
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    pathname: '/',
    route: '/',
    query: {},
    asPath: '/',
  }),
}));

// Mock do Next.js Image
vi.mock('next/image', () => {
  return {
    __esModule: true,
    default: ({ src, alt, ...props }: any) => (
      <img src={src} alt={alt} {...props} />
    ),
  };
});

describe('HomePage Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderização e Interface', () => {
    it('should render the main homepage correctly', () => {
      render(<HomePage />);
      
      // Verifica se o título principal está presente
      expect(screen.getByText(/Eliminamos a complexidade de/)).toBeInTheDocument();
      expect(screen.getByText(/comprar e enviar brindes personalizados/)).toBeInTheDocument();
      
      // Verifica se a descrição principal está presente
      expect(screen.getByText(/Com a beuni, você garante total visibilidade e controle/)).toBeInTheDocument();
    });

    it('should render header with navigation and logo', () => {
      render(<HomePage />);
      
      // Verifica se o logo está presente (existe múltiplas instâncias)
      expect(screen.getAllByAltText('Beuni Logo')[0]).toBeInTheDocument();
      
      // Verifica se os links de navegação estão presentes
      expect(screen.getByText('Início')).toBeInTheDocument();
      expect(screen.getAllByText('Soluções')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Sobre')[0]).toBeInTheDocument();
      expect(screen.getByText('Contato')).toBeInTheDocument();
    });

    it('should render all main sections', () => {
      render(<HomePage />);
      
      // Verifica seções principais
      expect(screen.getByText('Veja o que fazemos')).toBeInTheDocument();
      expect(screen.getByText('Escolha o tipo de kit')).toBeInTheDocument();
      expect(screen.getByText('O que podemos fazer para você?')).toBeInTheDocument();
      expect(screen.getByText('Como fazer meu pedido de brindes personalizados com a beuni')).toBeInTheDocument();
      expect(screen.getByText('Conecte-se com suas ferramentas favoritas')).toBeInTheDocument();
      expect(screen.getByText('O que falam sobre a beuni')).toBeInTheDocument();
    });

    it('should render product grid with images', () => {
      render(<HomePage />);
      
      // Verifica se as imagens dos produtos estão presentes
      expect(screen.getByAltText('Garrafa térmica personalizada')).toBeInTheDocument();
      expect(screen.getByAltText('Camiseta personalizada')).toBeInTheDocument();
      expect(screen.getByAltText('Mochila personalizada')).toBeInTheDocument();
      expect(screen.getByAltText('Ecobag personalizada')).toBeInTheDocument();
    });
  });

  describe('Funcionalidade de Navegação', () => {
    it('should navigate to login when clicking "Entrar na Plataforma" button', async () => {
      render(<HomePage />);
      
      const loginButtons = screen.getAllByText('Entrar na Plataforma');
      fireEvent.click(loginButtons[0]);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('should navigate to login when clicking "Fazer Orçamento" button', async () => {
      render(<HomePage />);
      
      const orcamentoButtons = screen.getAllByText('Fazer Orçamento');
      fireEvent.click(orcamentoButtons[0]);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('should open external links correctly', () => {
      render(<HomePage />);
      
      // Verifica se os links externos têm os atributos corretos (header navigation)
      const headerLinks = screen.getAllByText('Sobre');
      const sobreLink = headerLinks.find(el => el.closest('nav'));
      expect(sobreLink).toBeTruthy();
      expect(sobreLink?.closest('a')).toHaveAttribute('href', 'https://beuni.com.br/sobre-nos/');
      expect(sobreLink?.closest('a')).toHaveAttribute('target', '_blank');
      expect(sobreLink?.closest('a')).toHaveAttribute('rel', 'noreferrer');
      
      const contatoLink = screen.getByText('Contato').closest('a');
      expect(contatoLink).toHaveAttribute('href', 'https://beuni.com.br/contato/');
      expect(contatoLink).toHaveAttribute('target', '_blank');
      expect(contatoLink).toHaveAttribute('rel', 'noreferrer');
    });
  });

  describe('Seção de Kits', () => {
    it('should render all kit categories correctly', () => {
      render(<HomePage />);
      
      // Verifica se todos os tipos de kits estão presentes
      expect(screen.getByText('Kit para Colaboradores')).toBeInTheDocument();
      expect(screen.getByText('Kit para Eventos')).toBeInTheDocument();
      expect(screen.getByText('Kit para Clientes')).toBeInTheDocument();
      expect(screen.getByText('Kit para Diversos')).toBeInTheDocument();
    });

    it('should have proper kit descriptions', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Fortaleça o engajamento da sua equipe')).toBeInTheDocument();
      expect(screen.getByText('Momentos especiais merecem brindes únicos')).toBeInTheDocument();
      expect(screen.getByText('Impressione e fidelize seus clientes')).toBeInTheDocument();
      expect(screen.getByText('Soluções versáteis para toda ocasião')).toBeInTheDocument();
    });

    it('should have working "Ver kits" links', () => {
      render(<HomePage />);
      
      const verKitsLinks = screen.getAllByText('Ver kits');
      verKitsLinks.forEach(link => {
        const linkElement = link.closest('a');
        expect(linkElement).toHaveAttribute('href', 'https://beuni.com.br/contato/');
        expect(linkElement).toHaveAttribute('target', '_blank');
        expect(linkElement).toHaveAttribute('rel', 'noreferrer');
      });
    });
  });

  describe('Seção de Soluções', () => {
    it('should render solution types correctly', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Colaboradores')).toBeInTheDocument();
      expect(screen.getByText('Clientes')).toBeInTheDocument();
      expect(screen.getByText('Eventos')).toBeInTheDocument();
      expect(screen.getByText('Personalizados')).toBeInTheDocument();
    });

    it('should have solution descriptions', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Engaje sua equipe')).toBeInTheDocument();
      expect(screen.getByText('Fidelize relacionamentos')).toBeInTheDocument();
      expect(screen.getByText('Momentos especiais')).toBeInTheDocument();
      expect(screen.getByText('Brindes únicos')).toBeInTheDocument();
    });
  });

  describe('Seção Passo a Passo', () => {
    it('should render all process steps', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Escolha os produtos do kit em uma ampla variedade')).toBeInTheDocument();
      expect(screen.getByText('Personalize o seu kit com a sua identidade visual')).toBeInTheDocument();
      expect(screen.getByText('Armazene o seu pedido nos estoques da Beuni')).toBeInTheDocument();
    });

    it('should render step numbers correctly', () => {
      render(<HomePage />);
      
      expect(screen.getByText('01')).toBeInTheDocument();
      expect(screen.getByText('02')).toBeInTheDocument();
      expect(screen.getByText('03')).toBeInTheDocument();
    });

    it('should have detailed step descriptions', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Selecione entre uma ampla variedade de produtos para criar o kit perfeito.')).toBeInTheDocument();
      expect(screen.getByText('Envie suas artes e logomarcas, e nossa equipe transformará seu kit em algo incrível.')).toBeInTheDocument();
      expect(screen.getByText('Gerencie seus pedidos, estoque e entregas, tudo em um único lugar.')).toBeInTheDocument();
    });
  });

  describe('Seção de Integrações', () => {
    it('should render integration platforms', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Salesforce')).toBeInTheDocument();
      expect(screen.getByText('HubSpot')).toBeInTheDocument();
      expect(screen.getByText('Slack')).toBeInTheDocument();
      expect(screen.getByText('Zapier')).toBeInTheDocument();
      expect(screen.getByText('Google Suite')).toBeInTheDocument();
      expect(screen.getByText('Microsoft')).toBeInTheDocument();
    });

    it('should have integration descriptions', () => {
      render(<HomePage />);
      
      expect(screen.getByText('CRM Integration')).toBeInTheDocument();
      expect(screen.getByText('Marketing Hub')).toBeInTheDocument();
      expect(screen.getByText('Team Communication')).toBeInTheDocument();
      expect(screen.getByText('Workflow Automation')).toBeInTheDocument();
      expect(screen.getByText('Productivity Tools')).toBeInTheDocument();
      expect(screen.getByText('Enterprise Solutions')).toBeInTheDocument();
    });
  });

  describe('Seção de Contato', () => {
    it('should render contact options', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Marcar Reunião')).toBeInTheDocument();
      expect(screen.getByText('Orçamento Express')).toBeInTheDocument();
    });

    it('should have contact descriptions', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Converse ao vivo com nossos especialistas')).toBeInTheDocument();
      expect(screen.getByText('Receba uma proposta personalizada')).toBeInTheDocument();
    });

    it('should render contact methods', () => {
      render(<HomePage />);
      
      expect(screen.getByText('WhatsApp')).toBeInTheDocument();
      expect(screen.getByText('E-mail')).toBeInTheDocument();
      expect(screen.getByText('Telefone')).toBeInTheDocument();
      expect(screen.getByText('Central de Ajuda')).toBeInTheDocument();
    });

    it('should have working contact links', () => {
      render(<HomePage />);
      
      const marcareReuniaoLink = screen.getByText('Marcar Reunião').closest('a');
      expect(marcareReuniaoLink).toHaveAttribute('href', 'https://materiais.beuni.com.br/plataforma');
      
      const orcamentoExpressLink = screen.getByText('Orçamento Express').closest('a');
      expect(orcamentoExpressLink).toHaveAttribute('href', 'https://beuni.com.br/contato/');
    });
  });

  describe('Seção de Depoimentos', () => {
    it('should render customer testimonials', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Erica de Brito Constantino')).toBeInTheDocument();
      expect(screen.getByText('Muriel Aguiar')).toBeInTheDocument();
      expect(screen.getByText('Renata Sollero')).toBeInTheDocument();
    });

    it('should show customer companies', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Insper')).toBeInTheDocument();
      expect(screen.getByText('Oico')).toBeInTheDocument();
      expect(screen.getByText('Active Campaign')).toBeInTheDocument();
    });

    it('should have rating stars for testimonials', () => {
      const { container } = render(<HomePage />);
      
      // Cada depoimento deve ter 5 estrelas (verifica a presença de classes de estrelas)
      const starElements = container.querySelectorAll('[class*="fill-yellow"]');
      expect(starElements.length).toBeGreaterThan(0);
    });
  });

  describe('Seção de Investidores', () => {
    it('should render investor section title', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Quem acredita e nos impulsiona')).toBeInTheDocument();
    });

    it('should show investor names', () => {
      render(<HomePage />);
      
      expect(screen.getAllByText(/Sai do Papel/)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/Investidores\.vc/)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/ERA Angels/)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/EquityRio/)[0]).toBeInTheDocument();
    });
  });

  describe('Footer', () => {
    it('should render footer sections', () => {
      render(<HomePage />);
      
      expect(screen.getByText('A beuni')).toBeInTheDocument();
      expect(screen.getByText('Plataforma')).toBeInTheDocument();
      // Usar getAllByText para lidar com múltiplas instâncias
      const solucoesElements = screen.getAllByText('Soluções');
      expect(solucoesElements.length).toBeGreaterThan(0);
    });

    it('should have footer links', () => {
      render(<HomePage />);
      
      // Usar getAllByText para elementos duplicados
      const sobreElements = screen.getAllByText('Sobre');
      expect(sobreElements.length).toBeGreaterThan(0);
      expect(screen.getByText('Vagas')).toBeInTheDocument();
      expect(screen.getByText('Plataforma beuni')).toBeInTheDocument();
      expect(screen.getByText('Personalização')).toBeInTheDocument();
      expect(screen.getByText('Integrações')).toBeInTheDocument();
      expect(screen.getByText('Planos')).toBeInTheDocument();
    });

    it('should have copyright and legal links', () => {
      render(<HomePage />);
      
      expect(screen.getByText('© 2025 BeUni. Todos os direitos reservados')).toBeInTheDocument();
      expect(screen.getByText('Política de Privacidade')).toBeInTheDocument();
      expect(screen.getByText('Termos e Condições')).toBeInTheDocument();
    });

    it('should have social media links', () => {
      render(<HomePage />);
      
      const instagramLink = screen.getByLabelText('Instagram');
      expect(instagramLink).toHaveAttribute('href', 'https://www.instagram.com/beunibr');
      
      const linkedinLink = screen.getByLabelText('LinkedIn');
      expect(linkedinLink).toHaveAttribute('href', 'https://www.linkedin.com/company/beuni/');
      
      const youtubeLink = screen.getByLabelText('YouTube');
      expect(youtubeLink).toHaveAttribute('href', 'https://www.youtube.com/@beunibr');
    });
  });

  describe('Banner e Prova Social', () => {
    it('should render top banner', () => {
      render(<HomePage />);
      
      expect(screen.getByText(/Experimente nossa ferramenta de cotação de envios/)).toBeInTheDocument();
    });

    it('should show social proof elements', () => {
      render(<HomePage />);
      
      expect(screen.getByText('5.0')).toBeInTheDocument();
      expect(screen.getByText('de 120+ reviews')).toBeInTheDocument();
      expect(screen.getByText(/Confiável por 3.700 marcas empresariais/)).toBeInTheDocument();
    });

    it('should show company logos in carousel', () => {
      render(<HomePage />);
      
      // Usar getAllByText para elementos duplicados no carrossel
      const maerskElements = screen.getAllByText('MAERSK');
      expect(maerskElements.length).toBeGreaterThan(0);
      
      const cargillElements = screen.getAllByText('Cargill');
      expect(cargillElements.length).toBeGreaterThan(0);
      
      expect(screen.getAllByText('SOMOS').length).toBeGreaterThan(0);
      expect(screen.getAllByText('isaac').length).toBeGreaterThan(0);
      expect(screen.getAllByText('CONQUER').length).toBeGreaterThan(0);
    });
  });

  describe('Acessibilidade', () => {
    it('should have proper alt texts for images', () => {
      render(<HomePage />);
      
      // Usar getAllByAltText para múltiplos logos
      const beuniLogos = screen.getAllByAltText('Beuni Logo');
      expect(beuniLogos.length).toBeGreaterThan(0);
      
      expect(screen.getByAltText('Garrafa térmica personalizada')).toBeInTheDocument();
      expect(screen.getByAltText('Camiseta personalizada')).toBeInTheDocument();
      expect(screen.getByAltText('Mochila personalizada')).toBeInTheDocument();
      expect(screen.getByAltText('Ecobag personalizada')).toBeInTheDocument();
    });

    it('should have proper aria-labels for social links', () => {
      render(<HomePage />);
      
      expect(screen.getByLabelText('Instagram')).toBeInTheDocument();
      expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument();
      expect(screen.getByLabelText('YouTube')).toBeInTheDocument();
      expect(screen.getByLabelText('Facebook')).toBeInTheDocument();
      expect(screen.getByLabelText('Pinterest')).toBeInTheDocument();
      expect(screen.getByLabelText('TikTok')).toBeInTheDocument();
    });
  });

  describe('Interações e Estados', () => {
    it('should handle multiple button clicks without errors', async () => {
      render(<HomePage />);
      
      const loginButtons = screen.getAllByText('Entrar na Plataforma');
      const orcamentoButtons = screen.getAllByText('Fazer Orçamento');
      
      // Clica em vários botões
      fireEvent.click(loginButtons[0]);
      fireEvent.click(orcamentoButtons[0]);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledTimes(2);
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('should handle anchor link navigation', () => {
      render(<HomePage />);
      
      const inicioLink = screen.getByText('Início').closest('a');
      expect(inicioLink).toHaveAttribute('href', '#top');
      
      // Buscar o link de soluções na navegação específica
      const navigationSolutions = screen.getAllByText('Soluções');
      const navSolutionsLink = navigationSolutions.find(el => 
        el.closest('nav') && el.closest('a')?.getAttribute('href') === '#solucoes'
      );
      expect(navSolutionsLink).toBeTruthy();
    });

    it('should render beuni experts badge', () => {
      render(<HomePage />);
      
      // Verificar por partes do texto para contornar elementos separados
      expect(screen.getByText(/🎯 beuni Experts/)).toBeInTheDocument();
      expect(screen.getByText(/• Disponíveis para novos projetos/)).toBeInTheDocument();
    });
  });

  describe('CTAs e Conversão', () => {
    it('should have multiple CTAs throughout the page', () => {
      render(<HomePage />);
      
      const entrarButtons = screen.getAllByText('Entrar na Plataforma');
      const orcamentoButtons = screen.getAllByText('Fazer Orçamento');
      
      expect(entrarButtons.length).toBeGreaterThan(1);
      expect(orcamentoButtons.length).toBeGreaterThan(1);
    });

    it('should have "Explore todas as soluções" CTA', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Explore todas as soluções')).toBeInTheDocument();
    });

    it('should have integration CTAs', () => {
      render(<HomePage />);
      
      expect(screen.getByText('Ver todas as integrações')).toBeInTheDocument();
      expect(screen.getByText('Solicitar nova integração')).toBeInTheDocument();
    });
  });
});