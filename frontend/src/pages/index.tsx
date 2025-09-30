import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Gift, Users, Calendar, ChevronRight, CheckCircle, Star, ArrowRight, Play, Shield, Zap, Heart, TrendingUp, Award } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Ana Silva",
      role: "Gerente de RH",
      company: "Maersk",
      text: "A Beuni transformou completamente nossa gestão de aniversários corporativos. Nossa taxa de engagement aumentou 300%!",
      rating: 5
    },
    {
      name: "Carlos Santos",
      role: "Diretor de Pessoas",
      company: "Cargill",
      text: "Eliminamos a complexidade de comprar e enviar brindes personalizados. ROI incrível em satisfação dos colaboradores.",
      rating: 5
    },
    {
      name: "Maria Oliveira",
      role: "Head de RH",
      company: "Somos Educação",
      text: "Sistema intuitivo que nos permitiu padronizar o reconhecimento. Nossos colaboradores se sentem mais valorizados.",
      rating: 5
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Seção "O que podemos fazer para você?" - Segmentação por público-alvo
  const [activeTab, setActiveTab] = useState('tech');
  const solutionTabs = [
    { id: 'tech', label: 'Profissionais de Tech', icon: Zap },
    { id: 'eventos', label: 'Eventos', icon: Calendar },
    { id: 'clientes', label: 'Clientes', icon: Heart },
    { id: 'empresas', label: 'Empresas', icon: TrendingUp }
  ];

  const solutions = {
    tech: {
      title: "Soluções para Tech",
      description: "Brindes personalizados que conectam com a cultura tech: gadgets, acessórios para home office e itens de lifestyle.",
      features: ["Gadgets tecnológicos", "Acessórios para workspace", "Branded swag moderno"]
    },
    eventos: {
      title: "Gestão de Eventos",
      description: "Automatize brindes para eventos corporativos, conferências e comemorações especiais da empresa.",
      features: ["Kits para eventos", "Brindes sazonais", "Comemorações especiais"]
    },
    clientes: {
      title: "Relacionamento com Clientes",
      description: "Fortaleça relacionamentos B2B com brindes estratégicos em datas importantes e marcos comerciais.",
      features: ["Datas comerciais", "Marcos de relacionamento", "Fidelização B2B"]
    },
    empresas: {
      title: "Cultura Organizacional",
      description: "Construa uma cultura de reconhecimento que engaja colaboradores e fortalece o employer branding.",
      features: ["Reconhecimento contínuo", "Employer branding", "Cultura de valorização"]
    }
  };

  // Passo a Passo do processo
  const processSteps = [
    {
      number: "01",
      title: "Escolha",
      description: "Selecione os brindes perfeitos para sua empresa",
      icon: Gift
    },
    {
      number: "02",
      title: "Personalize",
      description: "Customize com sua marca e configure automações",
      icon: Zap
    },
    {
      number: "03",
      title: "Armazene",
      description: "Deixe conosco o estoque, logística e entregas",
      icon: Shield
    }
  ];

  // Cases/Portfolio - "O que fazemos"
  const portfolioItems = [
    {
      title: "Kit Home Office Premium",
      description: "Garrafa térmica, mouse pad e caderno personalizados",
      image: "/api/placeholder/400/300"
    },
    {
      title: "Ecobag Sustentável",
      description: "Materiais eco-friendly com branding discreto",
      image: "/api/placeholder/400/300"
    },
    {
      title: "Camiseta Branded",
      description: "Algodão premium com design exclusivo",
      image: "/api/placeholder/400/300"
    },
    {
      title: "Mochila Executiva",
      description: "Resistente à água com compartimento para laptop",
      image: "/api/placeholder/400/300"
    }
  ];

  // Logos de clientes/investidores
  const clientLogos = ['Maersk', 'Cargill', 'Somos Educação'];

  return (
    <div className="min-h-screen bg-beuni-cream">
      {/* Header Fixo conforme PRD */}
      <header className="bg-white shadow-sm sticky top-0 z-50 transition-shadow duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo à esquerda */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-beuni-orange-500 to-beuni-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-beuni-text">Beuni</span>
            </div>

            {/* Menu de navegação centralizado */}
            <nav className="hidden md:flex space-x-8">
              <a href="#inicio" className="text-beuni-text hover:text-beuni-orange-500 font-medium transition-colors">Início</a>
              <a href="#servicos" className="text-beuni-text hover:text-beuni-orange-500 font-medium transition-colors">Serviços</a>
              <a href="#sobre" className="text-beuni-text hover:text-beuni-orange-500 font-medium transition-colors">Sobre</a>
              <a href="#contato" className="text-beuni-text hover:text-beuni-orange-500 font-medium transition-colors">Contato</a>
            </nav>

            {/* CTAs à direita */}
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 text-beuni-brown-800 hover:text-beuni-brown-900 font-medium transition-colors"
              >
                Entrar na Plataforma
              </button>
              <button
                onClick={() => router.push('/login')}
                className="px-6 py-2 bg-beuni-brown-800 text-white rounded-lg hover:bg-beuni-brown-900 font-medium transition-all duration-200 shadow-md"
              >
                Fazer Orçamento
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section conforme PRD */}
      <section id="inicio" className="py-20 lg:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Conteúdo à esquerda */}
            <div className="text-left">
              <h1 className="text-5xl lg:text-6xl font-bold text-beuni-text mb-6 leading-tight">
                Eliminamos a complexidade de comprar e enviar
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-beuni-orange-500 to-beuni-orange-600">
                  {' '}brindes personalizados
                </span>
              </h1>
              <p className="text-xl text-beuni-text/80 mb-8 max-w-2xl">
                Plataforma completa que automatiza a gestão de aniversariantes corporativos,
                fortalecendo a cultura organizacional através da tecnologia.
              </p>

              {/* Prova social logo abaixo do título */}
              <div className="flex items-center space-x-6 mb-10">
                <div className="flex items-center">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="ml-2 text-sm font-semibold text-beuni-text">5.0</span>
                </div>
                <div className="flex -space-x-2">
                  {clientLogos.map((logo, index) => (
                    <div key={index} className="w-8 h-8 bg-gradient-to-r from-beuni-orange-100 to-beuni-brown-100 rounded-full border-2 border-white flex items-center justify-center text-xs font-semibold text-beuni-brown-800">
                      {logo.charAt(0)}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-beuni-text/70">Empresas confiam na Beuni</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push('/login')}
                  className="px-8 py-4 bg-beuni-brown-800 text-white text-lg font-semibold rounded-xl hover:bg-beuni-brown-900 transition-all duration-200 flex items-center justify-center shadow-lg"
                >
                  Fazer Orçamento
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="px-8 py-4 border-2 border-beuni-orange-500 text-beuni-orange-600 text-lg font-semibold rounded-xl hover:bg-beuni-orange-50 transition-all duration-200 flex items-center justify-center"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Ver Demonstração
                </button>
              </div>
            </div>

            {/* Composição gráfica à direita */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-6">
                {portfolioItems.slice(0, 4).map((item, index) => (
                  <div key={index} className="relative group">
                    <div className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                      <div className="w-full h-32 bg-gradient-to-br from-beuni-orange-100 to-beuni-brown-100 rounded-xl flex items-center justify-center mb-3">
                        <Gift className="h-8 w-8 text-beuni-orange-500" />
                      </div>
                      <h3 className="font-semibold text-sm text-beuni-text mb-1">{item.title}</h3>
                      <p className="text-xs text-beuni-text/70">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Cases/Portfolio - "O que fazemos" */}
      <section id="servicos" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-beuni-text mb-4">
              O que fazemos
            </h2>
            <p className="text-xl text-beuni-text/80 max-w-3xl mx-auto">
              Transformamos momentos especiais em experiências marcantes através de brindes de alta qualidade
            </p>
          </div>

          {/* Grid de casos com imagens humanizadas */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {portfolioItems.map((item, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="bg-gradient-to-br from-beuni-orange-50 to-beuni-brown-50 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                  <div className="h-48 bg-gradient-to-br from-beuni-orange-100 to-beuni-brown-100 flex items-center justify-center">
                    <Gift className="h-12 w-12 text-beuni-orange-500" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-beuni-text mb-2">{item.title}</h3>
                    <p className="text-sm text-beuni-text/70">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cards menores como galeria rápida */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map((_, index) => (
              <div key={index} className="aspect-square bg-gradient-to-br from-beuni-orange-100 to-beuni-brown-100 rounded-xl flex items-center justify-center hover:scale-105 transition-transform duration-200 cursor-pointer">
                <Gift className="h-6 w-6 text-beuni-orange-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção "O que podemos fazer para você?" com sistema de abas */}
      <section className="py-20 bg-beuni-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-beuni-text mb-4">
              O que podemos fazer para você?
            </h2>
            <p className="text-xl text-beuni-text/80 max-w-3xl mx-auto">
              Soluções personalizadas para cada tipo de necessidade e público-alvo
            </p>
          </div>

          {/* Sistema de abas/filtros no topo */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {solutionTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-beuni-orange-500 text-white shadow-lg'
                    : 'bg-white text-beuni-text hover:bg-beuni-orange-50 border border-beuni-orange-200'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Cards que explicam cada solução */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-beuni-orange-100">
                <h3 className="text-2xl font-bold text-beuni-text mb-4">
                  {solutions[activeTab].title}
                </h3>
                <p className="text-lg text-beuni-text/80 mb-6">
                  {solutions[activeTab].description}
                </p>
                <div className="grid gap-3">
                  {solutions[activeTab].features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-beuni-orange-500 flex-shrink-0" />
                      <span className="text-beuni-text">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Card de depoimento relacionado */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-beuni-orange-100">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-beuni-orange-500 to-beuni-orange-600 rounded-full flex items-center justify-center">
                  <Star className="h-5 w-5 text-white" />
                </div>
                <div className="ml-3">
                  <div className="flex text-yellow-400 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-beuni-text/60">5.0/5 - {testimonials[currentTestimonial].company}</p>
                </div>
              </div>
              <blockquote className="text-beuni-text italic mb-4 text-sm">
                "{testimonials[currentTestimonial].text}"
              </blockquote>
              <div className="border-t pt-4">
                <p className="font-semibold text-beuni-text text-sm">{testimonials[currentTestimonial].name}</p>
                <p className="text-xs text-beuni-text/70">{testimonials[currentTestimonial].role}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção "Passo a Passo" */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-beuni-text mb-4">
              Como funciona
            </h2>
            <p className="text-xl text-beuni-text/80 max-w-3xl mx-auto">
              Processo simples e automatizado em apenas 3 passos
            </p>
          </div>

          {/* Três colunas numeradas com linhas pontilhadas */}
          <div className="relative">
            <div className="grid md:grid-cols-3 gap-8">
              {processSteps.map((step, index) => (
                <div key={index} className="text-center relative">
                  {/* Linha pontilhada conectora */}
                  {index < processSteps.length - 1 && (
                    <div className="hidden md:block absolute top-16 left-full w-full h-0.5 border-t-2 border-dashed border-beuni-orange-300 -translate-x-1/2 z-0"></div>
                  )}

                  {/* Número do passo */}
                  <div className="relative z-10 w-16 h-16 bg-gradient-to-r from-beuni-orange-500 to-beuni-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <span className="text-2xl font-bold text-white">{step.number}</span>
                  </div>

                  {/* Ícone do processo */}
                  <div className="w-20 h-20 bg-beuni-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <step.icon className="h-10 w-10 text-beuni-orange-500" />
                  </div>

                  {/* Título e descrição */}
                  <h3 className="text-xl font-bold text-beuni-text mb-4">{step.title}</h3>
                  <p className="text-beuni-text/70">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Seção Blog */}
      <section className="py-20 bg-beuni-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-beuni-text mb-4">
              Insights e Tendências
            </h2>
            <p className="text-xl text-beuni-text/80 max-w-3xl mx-auto">
              Conteúdo especializado sobre cultura organizacional e gestão de pessoas
            </p>
          </div>

          {/* Grid com 4 cards de blog */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {[
              { title: "5 Estratégias de Employee Experience", category: "RH" },
              { title: "ROI em Programas de Reconhecimento", category: "Gestão" },
              { title: "Tendências em Brindes Corporativos 2024", category: "Tendências" },
              { title: "Como Medir Engajamento de Colaboradores", category: "Analytics" }
            ].map((post, index) => (
              <article key={index} className="group cursor-pointer">
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                  <div className="h-48 bg-gradient-to-br from-beuni-orange-100 to-beuni-brown-100 flex items-center justify-center">
                    <Award className="h-12 w-12 text-beuni-orange-500" />
                  </div>
                  <div className="p-6">
                    <span className="inline-block px-3 py-1 bg-beuni-orange-100 text-beuni-orange-600 text-xs font-semibold rounded-full mb-3">
                      {post.category}
                    </span>
                    <h3 className="font-semibold text-beuni-text mb-2 group-hover:text-beuni-orange-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-beuni-text/70">
                      Descubra as melhores práticas para engajar sua equipe...
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Botão "Ver todos os posts" centralizado */}
          <div className="text-center">
            <button className="px-8 py-3 bg-beuni-brown-800 text-white font-semibold rounded-xl hover:bg-beuni-brown-900 transition-all duration-200">
              Ver todos os posts
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-beuni-orange-500 to-beuni-orange-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-beuni-orange-100 mb-8">
            Experimente gratuitamente por 30 dias. Não é necessário cartão de crédito.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/login')}
              className="px-8 py-4 bg-white text-beuni-orange-600 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 inline-flex items-center justify-center shadow-lg"
            >
              Começar Agora Mesmo
              <ChevronRight className="ml-2 h-5 w-5" />
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-8 py-4 border-2 border-white text-white text-lg font-semibold rounded-xl hover:bg-white/10 transition-all duration-200 inline-flex items-center justify-center"
            >
              Agendar Demonstração
            </button>
          </div>
        </div>
      </section>

      {/* Seção Investidores */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-beuni-text/60 mb-8">
              Empresas que confiam na Beuni
            </h3>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {clientLogos.map((logo, index) => (
                <div key={index} className="px-6 py-3 bg-gray-100 rounded-lg">
                  <span className="font-semibold text-gray-600">{logo}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer conforme PRD */}
      <footer id="contato" className="bg-beuni-text py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Logo e social media */}
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-beuni-orange-500 to-beuni-orange-600 rounded-xl flex items-center justify-center">
                  <Gift className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Beuni</span>
              </div>
              <p className="text-gray-400 mb-6 text-sm">
                Eliminamos a complexidade de comprar e enviar brindes personalizados.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-beuni-orange-500 transition-colors cursor-pointer">
                  <span className="text-white text-xs">f</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-beuni-orange-500 transition-colors cursor-pointer">
                  <span className="text-white text-xs">in</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-beuni-orange-500 transition-colors cursor-pointer">
                  <span className="text-white text-xs">ig</span>
                </div>
              </div>
            </div>

            {/* A beuni */}
            <div>
              <h3 className="font-semibold text-white mb-4">A Beuni</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#sobre" className="text-gray-400 hover:text-beuni-orange-400 transition-colors">Sobre nós</a></li>
                <li><a href="#" className="text-gray-400 hover:text-beuni-orange-400 transition-colors">Nossa história</a></li>
                <li><a href="#" className="text-gray-400 hover:text-beuni-orange-400 transition-colors">Equipe</a></li>
                <li><a href="#" className="text-gray-400 hover:text-beuni-orange-400 transition-colors">Carreiras</a></li>
                <li><a href="#" className="text-gray-400 hover:text-beuni-orange-400 transition-colors">Imprensa</a></li>
              </ul>
            </div>

            {/* Plataforma */}
            <div>
              <h3 className="font-semibold text-white mb-4">Plataforma</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-beuni-orange-400 transition-colors">Funcionalidades</a></li>
                <li><a href="#" className="text-gray-400 hover:text-beuni-orange-400 transition-colors">Preços</a></li>
                <li><a href="#" className="text-gray-400 hover:text-beuni-orange-400 transition-colors">API</a></li>
                <li><a href="#" className="text-gray-400 hover:text-beuni-orange-400 transition-colors">Integrações</a></li>
                <li><a href="#" className="text-gray-400 hover:text-beuni-orange-400 transition-colors">Suporte</a></li>
              </ul>
            </div>

            {/* Soluções */}
            <div>
              <h3 className="font-semibold text-white mb-4">Soluções</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-beuni-orange-400 transition-colors">Para RH</a></li>
                <li><a href="#" className="text-gray-400 hover:text-beuni-orange-400 transition-colors">Para Startups</a></li>
                <li><a href="#" className="text-gray-400 hover:text-beuni-orange-400 transition-colors">Para Empresas</a></li>
                <li><a href="#" className="text-gray-400 hover:text-beuni-orange-400 transition-colors">White-label</a></li>
                <li><a href="#" className="text-gray-400 hover:text-beuni-orange-400 transition-colors">Casos de uso</a></li>
              </ul>
            </div>
          </div>

          {/* Base do footer */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Beuni. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-beuni-orange-400 transition-colors">
                Política de Privacidade
              </a>
              <a href="#" className="text-gray-400 hover:text-beuni-orange-400 transition-colors">
                Termos e Condições
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}