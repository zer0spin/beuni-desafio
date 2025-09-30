import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Calendar, Users, ChevronLeft, ChevronRight, Gift, Download, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';

import Layout from '@/components/Layout';
import api, { getUser } from '../../lib/api';

interface Colaborador {
  id: string;
  nome_completo: string;
  data_nascimento: string;
  cargo: string;
  departamento: string;
  endereco: {
    logradouro: string;
    bairro: string;
    cidade: string;
    uf: string;
  };
  status_envio_atual: string;
}

interface DiaCalendario {
  dia: number;
  aniversariantes: Colaborador[];
  isCurrentMonth: boolean;
  isToday: boolean;
  date: Date;
}

export default function CalendarioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dataAtual, setDataAtual] = useState(new Date());
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [diasCalendario, setDiasCalendario] = useState<DiaCalendario[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [filtroDepartamento, setFiltroDepartamento] = useState<string>('TODOS');
  const [departamentos, setDepartamentos] = useState<string[]>([]);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    loadColaboradores();
  }, [dataAtual, filtroStatus, filtroDepartamento]);

  const loadColaboradores = async () => {
    try {
      setLoading(true);

      // Buscar todos os colaboradores primeiro
      const response = await api.get('/colaboradores?limit=100'); // Usar limite razoável

      // Verificar se a resposta possui dados válidos
      if (!response.data || !response.data.colaboradores) {
        console.log('Resposta da API:', response.data);
        setColaboradores([]);
        setDiasCalendario([]);
        setDepartamentos([]);
        return;
      }

      const todosColaboradores = response.data.colaboradores || [];
      console.log('Colaboradores carregados:', todosColaboradores.length);

      // Extrair departamentos únicos
      const deptUnicos = [...new Set(todosColaboradores.map((c: Colaborador) => c.departamento).filter(Boolean))];
      setDepartamentos(deptUnicos);

      // Filtrar colaboradores por departamento se necessário
      let colaboradoresFiltrados = filtroDepartamento === 'TODOS'
        ? todosColaboradores
        : todosColaboradores.filter((c: Colaborador) => c.departamento === filtroDepartamento);

      // Filtrar por status se necessário
      if (filtroStatus !== 'TODOS') {
        colaboradoresFiltrados = colaboradoresFiltrados.filter((c: Colaborador) => c.status_envio_atual === filtroStatus);
      }

      setColaboradores(colaboradoresFiltrados);
      console.log('Colaboradores filtrados:', colaboradoresFiltrados.length);

      // Gerar calendário
      generateCalendar(colaboradoresFiltrados);

    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
      toast.error('Erro ao carregar dados do calendário. Verifique sua conexão.');
      setColaboradores([]);
      setDiasCalendario([]);
      setDepartamentos([]);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendar = (colaboradores: Colaborador[]) => {
    try {
      const ano = dataAtual.getFullYear();
      const mes = dataAtual.getMonth();

      console.log('Gerando calendário para:', ano, mes + 1);

      // Primeiro dia do mês e último dia do mês
      const primeiroDia = new Date(ano, mes, 1);
      const ultimoDia = new Date(ano, mes + 1, 0);

      // Primeiro dia da semana do calendário (domingo da primeira semana)
      const primeiroDiaCalendario = new Date(primeiroDia);
      primeiroDiaCalendario.setDate(primeiroDia.getDate() - primeiroDia.getDay());

      // Último dia da semana do calendário (sábado da última semana)
      const ultimoDiaCalendario = new Date(ultimoDia);
      ultimoDiaCalendario.setDate(ultimoDia.getDate() + (6 - ultimoDia.getDay()));

      const dias: DiaCalendario[] = [];
      const dataHoje = new Date();

      // Gerar todos os dias do calendário
      for (let d = new Date(primeiroDiaCalendario); d <= ultimoDiaCalendario; d.setDate(d.getDate() + 1)) {
        const dia = d.getDate();
        const mesAtual = d.getMonth() === mes;
        const isToday = d.toDateString() === dataHoje.toDateString();

        // Encontrar aniversariantes deste dia
        const aniversariantes = colaboradores.filter(c => {
          if (!c.data_nascimento) return false;

          try {
            // Tentar diferentes formatos de data
            let diaAniv = 0;
            let mesAniv = 0;

            // Formato dd/MM/yyyy
            if (c.data_nascimento.includes('/')) {
              const partes = c.data_nascimento.split('/');
              if (partes.length === 3) {
                diaAniv = parseInt(partes[0]);
                mesAniv = parseInt(partes[1]);
              } else {
                return false;
              }
            }
            // Formato ISO (yyyy-MM-dd)
            else if (c.data_nascimento.includes('-')) {
              const dataObj = new Date(c.data_nascimento);
              diaAniv = dataObj.getDate();
              mesAniv = dataObj.getMonth() + 1;
            }
            else {
              return false;
            }

            const match = diaAniv === dia && mesAniv === (mes + 1);
            if (match) {
              console.log('Aniversariante encontrado:', c.nome_completo, `${diaAniv}/${mesAniv}`);
            }
            return match;
          } catch (error) {
            console.error('Erro ao processar data de nascimento:', c.data_nascimento, error);
            return false;
          }
        });

        dias.push({
          dia,
          aniversariantes,
          isCurrentMonth: mesAtual,
          isToday,
          date: new Date(d),
        });
      }

      console.log('Calendário gerado com', dias.length, 'dias');
      setDiasCalendario(dias);
    } catch (error) {
      console.error('Erro ao gerar calendário:', error);
      toast.error('Erro ao gerar calendário');
      setDiasCalendario([]);
    }
  };

  const exportCalendar = () => {
    const aniversariantesDoMes = colaboradores.filter(c => {
      if (!c.data_nascimento) return false;

      try {
        const partes = c.data_nascimento.split('/');
        if (partes.length === 3) {
          const mesAniv = parseInt(partes[1]);
          return mesAniv === (dataAtual.getMonth() + 1);
        }
        return false;
      } catch {
        return false;
      }
    });

    if (aniversariantesDoMes.length === 0) {
      toast.info('Nenhum aniversariante encontrado neste mês');
      return;
    }

    // Gerar conteúdo ICS (iCalendar)
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Beuni//Calendar//PT',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Aniversários - Beuni',
      'X-WR-CALDESC:Calendário de aniversários dos colaboradores',
      ...aniversariantesDoMes.flatMap(colaborador => {
        try {
          const partes = colaborador.data_nascimento.split('/');
          const dia = partes[0].padStart(2, '0');
          const mes = partes[1].padStart(2, '0');
          const dataEvento = `${dataAtual.getFullYear()}${mes}${dia}`;

          return [
            'BEGIN:VEVENT',
            `UID:aniversario-${colaborador.id}-${dataAtual.getFullYear()}@beuni.com.br`,
            `DTSTART;VALUE=DATE:${dataEvento}`,
            `DTEND;VALUE=DATE:${dataEvento}`,
            `SUMMARY:🎂 Aniversário - ${colaborador.nome_completo}`,
            `DESCRIPTION:Aniversário de ${colaborador.nome_completo}\\nCargo: ${colaborador.cargo}\\nDepartamento: ${colaborador.departamento}`,
            'STATUS:CONFIRMED',
            'TRANSP:TRANSPARENT',
            'END:VEVENT'
          ];
        } catch {
          return [];
        }
      }),
      'END:VCALENDAR'
    ].join('\n');

    // Download do arquivo ICS
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `aniversarios-${dataAtual.getFullYear()}-${(dataAtual.getMonth() + 1).toString().padStart(2, '0')}.ics`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Calendário exportado com sucesso!');
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setDataAtual(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDENTE: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendente' },
      PRONTO_PARA_ENVIO: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Pronto' },
      ENVIADO: { bg: 'bg-green-100', text: 'text-green-800', label: 'Enviado' },
      ENTREGUE: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Entregue' },
      CANCELADO: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelado' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDENTE;

    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const nomesMeses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Render
  return (
    <Layout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-beuni-text flex items-center">
                <Calendar className="h-8 w-8 mr-3 text-beuni-orange-600" />
                Calendário de Aniversários
              </h1>
              <p className="text-beuni-text/60 mt-1">
                Visualize e gerencie os aniversários dos colaboradores
              </p>
            </div>
            <button
              onClick={exportCalendar}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar ICS
            </button>
          </div>
        </div>

        {/* Filtros e Navegação */}
        <div className="bg-white rounded-2xl shadow-sm border border-beuni-orange-100 p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Navegação do mês */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-beuni-orange-50 rounded-xl transition-all hover:scale-110"
              >
                <ChevronLeft className="h-5 w-5 text-beuni-orange-600" />
              </button>
              <h2 className="text-2xl font-bold text-beuni-text min-w-[200px] text-center">
                {nomesMeses[dataAtual.getMonth()]} {dataAtual.getFullYear()}
              </h2>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-beuni-orange-50 rounded-xl transition-all hover:scale-110"
              >
                <ChevronRight className="h-5 w-5 text-beuni-orange-600" />
              </button>
            </div>

            {/* Filtros */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-beuni-cream px-3 py-2 rounded-xl">
                <Filter className="h-4 w-4 text-beuni-orange-600" />
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-beuni-text font-medium cursor-pointer"
                >
                  <option value="TODOS">Todos os Status</option>
                  <option value="PENDENTE">Pendentes</option>
                  <option value="PRONTO_PARA_ENVIO">Prontos</option>
                  <option value="ENVIADO">Enviados</option>
                  <option value="ENTREGUE">Entregues</option>
                </select>
              </div>

              <select
                value={filtroDepartamento}
                onChange={(e) => setFiltroDepartamento(e.target.value)}
                className="px-4 py-2 border border-beuni-orange-200 bg-white rounded-xl focus:ring-2 focus:ring-beuni-orange-500 focus:border-beuni-orange-500 font-medium text-beuni-text"
              >
                <option value="TODOS">Todos os Departamentos</option>
                {departamentos.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Calendário */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-beuni-orange-600"></div>
          </div>
        ) : diasCalendario.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-beuni-orange-100 p-8 text-center">
            <Calendar className="h-16 w-16 text-beuni-orange-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-beuni-text mb-2">Calendário não disponível</h3>
            <p className="text-beuni-text/60 mb-4">
              Não foi possível carregar os dados do calendário.
            </p>
            <div className="bg-beuni-cream rounded-xl p-4 mb-6 max-w-md mx-auto">
              <p className="text-sm text-beuni-text/70 font-medium mb-2">Possíveis causas:</p>
              <ul className="text-sm text-beuni-text/60 space-y-1 text-left">
                <li>• Não há colaboradores cadastrados</li>
                <li>• Problemas de conexão com o servidor</li>
                <li>• Os filtros aplicados não retornaram resultados</li>
              </ul>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={loadColaboradores}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-beuni-orange-500 to-beuni-orange-600 text-white font-semibold rounded-xl hover:from-beuni-orange-600 hover:to-beuni-orange-700 transition-all shadow-md"
              >
                Recarregar
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-beuni-orange-100 overflow-hidden">
            {/* Cabeçalho dos dias da semana */}
            <div className="grid grid-cols-7 bg-gradient-to-r from-beuni-orange-50 to-beuni-cream border-b border-beuni-orange-200">
              {diasSemana.map(dia => (
                <div key={dia} className="p-4 text-center text-sm font-bold text-beuni-text uppercase tracking-wide">
                  {dia}
                </div>
              ))}
            </div>

            {/* Dias do calendário */}
            <div className="grid grid-cols-7">
              {diasCalendario.map((diaInfo, index) => (
                <div
                  key={index}
                  className={`min-h-[130px] p-3 border-r border-b border-beuni-orange-100 transition-all hover:bg-beuni-cream/30 ${
                    !diaInfo.isCurrentMonth ? 'bg-gray-50/50 text-gray-400' : 'bg-white'
                  } ${diaInfo.isToday ? 'bg-gradient-to-br from-beuni-orange-50 to-yellow-50 ring-2 ring-beuni-orange-300 shadow-sm' : ''}`}
                >
                  <div className={`text-sm font-bold mb-2 ${
                    diaInfo.isToday ? 'text-beuni-orange-600 text-lg' : 'text-beuni-text/70'
                  }`}>
                    {diaInfo.dia}
                  </div>

                  {diaInfo.aniversariantes.length > 0 && (
                    <div className="space-y-2">
                      {diaInfo.aniversariantes.slice(0, 2).map(colaborador => (
                        <div
                          key={colaborador.id}
                          className="bg-gradient-to-r from-beuni-orange-100 to-yellow-100 border-l-3 border-beuni-orange-500 p-2 rounded-lg text-xs shadow-sm hover:shadow-md transition-all"
                        >
                          <div className="flex items-center space-x-1 mb-1">
                            <Gift className="h-3 w-3 text-beuni-orange-600 flex-shrink-0" />
                            <span className="font-bold text-beuni-text truncate">
                              {colaborador.nome_completo}
                            </span>
                          </div>
                          <div className="text-beuni-text/70 truncate text-xs font-medium">
                            {colaborador.cargo}
                          </div>
                          <div className="mt-1.5">
                            {getStatusBadge(colaborador.status_envio_atual)}
                          </div>
                        </div>
                      ))}
                      {diaInfo.aniversariantes.length > 2 && (
                        <div className="text-xs text-beuni-text/60 text-center font-semibold bg-beuni-cream rounded-lg py-1">
                          +{diaInfo.aniversariantes.length - 2} mais
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de aniversariantes do mês */}
        {colaboradores.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-sm border border-beuni-orange-100 p-6">
            <h3 className="text-xl font-bold text-beuni-text mb-6 flex items-center">
              <Users className="h-6 w-6 mr-2 text-beuni-orange-600" />
              Aniversariantes de {nomesMeses[dataAtual.getMonth()]}
              <span className="ml-2 px-3 py-1 bg-beuni-orange-100 text-beuni-orange-700 rounded-full text-sm font-bold">
                {colaboradores.filter(c => {
                  try {
                    const partes = c.data_nascimento.split('/');
                    if (partes.length === 3) {
                      const mesAniv = parseInt(partes[1]);
                      return mesAniv === (dataAtual.getMonth() + 1);
                    }
                    return false;
                  } catch {
                    return false;
                  }
                }).length}
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {colaboradores.filter(c => {
                try {
                  const partes = c.data_nascimento.split('/');
                  if (partes.length === 3) {
                    const mesAniv = parseInt(partes[1]);
                    return mesAniv === (dataAtual.getMonth() + 1);
                  }
                  return false;
                } catch {
                  return false;
                }
              }).map(colaborador => (
                <div key={colaborador.id} className="bg-gradient-to-br from-white to-beuni-cream border border-beuni-orange-200 rounded-xl p-5 hover:shadow-lg transition-all hover:scale-105">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-bold text-beuni-text">{colaborador.nome_completo}</h4>
                    {getStatusBadge(colaborador.status_envio_atual)}
                  </div>
                  <p className="text-sm text-beuni-text/70 font-medium mb-2">
                    {colaborador.cargo} • {colaborador.departamento}
                  </p>
                  <p className="text-sm text-beuni-orange-600 font-bold mt-2 flex items-center">
                    <Gift className="h-4 w-4 mr-1" />
                    {colaborador.data_nascimento}
                  </p>
                  <p className="text-xs text-beuni-text/60 mt-2 font-medium">
                    📍 {colaborador.endereco.cidade}, {colaborador.endereco.uf}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}