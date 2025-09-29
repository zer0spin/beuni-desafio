import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Calendar, Users, ChevronLeft, ChevronRight, Gift, Download, Filter, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
      const response = await api.get('/colaboradores?limit=1000'); // Aumentar limite

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
            let diaAniv: number, mesAniv: number;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Calendário de Aniversários</h1>
                  <p className="text-sm text-gray-600">Visualize os aniversários dos colaboradores por mês</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={exportCalendar}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar ICS
              </button>
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 text-gray-700 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Navegação */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Navegação do mês */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h2 className="text-xl font-semibold text-gray-900 min-w-[200px] text-center">
                {nomesMeses[dataAtual.getMonth()]} {dataAtual.getFullYear()}
              </h2>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Filtros */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-600" />
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        ) : diasCalendario.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Calendário não disponível</h3>
            <p className="text-gray-500 mb-4">
              Não foi possível carregar os dados do calendário. Isso pode acontecer se:
            </p>
            <ul className="text-sm text-gray-600 mb-6 space-y-1 text-left max-w-md mx-auto">
              <li>• Não há colaboradores cadastrados</li>
              <li>• Há problemas de conexão com o servidor</li>
              <li>• Os filtros aplicados não retornaram resultados</li>
            </ul>
            <div className="flex justify-center space-x-4">
              <Link
                href="/colaboradores"
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Users className="h-4 w-4 mr-2" />
                Ver Colaboradores
              </Link>
              <button
                onClick={loadColaboradores}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Recarregar
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden">
            {/* Cabeçalho dos dias da semana */}
            <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
              {diasSemana.map(dia => (
                <div key={dia} className="p-3 text-center text-sm font-medium text-gray-700">
                  {dia}
                </div>
              ))}
            </div>

            {/* Dias do calendário */}
            <div className="grid grid-cols-7">
              {diasCalendario.map((diaInfo, index) => (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border-r border-b border-gray-100 ${
                    !diaInfo.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                  } ${diaInfo.isToday ? 'bg-orange-50 ring-2 ring-orange-200' : ''}`}
                >
                  <div className={`text-sm font-medium mb-2 ${
                    diaInfo.isToday ? 'text-orange-600 font-bold' : 'text-gray-900'
                  }`}>
                    {diaInfo.dia}
                  </div>

                  {diaInfo.aniversariantes.length > 0 && (
                    <div className="space-y-1">
                      {diaInfo.aniversariantes.slice(0, 2).map(colaborador => (
                        <div
                          key={colaborador.id}
                          className="bg-orange-100 border-l-2 border-orange-500 p-1 rounded text-xs"
                        >
                          <div className="flex items-center space-x-1">
                            <Gift className="h-3 w-3 text-orange-600 flex-shrink-0" />
                            <span className="font-medium text-orange-900 truncate">
                              {colaborador.nome_completo}
                            </span>
                          </div>
                          <div className="text-orange-700 truncate text-xs">
                            {colaborador.cargo}
                          </div>
                          <div className="mt-1">
                            {getStatusBadge(colaborador.status_envio_atual)}
                          </div>
                        </div>
                      ))}
                      {diaInfo.aniversariantes.length > 2 && (
                        <div className="text-xs text-gray-500 text-center">
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
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-orange-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-orange-600" />
              Aniversariantes de {nomesMeses[dataAtual.getMonth()]} ({colaboradores.filter(c => {
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
              }).length})
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
                <div key={colaborador.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{colaborador.nome_completo}</h4>
                    {getStatusBadge(colaborador.status_envio_atual)}
                  </div>
                  <p className="text-sm text-gray-600">{colaborador.cargo} - {colaborador.departamento}</p>
                  <p className="text-sm text-orange-600 font-medium mt-1">
                    🎂 {colaborador.data_nascimento}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {colaborador.endereco.cidade}, {colaborador.endereco.uf}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}