import React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Gift, Users, Calendar, CheckCircle, Star, ArrowRight, Shield, Zap, Heart, TrendingUp, Award, Package, Sparkles, Phone, Mail, MessageSquare, HelpCircle, FileText } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  const testimonials = [
    {
      name: "Erica de Brito Constantino",
      role: "Time de Relacionamento Institucional",
      company: "Insper",
      text: "Serviço excelente, ótimo atendimento. O time comercial foi muito atencioso, super prestativo e nos ajudou muito. O time financeiro nos auxiliou com todas as questões e, no finalzinho, também tive contato com o time de CX que nos atendeu super bem. A toda equipe, vocês foram maravilhosos. Mesmo com toda a correria, ajustes de última hora, deu muito certo. Que Deus continue abençoando toda a equipe da beuni. Nota miiiiil!",
      rating: 5
    },
    {
      name: "Muriel Aguiar",
      role: "Analista de People",
      company: "Oico",
      text: "O time da Oico está espalhado pelo Brasil e com a beuni consigo realizar a compra e envio dos kits personalizados sem dor de cabeça. Foi na nossa primeira opção pela facilidade de compra, armazenamento e gestão desses itens. Além de ter um atendimento super parceiro.",
      rating: 5
    },
    {
      name: "Renata Sollero",
      role: "Diretora LATAM de Alianças e Canais",
      company: "Active Campaign",
      text: "Atendimento maravilhoso, toda a minha jornada como cliente foi ótima. Portal de fácil entendimento também ajudou! Estão de parabéns.",
      rating: 5
    }
  ];

  // Seção "O que podemos fazer para você?"
  const solutions = {
    tech: {
      title: "Kit para Profissionais de Tech",
      description: "Brindes personalizados que conectam com a cultura tech: gadgets, acessórios para home office e itens de lifestyle.",
      features: ["Gadgets tecnológicos", "Acessórios para workspace", "Branded swag moderno"],
      image: "/images/kits/kit-diversos.png"
    },
    eventos: {
      title: "Kit para Eventos",
      description: "Crie momentos inesquecíveis em cada evento",
      features: ["Kits personalizados para eventos", "Brindes sazonais", "Comemorações especiais"],
      image: "/images/kits/kit-eventos.png"
    },
    sustentabilidade: {
      title: "Soluções Sustentáveis",
      description: "Brindes ecológicos que refletem o compromisso da sua empresa com o meio ambiente.",
      features: ["Materiais sustentáveis", "Produção consciente", "Impacto positivo"],
      image: "/images/kits/kit-diversos.png"
    },
    armazenamento: {
      title: "Armazenamento Inteligente",
      description: "Deixe conosco o estoque, logística e entregas dos seus brindes personalizados.",
      features: ["Gestão de estoque", "Logística integrada", "Entregas automatizadas"],
      image: "/images/kits/kit-diversos.png"
    },
    plataforma: {
      title: "Plataforma Completa",
      description: "Gerencie seus pedidos, estoque e entregas, tudo em um único lugar.",
      features: ["Dashboard completo", "Automação de processos", "Relatórios em tempo real"],
      image: "/images/kits/kit-diversos.png"
    },
    clientes: {
      title: "Kit para Clientes",
      description: "Encante seus clientes com presentes personalizados",
      features: ["Datas comerciais", "Marcos de relacionamento", "Fidelização B2B"],
      image: "/images/kits/kit-clientes.png"
    },
    colaboradores: {
      title: "Kit para Colaboradores",
      description: "O essencial para o dia a dia dos colaboradores",
      features: ["Reconhecimento contínuo", "Cultura de valorização", "Engajamento da equipe"],
      image: "/images/kits/kit-colaboradores.png"
    },
    natal: {
      title: "Kit para Natal",
      description: "Presentes especiais para celebrar o fim de ano com sua equipe",
      features: ["Kits temáticos de Natal", "Personalização festiva", "Entrega até 24/12"],
      image: "/images/kits/kit-diversos.png"
    }
  };

  type SolutionKey = keyof typeof solutions;

  const [activeTab, setActiveTab] = useState<SolutionKey>('colaboradores');
  const solutionTabs = [
    { id: 'tech', label: 'Profissionais de Tech', icon: Zap },
    { id: 'eventos', label: 'Eventos', icon: Calendar },
    { id: 'sustentabilidade', label: 'Sustentabilidade', icon: Heart },
    { id: 'armazenamento', label: 'Armazenamento', icon: Package },
    { id: 'plataforma', label: 'Plataforma', icon: TrendingUp },
    { id: 'clientes', label: 'Clientes', icon: Star },
    { id: 'colaboradores', label: 'Colaboradores', icon: Users },
    { id: 'natal', label: 'Natal', icon: Gift }
  ];

  // Passo a Passo do processo
  const processSteps = [
    {
      number: "01",
      title: "Escolha os produtos do kit em uma ampla variedade",
      description: "Selecione entre uma ampla variedade de produtos para criar o kit perfeito.",
      icon: Gift
    },
    {
      number: "02",
      title: "Personalize o seu kit com a sua identidade visual",
      description: "Envie suas artes e logomarcas, e nossa equipe transformará seu kit em algo incrível.",
      icon: Sparkles
    },
    {
      number: "03",
      title: "Armazene o seu pedido nos estoques da Beuni",
      description: "Gerencie seus pedidos, estoque e entregas, tudo em um único lugar.",
      icon: Shield
    }
  ];

  // Experts da Beuni
  const experts = [
    { name: 'Expert 1', avatar: '👨‍💼' },
    { name: 'Expert 2', avatar: '👩‍💼' },
    { name: 'Expert 3', avatar: '👨‍💻' }
  ];

  return (
    <div className="min-h-screen bg-beuni-cream">
      {/* Banner laranja do topo */}
      <div className="bg-gradient-to-r from-beuni-orange-500 to-beuni-orange-600 text-white py-3 text-center">
        <p className="text-sm md:text-base font-medium px-4">
          🎁 Experimente nossa ferramenta de cotação de envios! 🎁
        </p>
      </div>

      {/* Header Fixo */}
      <header className="bg-white shadow-sm sticky top-0 z-50 transition-shadow duration-300">
              <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-6">
                  {/* Logo à esquerda */}
                  <div className="flex items-center">
                    <Image
                      src="/images/logos/logo-beuni.png"
                      alt="Beuni Logo"
                      width={140}
                      height={45}
                      className="h-12 w-auto"
                    />
                  </div>

                  {/* Centered navigation menu */}
                  <nav className="hidden md:flex space-x-10">
                    <a href="#top" className="text-beuni-text hover:text-beuni-orange-500 font-semibold text-lg transition-colors">
                      Início
                    </a>
                    <a href="#solucoes" className="text-beuni-text hover:text-beuni-orange-500 font-semibold text-lg transition-colors">
                      Soluções
                    </a>
                    <a href="https://beuni.com.br/sobre-nos/" target="_blank" rel="noreferrer" className="text-beuni-text hover:text-beuni-orange-500 font-semibold text-lg transition-colors">
                      Sobre
                    </a>
                    <a href="https://beuni.com.br/contato/" target="_blank" rel="noreferrer" className="text-beuni-text hover:text-beuni-orange-500 font-semibold text-lg transition-colors">
                      Contato
                    </a>
                  </nav>            {/* CTAs à direita */}
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 text-beuni-brown-800 hover:text-beuni-brown-900 font-medium transition-colors border border-beuni-brown-800 rounded-lg"
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

      {/* Hero Section */}
      <section className="py-16 lg:py-24 relative overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Conteúdo à esquerda */}
            <div className="text-left">
              {/* Badge de experts disponíveis */}
              <div className="inline-flex items-center bg-white rounded-full px-5 py-3 shadow-lg mb-8">
                <div className="flex -space-x-2 mr-3">
                  {experts.map((expert, index) => (
                    <div key={index} className="w-10 h-10 bg-beuni-orange-100 rounded-full border-2 border-white flex items-center justify-center text-base">
                      {expert.avatar}
                    </div>
                  ))}
                </div>
                <span className="text-beuni-orange-600 font-semibold text-base">
                  🎯 beuni Experts
                </span>
                <span className="ml-2 text-beuni-text/70 text-base">
                  • Disponíveis para novos projetos
                </span>
              </div>

              <h1 className="text-6xl lg:text-7xl font-bold text-beuni-text mb-8 leading-tight">
                Eliminamos a complexidade de{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-beuni-orange-500 to-beuni-orange-600">
                  comprar e enviar brindes personalizados
                </span>
              </h1>
              <p className="text-2xl text-beuni-text/80 mb-10 max-w-2xl leading-relaxed">
                Com a beuni, você garante total visibilidade e controle dos seus brindes personalizados, tudo na nossa plataforma.
              </p>

              {/* Prova social */}
              <div className="flex items-center space-x-6 mb-10">
                <div className="flex items-center">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="ml-2 text-sm font-semibold text-beuni-text">5.0</span>
                </div>
                <span className="text-sm text-beuni-text/70">de 120+ reviews</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <button
                  onClick={() => router.push('/login')}
                  className="px-10 py-5 bg-beuni-brown-800 text-white text-xl font-semibold rounded-xl hover:bg-beuni-brown-900 transition-all duration-200 flex items-center justify-center shadow-lg"
                >
                  Entrar na Plataforma
                  <ArrowRight className="ml-3 h-6 w-6" />
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="px-10 py-5 border-2 border-beuni-orange-500 text-beuni-orange-600 text-xl font-semibold rounded-xl hover:bg-beuni-orange-50 transition-all duration-200 flex items-center justify-center"
                >
                  Fazer Orçamento
                </button>
              </div>

              {/* Logos de empresas - carrossel + métrica de confiança */}
              <div className="mt-12">
                <p className="text-sm text-beuni-text/60 mb-4 font-medium">
                  Plataforma de Confiança das Principais Empresas em Diversos Setores:
                </p>
                <div className="relative overflow-hidden">
                  <div className="flex animate-scroll">
                    <div className="flex items-center gap-12 pr-12">
                      {['MAERSK','Cargill','SOMOS','isaac','CONQUER'].map((brand, idx) => (
                        <span key={`brand-a-${idx}`} className="font-semibold text-gray-600 hover:text-beuni-orange-500 transition-all duration-300 transform hover:scale-110 cursor-pointer whitespace-nowrap">
                          {brand}
                        </span>
                      ))}
                      {['MAERSK','Cargill','SOMOS','isaac','CONQUER'].map((brand, idx) => (
                        <span key={`brand-b-${idx}`} className="font-semibold text-gray-600 hover:text-beuni-orange-500 transition-all duration-300 transform hover:scale-110 cursor-pointer whitespace-nowrap">
                          {brand}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-6 inline-flex items-center px-4 py-2 bg-white rounded-full border border-beuni-orange-200 shadow-sm">
                  <span className="text-sm font-semibold text-beuni-text">Confiável por 3.700 marcas empresariais e mais de 1,3 milhões</span>
                </div>
              </div>
            </div>

            {/* Composição gráfica à direita - Grid 2x2 de produtos */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-6">
                <div className="relative group rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
                  <Image
                    src="/images/products/garrafa-laranja.png"
                    alt="Garrafa térmica personalizada"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="relative group rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
                  <Image
                    src="/images/products/camiseta-laranja.png"
                    alt="Camiseta personalizada"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="relative group rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
                  <Image
                    src="/images/products/mochila-marrom.png"
                    alt="Mochila personalizada"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="relative group rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105">
                  <Image
                    src="/images/products/ecobag-laranja.png"
                    alt="Ecobag personalizada"
                    width={300}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Cases - "Veja o que fazemos" */}
      <section className="py-20 bg-gradient-to-br from-beuni-cream to-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-beuni-orange-600 font-semibold text-sm uppercase tracking-wide animate-fade-up">CASES</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-beuni-text mb-4 mt-3 animate-fade-up" style={{ ['--delay' as any]: '100ms' }}>
              Veja o que fazemos
            </h2>
            <p className="text-lg lg:text-xl text-beuni-text/80 max-w-3xl mx-auto leading-relaxed animate-fade-up" style={{ ['--delay' as any]: '200ms' }}>
              Atendemos a todas as suas necessidades de brindes corporativos com soluções personalizadas e inovadoras.
            </p>
          </div>

          {/* Grid de cases mais elaborado */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger">
            {[
              { 
                icon: Gift, 
                title: 'Kits Personalizados',
                desc: 'Soluções completas para sua marca',
                gradient: 'from-orange-400 to-red-500',
                bgPattern: 'from-orange-50 to-orange-100'
              },
              { 
                icon: Users, 
                title: 'Eventos Corporativos',
                desc: 'Brindes especiais para cada ocasião',
                gradient: 'from-blue-400 to-indigo-500',
                bgPattern: 'from-blue-50 to-blue-100'
              },
              { 
                icon: Package, 
                title: 'Brindes Sustentáveis',
                desc: 'Produtos eco-friendly e responsáveis',
                gradient: 'from-green-400 to-emerald-500',
                bgPattern: 'from-green-50 to-green-100'
              },
              { 
                icon: Star, 
                title: 'Presentes VIP',
                desc: 'Itens exclusivos para clientes especiais',
                gradient: 'from-yellow-400 to-orange-500',
                bgPattern: 'from-yellow-50 to-yellow-100'
              },
              { 
                icon: Heart, 
                title: 'Reconhecimento',
                desc: 'Valorize sua equipe com brindes únicos',
                gradient: 'from-pink-400 to-rose-500',
                bgPattern: 'from-pink-50 to-pink-100'
              },
              { 
                icon: Award, 
                title: 'Celebrações',
                desc: 'Marcos importantes merecem presentes especiais',
                gradient: 'from-purple-400 to-violet-500',
                bgPattern: 'from-purple-50 to-purple-100'
              }
            ].map((item, index) => (
              <div
                key={index}
                className={`group relative bg-gradient-to-br ${item.bgPattern} rounded-3xl p-8 hover-lift animate-bounce-in border border-white/50 shadow-lg hover:shadow-2xl`}
                style={{ ['--delay' as any]: `${index * 150}ms` }}
              >
                {/* Ícone com gradiente */}
                <div className={`w-16 h-16 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:animate-pulse-glow`}>
                  <item.icon className="h-8 w-8 text-white" />
                </div>
                
                {/* Conteúdo */}
                <h3 className="text-xl font-bold text-beuni-text mb-3 group-hover:text-beuni-orange-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-beuni-text/70 leading-relaxed">
                  {item.desc}
                </p>

                {/* Elemento decorativo */}
                <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
              </div>
            ))}
          </div>

          {/* CTA da seção */}
          <div className="text-center mt-12 animate-fade-up" style={{ ['--delay' as any]: '800ms' }}>
            <button className="px-8 py-4 bg-beuni-orange-500 text-white text-lg font-semibold rounded-2xl hover:bg-beuni-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Ver todos os nossos cases
            </button>
          </div>
        </div>
      </section>

      {/* Seção Kits (grid de 4) */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Elementos decorativos de fundo */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-beuni-orange-500 rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-beuni-brown-600 rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-beuni-orange-400 rounded-full"></div>
        </div>
        
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="mb-12 text-center">
            <span className="text-beuni-orange-600 font-semibold text-sm uppercase tracking-wide animate-fade-up">KITS</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-beuni-text mb-4 mt-3 animate-slide-in-left" style={{ ['--delay' as any]: '150ms' }}>
              Escolha o tipo de kit
            </h2>
            <p className="text-lg text-beuni-text/80 animate-slide-in-right" style={{ ['--delay' as any]: '300ms' }}>
              Selecione uma categoria para explorar opções e personalizações exclusivas.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 stagger">
            {[
              { 
                title: 'Kit para Colaboradores', 
                image: '/images/kits/kit-colaboradores.png', 
                href: 'https://beuni.com.br/contato/',
                color: 'from-blue-500 to-indigo-600',
                desc: 'Fortaleça o engajamento da sua equipe'
              },
              { 
                title: 'Kit para Eventos', 
                image: '/images/kits/kit-eventos.png', 
                href: 'https://beuni.com.br/contato/',
                color: 'from-purple-500 to-pink-600',
                desc: 'Momentos especiais merecem brindes únicos'
              },
              { 
                title: 'Kit para Clientes', 
                image: '/images/kits/kit-clientes.png', 
                href: 'https://beuni.com.br/contato/',
                color: 'from-green-500 to-teal-600',
                desc: 'Impressione e fidelize seus clientes'
              },
              { 
                title: 'Kit para Diversos', 
                image: '/images/kits/kit-diversos.png', 
                href: 'https://beuni.com.br/contato/',
                color: 'from-orange-500 to-red-600',
                desc: 'Soluções versáteis para toda ocasião'
              },
            ].map((k, idx) => (
              <div
                key={idx}
                className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden hover-lift animate-float-up border border-gray-100"
                style={{ ['--delay' as any]: `${idx * 150}ms` }}
              >
                {/* Imagem com efeito overlay */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image 
                    src={k.image} 
                    alt={k.title} 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                {/* Conteúdo do card */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-beuni-text mb-2 group-hover:text-beuni-orange-600 transition-colors">
                    {k.title}
                  </h3>
                  <p className="text-sm text-beuni-text/70 mb-4 leading-relaxed">
                    {k.desc}
                  </p>
                  
                  <div className="mt-auto">
                    <a 
                      href={k.href} 
                      target="_blank" 
                      rel="noreferrer" 
                      className={`inline-flex items-center px-6 py-3 bg-gradient-to-r ${k.color} text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 group-hover:animate-pulse-glow`}
                    >
                      Ver kits
                      <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </a>
                  </div>
                </div>

                {/* Elemento decorativo */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <div className={`w-3 h-3 bg-gradient-to-r ${k.color} rounded-full`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção "O que podemos fazer para você?" - layout moderno e compacto */}
      <section id="solucoes" className="py-16 bg-gradient-to-br from-beuni-cream to-beuni-orange-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-block px-3 py-1 bg-beuni-orange-100 text-beuni-orange-600 font-semibold text-xs uppercase tracking-wide rounded-full mb-4">
              TIPOS DE BRINDES
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-beuni-text mb-3">
              O que podemos fazer para você?
            </h2>
            <p className="text-base text-beuni-text/70 max-w-2xl mx-auto">
              Soluções completas de brindes personalizados com tecnologia e design únicos.
            </p>
          </div>

          {/* Grid de soluções moderno */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { icon: Users, title: 'Colaboradores', desc: 'Engaje sua equipe' },
              { icon: Star, title: 'Clientes', desc: 'Fidelize relacionamentos' },
              { icon: Calendar, title: 'Eventos', desc: 'Momentos especiais' },
              { icon: Gift, title: 'Personalizados', desc: 'Brindes únicos' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 hover:bg-white hover:shadow-xl transition-all duration-300 border border-white/20 animate-fade-up"
                style={{ ['--delay' as any]: `${idx * 100}ms` }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-beuni-orange-400 to-beuni-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-beuni-text mb-2">{item.title}</h3>
                <p className="text-sm text-beuni-text/70">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA centralizado */}
          <div className="text-center">
            <button
              onClick={() => router.push('/login')}
              className="inline-flex items-center px-8 py-4 bg-beuni-brown-800 text-white font-semibold rounded-2xl hover:bg-beuni-brown-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Explore todas as soluções
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Seção "Passo a Passo" */}
      <section className="py-20 bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="text-beuni-orange-600 font-semibold text-sm uppercase tracking-wide">PASSO A PASSO</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-beuni-text mb-4 mt-2">
              Como fazer meu pedido de brindes personalizados com a beuni
            </h2>
          </div>

          <div className="relative">
            <div className="grid md:grid-cols-3 gap-12 stagger">
              {processSteps.map((step, index) => (
                <div key={index} className="text-center relative animate-fade-up" style={{ ['--delay' as any]: `${index * 120}ms` }}>
                  {/* Linha conectora */}
                  {index < processSteps.length - 1 && (
                    <div className="hidden md:block absolute top-20 left-[60%] w-[80%] h-0.5 border-t-2 border-dashed border-beuni-orange-300 z-0"></div>
                  )}

                  {/* Card do passo */}
                  <div className="relative z-10 bg-gradient-to-br from-beuni-orange-50 to-beuni-brown-50 rounded-3xl p-8 h-full border-2 border-beuni-orange-200 transform hover:-translate-y-1 transition-transform duration-300">
                    {/* Número */}
                    <div className="w-16 h-16 bg-gradient-to-r from-beuni-orange-500 to-beuni-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-zoom-in" style={{ ['--delay' as any]: `${index * 120 + 80}ms` }}>
                      <span className="text-2xl font-bold text-white">{step.number}</span>
                    </div>

                    {/* Título e descrição */}
                    <h3 className="text-xl font-bold text-beuni-text mb-4">{step.title}</h3>
                    <p className="text-beuni-text/70 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Linha com ícone de caixa */}
          <div className="mt-16 flex justify-center">
            <div className="bg-gradient-to-r from-beuni-orange-500 to-beuni-orange-600 rounded-2xl p-1">
              <div className="bg-white rounded-xl px-8 py-4 flex items-center space-x-4">
                <Package className="h-8 w-8 text-beuni-orange-500" />
                <span className="font-semibold text-beuni-text">Processo simples e automatizado</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Integrações */}
      <section className="py-24 bg-gradient-to-br from-beuni-cream via-white to-beuni-cream relative overflow-hidden">
        {/* Elementos de fundo animados */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-40 h-40 bg-beuni-orange-400 rounded-full animate-bounce" style={{animationDuration: '3s'}}></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-beuni-brown-400 rounded-full animate-bounce" style={{animationDuration: '4s', animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-beuni-orange-300 rounded-full animate-bounce" style={{animationDuration: '2.5s', animationDelay: '0.5s'}}></div>
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Header da seção */}
          <div className="text-center mb-16">
            <span className="text-beuni-orange-600 font-semibold text-sm uppercase tracking-wide animate-fade-up">INTEGRAÇÕES</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-beuni-text mb-6 mt-3 animate-slide-in-left" style={{ ['--delay' as any]: '150ms' }}>
              Conecte-se com suas ferramentas favoritas
            </h2>
            <p className="text-lg lg:text-xl text-beuni-text/80 max-w-4xl mx-auto leading-relaxed animate-slide-in-right" style={{ ['--delay' as any]: '300ms' }}>
              Integramos a beuni às principais plataformas do mercado para automatizar seus processos de envio e personalizar cada experiência.
            </p>
          </div>

          {/* Container principal com design mais elaborado */}
          <div className="bg-white rounded-4xl p-12 shadow-2xl border-2 border-beuni-orange-100 relative overflow-hidden animate-zoom-in" style={{ ['--delay' as any]: '450ms' }}>
            {/* Padrão de fundo sutil */}
            <div className="absolute inset-0 opacity-5">
              <div className="grid grid-cols-8 gap-4 h-full">
                {Array.from({length: 32}).map((_, i) => (
                  <div key={i} className="bg-beuni-orange-500 rounded-full w-2 h-2"></div>
                ))}
              </div>
            </div>

            {/* Grid de integrações mais elaborado */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12 stagger relative">
              {[
                { 
                  name: 'Salesforce', 
                  icon: '☁️', 
                  gradient: 'from-blue-500 to-cyan-500',
                  desc: 'CRM Integration'
                },
                { 
                  name: 'HubSpot', 
                  icon: '🎯', 
                  gradient: 'from-orange-500 to-red-500',
                  desc: 'Marketing Hub'
                },
                { 
                  name: 'Slack', 
                  icon: '💬', 
                  gradient: 'from-purple-500 to-pink-500',
                  desc: 'Team Communication'
                },
                { 
                  name: 'Zapier', 
                  icon: '⚡', 
                  gradient: 'from-orange-400 to-yellow-500',
                  desc: 'Workflow Automation'
                },
                { 
                  name: 'Google Suite', 
                  icon: '🔧', 
                  gradient: 'from-green-500 to-blue-500',
                  desc: 'Productivity Tools'
                },
                { 
                  name: 'Microsoft', 
                  icon: '🪟', 
                  gradient: 'from-blue-600 to-indigo-600',
                  desc: 'Enterprise Solutions'
                }
              ].map((integration, index) => (
                <div
                  key={index}
                  className="group relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 border-gray-100 hover:border-beuni-orange-300 hover-lift animate-bounce-in hover-glow"
                  style={{ ['--delay' as any]: `${index * 120}ms` }}
                >
                  {/* Gradiente superior */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${integration.gradient} rounded-t-2xl`}></div>
                  
                  {/* Ícone principal */}
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 bg-gradient-to-r ${integration.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:animate-pulse-glow transform group-hover:scale-110 transition-transform duration-300`}>
                      <span className="text-2xl">{integration.icon}</span>
                    </div>
                    
                    <h3 className="font-bold text-beuni-text mb-2 group-hover:text-beuni-orange-600 transition-colors">
                      {integration.name}
                    </h3>
                    <p className="text-xs text-beuni-text/60 group-hover:text-beuni-text/80 transition-colors">
                      {integration.desc}
                    </p>
                  </div>

                  {/* Elemento decorativo de canto */}
                  <div className="absolute top-3 right-3 w-3 h-3 bg-beuni-orange-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              ))}
            </div>

            {/* Seção de conectores visuais */}
            <div className="relative mb-12">
              <div className="flex items-center justify-center">
                <div className="flex items-center space-x-4 animate-fade-up" style={{ ['--delay' as any]: '800ms' }}>
                  <div className="w-3 h-3 bg-beuni-orange-500 rounded-full animate-pulse"></div>
                  <div className="w-16 h-0.5 bg-gradient-to-r from-beuni-orange-500 to-beuni-brown-500"></div>
                  <div className="w-6 h-6 bg-gradient-to-r from-beuni-orange-500 to-beuni-brown-500 rounded-full flex items-center justify-center">
                    <Zap className="w-3 h-3 text-white" />
                  </div>
                  <div className="w-16 h-0.5 bg-gradient-to-r from-beuni-brown-500 to-beuni-orange-500"></div>
                  <div className="w-3 h-3 bg-beuni-brown-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                </div>
              </div>
            </div>

            {/* CTAs da seção */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-up" style={{ ['--delay' as any]: '1000ms' }}>
              <button className="px-8 py-4 bg-gradient-to-r from-beuni-orange-500 to-beuni-brown-600 text-white text-lg font-semibold rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
                Ver todas as integrações
              </button>
              <button className="px-8 py-4 border-2 border-beuni-orange-500 text-beuni-orange-600 text-lg font-semibold rounded-2xl hover:bg-beuni-orange-50 transition-all duration-300">
                Solicitar nova integração
              </button>
            </div>
          </div>

          {/* Elementos decorativos externos */}
          <div className="mt-12 grid grid-cols-3 gap-8 opacity-30">
            <div className="h-0.5 bg-gradient-to-r from-transparent via-beuni-orange-300 to-transparent animate-fade-up" style={{ ['--delay' as any]: '1200ms' }}></div>
            <div className="h-0.5 bg-gradient-to-r from-transparent via-beuni-brown-300 to-transparent animate-fade-up" style={{ ['--delay' as any]: '1300ms' }}></div>
            <div className="h-0.5 bg-gradient-to-r from-transparent via-beuni-orange-300 to-transparent animate-fade-up" style={{ ['--delay' as any]: '1400ms' }}></div>
          </div>
        </div>
      </section>

      {/* Seção Contato - redesign completo */}
      <section className="py-24 bg-gradient-to-br from-white via-beuni-cream to-white relative overflow-hidden">
        {/* Elementos decorativos de fundo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-20 w-32 h-32 bg-beuni-orange-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-beuni-brown-400 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-beuni-orange-300 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Header impactante */}
          <div className="text-center mb-16">
            <span className="text-beuni-orange-600 font-semibold text-sm uppercase tracking-wide animate-fade-up">FALE CONOSCO</span>
            <h2 className="text-4xl lg:text-6xl font-bold text-beuni-text mb-6 mt-3 animate-slide-in-left" style={{ ['--delay' as any]: '150ms' }}>
              Adeus tarefas manuais
            </h2>
            <p className="text-lg lg:text-xl text-beuni-text/80 max-w-3xl mx-auto mb-8 animate-slide-in-right" style={{ ['--delay' as any]: '300ms' }}>
              Escolha a forma mais conveniente para começar sua jornada com a beuni. Nossa equipe está pronta para transformar sua gestão de brindes.
            </p>
            
            {/* Badge de resposta rápida */}
            <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-lg border border-beuni-orange-200 animate-bounce-in" style={{ ['--delay' as any]: '450ms' }}>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-sm font-semibold text-beuni-text">Respondemos em até 2 horas</span>
            </div>
          </div>

          {/* Grid principal de contatos */}
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Seção principais (destaque) */}
            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6">
              {[
                { 
                  title: 'Marcar Reunião', 
                  desc: 'Converse ao vivo com nossos especialistas', 
                  href: 'https://materiais.beuni.com.br/plataforma', 
                  icon: Calendar,
                  gradient: 'from-blue-500 to-indigo-600',
                  featured: true
                },
                { 
                  title: 'Orçamento Express', 
                  desc: 'Receba uma proposta personalizada', 
                  href: 'https://beuni.com.br/contato/', 
                  icon: FileText,
                  gradient: 'from-green-500 to-emerald-600',
                  featured: true
                },
              ].map((c, idx) => (
                <a
                  key={idx}
                  href={c.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-beuni-orange-100 hover:border-beuni-orange-300 hover-lift animate-float-up"
                  style={{ ['--delay' as any]: `${idx * 200}ms` }}
                >
                  {/* Gradiente superior */}
                  <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${c.gradient} rounded-t-3xl`}></div>
                  
                  {/* Ícone principal */}
                  <div className={`w-16 h-16 bg-gradient-to-r ${c.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:animate-pulse-glow`}>
                    <c.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-beuni-text mb-3 group-hover:text-beuni-orange-600 transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-beuni-text/70 mb-6 leading-relaxed">
                    {c.desc}
                  </p>
                  
                  <div className="flex items-center text-beuni-orange-600 font-semibold group-hover:translate-x-2 transition-transform">
                    <span>Começar agora</span>
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </div>

                  {/* Elemento decorativo */}
                  <div className="absolute top-6 right-6 w-12 h-12 bg-beuni-orange-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </a>
              ))}
            </div>

            {/* Seção de contatos rápidos */}
            <div className="bg-gradient-to-br from-beuni-orange-50 to-beuni-brown-50 rounded-3xl p-8 border-2 border-beuni-orange-200 animate-bounce-in" style={{ ['--delay' as any]: '400ms' }}>
              <h3 className="text-xl font-bold text-beuni-text mb-6 text-center">Contato Direto</h3>
              
              <div className="space-y-4">
                {[
                  { title: 'WhatsApp', desc: '(11) 99999-9999', href: 'https://beuni.com.br/contato/', icon: MessageSquare, color: 'text-green-600' },
                  { title: 'E-mail', desc: 'contato@beuni.com.br', href: 'mailto:contato@beuni.com.br', icon: Mail, color: 'text-blue-600' },
                  { title: 'Telefone', desc: '(11) 3333-3333', href: 'https://beuni.com.br/contato/', icon: Phone, color: 'text-purple-600' },
                  { title: 'Central de Ajuda', desc: 'FAQ e suporte', href: 'https://beuni.com.br/contato/', icon: HelpCircle, color: 'text-orange-600' },
                ].map((c, idx) => (
                  <a
                    key={idx}
                    href={c.href}
                    target={c.href.startsWith('http') ? '_blank' : undefined}
                    rel={c.href.startsWith('http') ? 'noreferrer' : undefined}
                    className="group flex items-center space-x-3 p-3 bg-white rounded-xl hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-beuni-orange-100 transition-colors`}>
                      <c.icon className={`h-5 w-5 ${c.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-beuni-text">{c.title}</p>
                      <p className="text-xs text-beuni-text/60 truncate">{c.desc}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-beuni-orange-600 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-1 group-hover:translate-x-0" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Seção de benefícios/garantias */}
          <div className="bg-white rounded-3xl p-8 shadow-lg border border-beuni-orange-100 animate-fade-up" style={{ ['--delay' as any]: '600ms' }}>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {[
                { icon: Shield, title: 'Atendimento Especializado', desc: 'Consultores dedicados para seu projeto' },
                { icon: Zap, title: 'Resposta Rápida', desc: 'Retorno garantido em até 2 horas úteis' },
                { icon: Heart, title: 'Suporte Completo', desc: 'Acompanhamento em todas as etapas' },
              ].map((item, idx) => (
                <div key={idx} className="group hover-tilt">
                  <div className="w-12 h-12 bg-gradient-to-r from-beuni-orange-500 to-beuni-brown-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:animate-pulse-glow">
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-bold text-beuni-text mb-2">{item.title}</h4>
                  <p className="text-sm text-beuni-text/70">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Seção Depoimentos */}
      <section className="py-20 bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-beuni-orange-600 font-semibold text-sm uppercase tracking-wide">DEPOIMENTOS</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-beuni-text mb-4 mt-3">
              O que falam sobre a beuni
            </h2>
            <p className="text-lg lg:text-xl text-beuni-text/80 max-w-4xl mx-auto leading-relaxed">
              Cada projeto na beuni é uma parceria em que colocamos nossa criatividade e expertise para transformar ideias em soluções memoráveis. Veja o que nossos clientes têm a dizer sobre suas jornadas conosco!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-beuni-orange-50 to-beuni-brown-50 rounded-3xl p-8 border-2 border-beuni-orange-200">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <blockquote className="text-beuni-text mb-6 leading-relaxed">
                  "{testimonial.text}"
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-beuni-orange-500 to-beuni-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-beuni-text">{testimonial.name}</p>
                    <p className="text-sm text-beuni-text/70">{testimonial.role}</p>
                    <p className="text-xs text-beuni-orange-600 font-semibold">{testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog removido por solicitação */}

      {/* Seção Investidores */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-beuni-orange-600 font-semibold text-sm uppercase tracking-wide mb-4 block">NOSSOS INVESTIDORES</span>
            <h3 className="text-3xl lg:text-4xl font-bold text-beuni-text mb-10">
              Quem acredita e nos impulsiona
            </h3>
            <div className="relative overflow-hidden">
              {/* Animação de scroll infinito */}
              <div className="flex animate-scroll">
                <div className="flex space-x-12 items-center pr-12">
                  {['🎯 Sai do Papel','💼 Investidores.vc','👼 ERA Angels','⚖️ EquityRio'].map((name, idx) => (
                    <span key={`inv-a-${idx}`} className="font-semibold text-gray-600 text-lg hover:text-beuni-orange-500 transition-all duration-300 transform hover:scale-110 cursor-pointer whitespace-nowrap">{name}</span>
                  ))}
                  {['🎯 Sai do Papel','💼 Investidores.vc','👼 ERA Angels','⚖️ EquityRio'].map((name, idx) => (
                    <span key={`inv-b-${idx}`} className="font-semibold text-gray-600 text-lg hover:text-beuni-orange-500 transition-all duration-300 transform hover:scale-110 cursor-pointer whitespace-nowrap">{name}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-beuni-text py-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-10 mb-16">
            {/* Logo e descrição */}
            <div className="md:col-span-1">
              <div className="mb-6">
                <Image
                  src="/images/logos/logo-beuni.png"
                  alt="Beuni Logo"
                  width={120}
                  height={40}
                  className="h-10 w-auto brightness-0 invert"
                />
              </div>
              <p className="text-gray-400 mb-6 text-sm">
                A beuni nasceu de uma simples vontade: aproximar ainda mais pessoas através de experiências incríveis e tecnologia.
              </p>
              <div className="flex space-x-4">
                {[
                  { href: 'https://www.instagram.com/beunibr', label: 'Instagram', text: 'IG' },
                  { href: 'https://www.linkedin.com/company/beuni/', label: 'LinkedIn', text: 'IN' },
                  { href: 'https://www.youtube.com/@beunibr', label: 'YouTube', text: 'YT' },
                  { href: 'https://www.facebook.com/beunibr', label: 'Facebook', text: 'FB' },
                  { href: 'https://br.pinterest.com/beunibr/', label: 'Pinterest', text: 'PI' },
                  { href: 'https://www.tiktok.com/@beunibr', label: 'TikTok', text: 'TK' },
                ].map((s, idx) => (
                  <a key={idx} href={s.href} target="_blank" rel="noreferrer" title={s.label} aria-label={s.label} className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-beuni-orange-500 transition-colors cursor-pointer">
                    <svg viewBox="0 0 32 32" className="w-5 h-5">
                      <circle cx="16" cy="16" r="14" fill="none" stroke="white" strokeWidth="2" />
                      <text x="16" y="21" textAnchor="middle" fontSize="10" fill="white" fontFamily="Inter, sans-serif">{s.text}</text>
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* A beuni */}
            <div>
              <h3 className="font-semibold text-white mb-4">A beuni</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-beuni-orange-400 transition-colors">Sobre</a></li>
                <li><a href="#" className="text-gray-400 hover:text-beuni-orange-400 transition-colors">Vagas</a></li>
              </ul>
            </div>

            {/* Plataforma */}
            <div>
              <h3 className="font-semibold text-white mb-4">Plataforma</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="https://beuni.com.br/plataforma-beuni/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-beuni-orange-400 transition-colors">Plataforma beuni</a></li>
                <li><a href="https://beuni.com.br/contato" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-beuni-orange-400 transition-colors">Personalização</a></li>
                <li><a href="https://beuni.com.br/integracoes" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-beuni-orange-400 transition-colors">Integrações</a></li>
                <li><a href="https://beuni.com.br/planos/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-beuni-orange-400 transition-colors">Planos</a></li>
              </ul>
            </div>

            {/* Soluções */}
            <div>
              <h3 className="font-semibold text-white mb-4">Soluções</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="https://beuni.com.br/times-de-marketing/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-beuni-orange-400 transition-colors">Times de Marketing</a></li>
                <li><a href="https://beuni.com.br/contato/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-beuni-orange-400 transition-colors">Times de RH</a></li>
                <li><a href="https://beuni.com.br/contato/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-beuni-orange-400 transition-colors">Times de CX/CS</a></li>
              </ul>
            </div>
          </div>

          {/* Base do footer */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 BeUni. Todos os direitos reservados
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="https://drive.google.com/file/d/1swP3ezdo3bPa-2mUHXzPL4UG94jYkypx/view" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-beuni-orange-400 transition-colors">Política de Privacidade</a>
              <a href="https://drive.google.com/file/d/1r5cZDQcLyyY2eeOp_P1iUDqD2p6np1dj/view" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-beuni-orange-400 transition-colors">Termos e Condições</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}