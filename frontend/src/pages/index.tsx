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

                  {/* Menu de navegação centralizado */}
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
      <section className="py-20 bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="text-beuni-orange-600 font-semibold text-sm uppercase tracking-wide">CASES</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-beuni-text mb-4 mt-3">
              Veja o que fazemos
            </h2>
            <p className="text-lg lg:text-xl text-beuni-text/80 max-w-3xl leading-relaxed">
              Atendemos a todas as suas necessidades de brindes.
            </p>
          </div>

          {/* Grid de imagens de cases com produtos reais */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
            {[
              { icon: Gift, bg: 'from-orange-100 to-orange-200', text: 'Kits Personalizados' },
              { icon: Users, bg: 'from-blue-100 to-blue-200', text: 'Eventos Corporativos' },
              { icon: Package, bg: 'from-green-100 to-green-200', text: 'Brindes Sustentáveis' },
              { icon: Star, bg: 'from-yellow-100 to-yellow-200', text: 'Presentes VIP' },
              { icon: Heart, bg: 'from-pink-100 to-pink-200', text: 'Reconhecimento' },
              { icon: Award, bg: 'from-purple-100 to-purple-200', text: 'Celebrações' }
            ].map((item, index) => (
              <div
                key={index}
                className="group aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
              >
                <div className={`w-full h-full bg-gradient-to-br ${item.bg} flex flex-col items-center justify-center p-4 transition-transform duration-300 group-hover:scale-110`}>
                  <item.icon className="h-10 w-10 lg:h-12 lg:w-12 text-beuni-orange-600 mb-2" />
                  <span className="text-xs lg:text-sm font-semibold text-beuni-text text-center">{item.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção Kits (grid de 4) */}
      <section className="py-20 bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="text-beuni-orange-600 font-semibold text-sm uppercase tracking-wide">KITS</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-beuni-text mb-4 mt-3">Escolha o tipo de kit</h2>
            <p className="text-lg text-beuni-text/80">Selecione uma categoria para explorar opções e personalizações.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger">
            {[
              { title: 'Kit para Colaboradores', image: '/images/kits/kit-colaboradores.png', href: 'https://beuni.com.br/contato/' },
              { title: 'Kit para Eventos', image: '/images/kits/kit-eventos.png', href: 'https://beuni.com.br/contato/' },
              { title: 'Kit para Clientes', image: '/images/kits/kit-clientes.png', href: 'https://beuni.com.br/contato/' },
              { title: 'Kit para Diversos', image: '/images/kits/kit-diversos.png', href: 'https://beuni.com.br/contato/' },
            ].map((k, idx) => (
              <div
                key={idx}
                className="bg-white border border-beuni-orange-100 rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col transform hover:-translate-y-1.5 animate-zoom-in"
                style={{ ['--delay' as any]: `${idx * 100}ms` }}
              >
                <div className="relative aspect-[4/3]
                ">
                  <Image src={k.image} alt={k.title} fill className="object-cover" />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-beuni-text mb-2">{k.title}</h3>
                  <div className="mt-auto">
                    <a href={k.href} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2 bg-beuni-orange-500 text-white rounded-lg font-semibold hover:bg-beuni-orange-600 transition-colors">
                      Ver kits
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção "O que podemos fazer para você?" - reduzida */}
      <section id="solucoes" className="py-16 bg-beuni-cream">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <span className="text-beuni-orange-600 font-semibold text-sm uppercase tracking-wide">TIPOS DE BRINDES</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-beuni-text mb-3 mt-2">
              O que podemos fazer para você?
            </h2>
            <p className="text-base lg:text-lg text-beuni-text/80 max-w-4xl leading-relaxed">
              Uma gestão eficiente de brindes é essencial para qualquer organização. Na beuni, desenvolvemos uma plataforma que elimina a complexidade da compra, armazenamento e envio de brindes personalizados, oferecendo total visibilidade e controle.
            </p>
          </div>

          {/* Sistema de abas */}
          <div className="flex flex-wrap justify-center gap-2.5 mb-8">
            {solutionTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SolutionKey)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all duration-200 text-sm ${
                  activeTab === tab.id
                    ? 'bg-beuni-orange-500 text-white shadow-lg'
                    : 'bg-white text-beuni-text hover:bg-beuni-orange-50 border border-beuni-orange-200'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Cards de solução */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-beuni-orange-100">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Coluna de Texto */}
              <div>
                <h3 className="text-2xl lg:text-3xl font-bold text-beuni-text mb-3">
                  {solutions[activeTab].title}
                </h3>
                <p className="text-base lg:text-lg text-beuni-text/80 mb-5">
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

              {/* Coluna de Imagem */}
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src={solutions[activeTab].image}
                  alt={solutions[activeTab].title}
                  width={800}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
            </div>
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
      <section className="py-20 bg-beuni-cream">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl border border-beuni-orange-100">
            <div className="text-center mb-10">
              <span className="text-beuni-orange-600 font-semibold text-sm uppercase tracking-wide">INTEGRAÇÕES</span>
              <h2 className="text-3xl lg:text-4xl font-bold text-beuni-text mb-4 mt-2">
                Melhore sua experiência com integrações.
              </h2>
              <p className="text-base lg:text-lg text-beuni-text/80 max-w-3xl mx-auto">
                Integramos a beuni às mais diversas plataformas do mercado para permitir que os processos de envio aconteçam de forma automática e personalizada, tudo para tornar a experiência ainda melhor.
              </p>
            </div>

            {/* Grid de integrações com ícones e nomes */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 stagger">
              {[
                { name: 'Salesforce', icon: '☁️', color: 'from-blue-50 to-cyan-50' },
                { name: 'HubSpot', icon: '🎯', color: 'from-orange-50 to-red-50' },
                { name: 'Slack', icon: '💬', color: 'from-purple-50 to-pink-50' },
                { name: 'Zapier', icon: '⚡', color: 'from-orange-50 to-yellow-50' },
                { name: 'Google Suite', icon: '🔧', color: 'from-green-50 to-blue-50' },
                { name: 'Microsoft', icon: '🪟', color: 'from-blue-50 to-indigo-50' }
              ].map((integration, index) => (
                <div
                  key={index}
                  className={`group bg-gradient-to-br ${integration.color} rounded-xl p-6 flex flex-col items-center justify-center aspect-square hover:shadow-lg transition-all duration-300 cursor-pointer border border-beuni-orange-100 hover:border-beuni-orange-300 transform hover:-translate-y-1 animate-fade-up`}
                  style={{ ['--delay' as any]: `${index * 90}ms` }}
                >
                  <div className={`text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300`}>
                    {integration.icon}
                  </div>
                  <span className="text-xs lg:text-sm font-semibold text-beuni-text text-center">
                    {integration.name}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <button className="px-6 py-3 bg-beuni-orange-500 text-white font-semibold rounded-xl hover:bg-beuni-orange-600 transition-all duration-200 shadow-md">
                Ver todas as integrações
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Seção Contato - grid de opções */}
      <section className="py-20 bg-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-beuni-orange-600 font-semibold text-sm uppercase tracking-wide">CONTATO</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-beuni-text mb-3">Adeus tarefas manuais.</h2>
            <p className="text-beuni-text/80 max-w-2xl mx-auto">Escolha como gostaria de entrar em contato com a gente.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
            {[
              { title: 'Marcar uma reunião', desc: 'Converse com nosso time', href: 'https://materiais.beuni.com.br/plataforma', icon: Calendar },
              { title: 'Formulário de contato', desc: 'Fale sobre seu projeto', href: 'https://beuni.com.br/contato/', icon: FileText },
              { title: 'WhatsApp', desc: 'Atendimento rápido', href: 'https://beuni.com.br/contato/', icon: MessageSquare },
              { title: 'E-mail', desc: 'Envie sua mensagem', href: 'mailto:contato@beuni.com.br', icon: Mail },
              { title: 'Telefone', desc: 'Fale com a gente', href: 'https://beuni.com.br/contato/', icon: Phone },
              { title: 'Central de ajuda', desc: 'Dúvidas frequentes', href: 'https://beuni.com.br/contato/', icon: HelpCircle },
            ].map((c, idx) => (
              <a
                key={idx}
                href={c.href}
                target={c.href.startsWith('http') ? '_blank' : undefined}
                rel={c.href.startsWith('http') ? 'noreferrer' : undefined}
                className="group block bg-beuni-cream hover:bg-beuni-orange-50 border border-beuni-orange-100 rounded-2xl p-6 transition-colors animate-fade-up"
                style={{ ['--delay' as any]: `${idx * 90}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                      <c.icon className="h-5 w-5 text-beuni-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-beuni-text mb-1">{c.title}</h3>
                      <p className="text-beuni-text/70 text-sm">{c.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-6 w-6 text-beuni-orange-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </a>
            ))}
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