import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Gift, Users, Calendar, ChevronRight, CheckCircle, Star, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Ana Silva",
      role: "Gerente de RH - Tech Corp",
      text: "A Beuni transformou nosso processo de gestão de aniversariantes. Agora nunca mais esquecemos de parabenizar nossos colaboradores!"
    },
    {
      name: "Carlos Santos",
      role: "Diretor de Pessoas - StartupXYZ",
      text: "Sistema intuitivo e eficiente. Nossos colaboradores se sentem mais valorizados desde que implementamos a Beuni."
    },
    {
      name: "Maria Oliveira",
      role: "Coordenadora RH - Empresa ABC",
      text: "A automação do envio de brindes economizou horas do nosso time. Excelente ferramenta!"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const features = [
    {
      icon: Users,
      title: "Gestão de Colaboradores",
      description: "Cadastre e gerencie todos os colaboradores da sua empresa em um só lugar"
    },
    {
      icon: Calendar,
      title: "Calendário de Aniversários",
      description: "Visualize todos os aniversários do mês e não perca nenhuma data importante"
    },
    {
      icon: Gift,
      title: "Envio Automático de Brindes",
      description: "Configure o envio automático de brindes personalizados para aniversariantes"
    }
  ];

  const benefits = [
    "Interface intuitiva e fácil de usar",
    "Automação completa do processo",
    "Relatórios detalhados de envios",
    "Integração com API de CEP",
    "Suporte técnico especializado",
    "Segurança e privacidade dos dados"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">Beuni</span>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                Entrar
              </button>
              <button
                onClick={() => router.push('/login')}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 font-medium transition-all duration-200"
              >
                Começar Agora
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Gerencie aniversários dos
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
              {' '}colaboradores{' '}
            </span>
            automaticamente
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Plataforma completa para gestão de aniversariantes corporativos com envio automático de brindes,
            calendário inteligente e relatórios detalhados.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/login')}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center"
            >
              Começar Gratuitamente
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 text-lg font-semibold rounded-xl hover:border-gray-400 transition-all duration-200"
            >
              Ver Demonstração
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tudo que você precisa em uma plataforma
            </h2>
            <p className="text-xl text-gray-600">
              Recursos completos para tornar a gestão de aniversariantes simples e eficiente
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-8 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Por que escolher a Beuni?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Nossa plataforma foi desenvolvida especificamente para empresas que valorizam seus colaboradores
                e querem automatizar o processo de reconhecimento em datas especiais.
              </p>
              <div className="grid gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <div className="flex text-yellow-400 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">4.9/5 - Baseado em 250+ avaliações</p>
                </div>
              </div>
              <blockquote className="text-gray-700 italic mb-4">
                "{testimonials[currentTestimonial].text}"
              </blockquote>
              <div className="flex items-center">
                <div>
                  <p className="font-semibold text-gray-900">{testimonials[currentTestimonial].name}</p>
                  <p className="text-sm text-gray-500">{testimonials[currentTestimonial].role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Experimente gratuitamente por 30 dias. Não é necessário cartão de crédito.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 inline-flex items-center"
          >
            Começar Agora Mesmo
            <ChevronRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Gift className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Beuni</span>
            </div>
            <p className="text-gray-400 mb-6">
              Transformando a gestão de aniversariantes corporativos através da tecnologia.
            </p>
            <div className="border-t border-gray-800 pt-6">
              <p className="text-gray-400 text-sm">
                © 2024 Beuni. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}