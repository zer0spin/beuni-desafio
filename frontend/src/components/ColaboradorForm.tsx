import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Save, User, MapPin, Building, Trash2, Briefcase, Users as UsersIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Layout from './Layout';
import api from '../lib/api';

const CARGOS = [
  'Desenvolvedor Frontend',
  'Desenvolvedor Backend',
  'Desenvolvedor Fullstack',
  'Desenvolvedor Mobile',
  'DevOps Engineer',
  'QA/Tester',
  'Designer UX/UI',
  'Product Manager',
  'Scrum Master',
  'Tech Lead',
  'Arquiteto de Software',
  'Data Scientist',
  'Data Analyst',
  'Business Analyst',
  'Analista de Sistemas',
  'Administrador de Redes',
  'Suporte Técnico',
  'Coordenador de TI',
  'Gerente de TI',
  'Diretor de Tecnologia',
  'Analista de RH',
  'Coordenador de RH',
  'Gerente de RH',
  'Assistente Administrativo',
  'Analista Administrativo',
  'Auxiliar de Limpeza',
  'Recepcionista',
  'Porteiro',
  'Motorista',
  'Estagiário'
];

const DEPARTAMENTOS = [
  'Tecnologia',
  'Desenvolvimento',
  'Infraestrutura',
  'Qualidade',
  'Design',
  'Produto',
  'Recursos Humanos',
  'Financeiro',
  'Administrativo',
  'Vendas',
  'Marketing',
  'Comercial',
  'Suporte',
  'Operações',
  'Jurídico',
  'Compliance',
  'Segurança',
  'Facilities',
  'Diretoria'
];

interface FormData {
  nome_completo: string;
  data_nascimento: string;
  cargo: string;
  departamento: string;
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
  };
}

interface CepData {
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
}

interface ColaboradorFormProps {
  mode: 'create' | 'edit';
  colaboradorId?: string;
}

export default function ColaboradorForm({ mode, colaboradorId }: ColaboradorFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepData, setCepData] = useState<CepData | null>(null);
  const [fieldStates, setFieldStates] = useState({
    logradouro: { disabled: false, fromCep: false },
    bairro: { disabled: false, fromCep: false },
    cidade: { disabled: false, fromCep: false },
    uf: { disabled: false, fromCep: false },
  });
  const [formData, setFormData] = useState<FormData>({
    nome_completo: '',
    data_nascimento: '',
    cargo: '',
    departamento: '',
    endereco: {
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: '',
    },
  });

  useEffect(() => {
    if (mode === 'edit' && colaboradorId) {
      const loadColaborador = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/colaboradores/${colaboradorId}`);
          const colaborador = response.data;

          // Função auxiliar para converter data BR para formato input date
          const formatDateForInput = (dateStr?: string) => {
            if (!dateStr) return '';
            // Se já estiver no formato ISO (YYYY-MM-DD)
            if (dateStr.includes('-') && !dateStr.includes('/')) {
              return dateStr.split('T')[0];
            }
            // Se estiver no formato BR (DD/MM/YYYY)
            if (dateStr.includes('/')) {
              const [day, month, year] = dateStr.split('/');
              return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
            return '';
          };

          setFormData({
            nome_completo: colaborador.nome_completo || colaborador.nomeCompleto || '',
            data_nascimento: formatDateForInput(colaborador.data_nascimento || colaborador.dataNascimento),
            cargo: colaborador.cargo || '',
            departamento: colaborador.departamento || '',
            endereco: {
              cep: colaborador.endereco?.cep || '',
              logradouro: colaborador.endereco?.logradouro || '',
              numero: colaborador.endereco?.numero || '',
              complemento: colaborador.endereco?.complemento || '',
              bairro: colaborador.endereco?.bairro || '',
              cidade: colaborador.endereco?.cidade || '',
              uf: colaborador.endereco?.uf || '',
            },
          });
        } catch (error) {
          console.error('Erro ao carregar colaborador:', error);
          toast.error('Erro ao carregar dados do colaborador');
        } finally {
          setLoading(false);
        }
      };

      loadColaborador();
    }
  }, [mode, colaboradorId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.startsWith('endereco.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          [field]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');

    setFormData(prev => ({
      ...prev,
      endereco: {
        ...prev.endereco,
        cep: cep,
      },
    }));

    if (cep.length === 8) {
      setCepLoading(true);
      try {
        const response = await api.get(`/cep/${cep}`);
        const data = response.data;
        setCepData(data);

        // Determinar quais campos vieram preenchidos do CEP
        const hasLogradouro = data.logradouro && data.logradouro.trim() !== '';
        const hasBairro = data.bairro && data.bairro.trim() !== '';
        const hasCidade = data.cidade && data.cidade.trim() !== '';
        const hasUf = data.uf && data.uf.trim() !== '';

        // Atualizar estados dos campos
        setFieldStates({
          logradouro: { disabled: hasLogradouro, fromCep: hasLogradouro },
          bairro: { disabled: hasBairro, fromCep: hasBairro },
          cidade: { disabled: hasCidade, fromCep: hasCidade },
          uf: { disabled: hasUf, fromCep: hasUf },
        });

        // Preencher apenas os campos que vieram do CEP
        setFormData(prev => ({
          ...prev,
          endereco: {
            ...prev.endereco,
            cep: cep,
            logradouro: hasLogradouro ? data.logradouro : prev.endereco.logradouro,
            bairro: hasBairro ? data.bairro : prev.endereco.bairro,
            cidade: hasCidade ? data.cidade : prev.endereco.cidade,
            uf: hasUf ? data.uf : prev.endereco.uf,
          },
        }));

        // Mensagem informativa para o usuário
        const emptyFields = [];
        if (!hasLogradouro) emptyFields.push('logradouro');
        if (!hasBairro) emptyFields.push('bairro');
        if (!hasCidade) emptyFields.push('cidade');
        if (!hasUf) emptyFields.push('estado');

        if (emptyFields.length > 0) {
          toast.success(`CEP encontrado! Preencha manualmente: ${emptyFields.join(', ')}`);
        } else {
          toast.success('CEP encontrado! Endereço preenchido automaticamente');
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        toast.error('CEP não encontrado. Preencha o endereço manualmente');
        setCepData(null);

        // Liberar todos os campos para edição manual
        setFieldStates({
          logradouro: { disabled: false, fromCep: false },
          bairro: { disabled: false, fromCep: false },
          cidade: { disabled: false, fromCep: false },
          uf: { disabled: false, fromCep: false },
        });
      } finally {
        setCepLoading(false);
      }
    } else {
      setCepData(null);

      // Resetar estados dos campos quando CEP incompleto
      setFieldStates({
        logradouro: { disabled: false, fromCep: false },
        bairro: { disabled: false, fromCep: false },
        cidade: { disabled: false, fromCep: false },
        uf: { disabled: false, fromCep: false },
      });
    }
  };

  const formatCep = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cepData && (!formData.endereco.logradouro || !formData.endereco.bairro || !formData.endereco.cidade || !formData.endereco.uf)) {
      toast.error('Por favor, preencha todos os campos de endereço ou insira um CEP válido');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        nome_completo: formData.nome_completo,
        data_nascimento: formData.data_nascimento,
        cargo: formData.cargo,
        departamento: formData.departamento,
        endereco: {
          cep: formData.endereco.cep,
          numero: formData.endereco.numero,
          complemento: formData.endereco.complemento,
        },
      };

      if (mode === 'create') {
        await api.post('/colaboradores', submitData);
        toast.success('Colaborador cadastrado com sucesso!');
      } else {
        await api.put(`/colaboradores/${colaboradorId}`, submitData);
        toast.success('Colaborador atualizado com sucesso!');
      }

      router.push('/colaboradores');
    } catch (error: any) {
      console.error('Erro ao processar colaborador:', error);
      const message = mode === 'create' ? 'Erro ao cadastrar colaborador' : 'Erro ao atualizar colaborador';
      toast.error(error.response?.data?.message || message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!colaboradorId) return;

    const confirmed = confirm('Tem certeza que deseja excluir este colaborador? Esta ação não pode ser desfeita.');
    if (!confirmed) return;

    setDeleteLoading(true);
    try {
      await api.delete(`/colaboradores/${colaboradorId}`);
      toast.success('Colaborador excluído com sucesso!');
      router.push('/colaboradores');
    } catch (error: any) {
      console.error('Erro ao excluir colaborador:', error);
      toast.error(error.response?.data?.message || 'Erro ao excluir colaborador');
    } finally {
      setDeleteLoading(false);
    }
  };

  const pageTitle = mode === 'create' ? 'Novo Colaborador' : 'Editar Colaborador';
  const pageDescription = mode === 'create' ? 'Cadastre um novo colaborador na organização' : 'Edite os dados do colaborador';
  const submitButtonText = mode === 'create' ? 'Cadastrar Colaborador' : 'Atualizar Colaborador';
  const submitLoadingText = mode === 'create' ? 'Cadastrando...' : 'Atualizando...';

  if (loading && mode === 'edit') {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-beuni-orange-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-beuni-text flex items-center">
                <User className="h-8 w-8 mr-3 text-beuni-orange-600" />
                {pageTitle}
              </h1>
              <p className="text-beuni-text/60 mt-1">{pageDescription}</p>
            </div>
            {mode === 'edit' && (
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-5 w-5 mr-2" />
                    Excluir Colaborador
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Pessoais */}
          <div className="bg-white rounded-2xl shadow-sm border border-beuni-orange-100 p-6">
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-beuni-orange-100">
              <div className="w-10 h-10 bg-gradient-to-br from-beuni-orange-500 to-beuni-orange-600 rounded-xl flex items-center justify-center shadow-md">
                <User className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-beuni-text">Dados Pessoais</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="nome_completo" className="block text-sm font-bold text-beuni-text mb-2 uppercase tracking-wide">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  id="nome_completo"
                  name="nome_completo"
                  required
                  value={formData.nome_completo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-beuni-orange-200 rounded-xl focus:ring-2 focus:ring-beuni-orange-500 focus:border-beuni-orange-500 font-medium transition-all"
                  placeholder="Digite o nome completo"
                />
              </div>

              <div>
                <label htmlFor="data_nascimento" className="block text-sm font-bold text-beuni-text mb-2 uppercase tracking-wide">
                  Data de Nascimento *
                </label>
                <input
                  type="date"
                  id="data_nascimento"
                  name="data_nascimento"
                  required
                  value={formData.data_nascimento}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-beuni-orange-200 rounded-xl focus:ring-2 focus:ring-beuni-orange-500 focus:border-beuni-orange-500 font-medium transition-all"
                />
              </div>
            </div>
          </div>

          {/* Dados Profissionais */}
          <div className="bg-white rounded-2xl shadow-sm border border-beuni-orange-100 p-6">
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-beuni-orange-100">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-beuni-text">Dados Profissionais</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="cargo" className="block text-sm font-bold text-beuni-text mb-2 uppercase tracking-wide flex items-center">
                  <Briefcase className="h-4 w-4 mr-1 text-beuni-orange-600" />
                  Cargo *
                </label>
                <select
                  id="cargo"
                  name="cargo"
                  required
                  value={formData.cargo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-beuni-orange-200 rounded-xl focus:ring-2 focus:ring-beuni-orange-500 focus:border-beuni-orange-500 font-semibold bg-white transition-all cursor-pointer hover:border-beuni-orange-400"
                >
                  <option value="" className="text-beuni-text/60">Selecione um cargo...</option>
                  {CARGOS.map(cargo => (
                    <option key={cargo} value={cargo} className="font-medium">{cargo}</option>
                  ))}
                </select>
                <p className="text-xs text-beuni-text/50 mt-1 font-medium">{CARGOS.length} cargos disponíveis</p>
              </div>

              <div>
                <label htmlFor="departamento" className="block text-sm font-bold text-beuni-text mb-2 uppercase tracking-wide flex items-center">
                  <UsersIcon className="h-4 w-4 mr-1 text-beuni-orange-600" />
                  Departamento *
                </label>
                <select
                  id="departamento"
                  name="departamento"
                  required
                  value={formData.departamento}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-beuni-orange-200 rounded-xl focus:ring-2 focus:ring-beuni-orange-500 focus:border-beuni-orange-500 font-semibold bg-white transition-all cursor-pointer hover:border-beuni-orange-400"
                >
                  <option value="" className="text-beuni-text/60">Selecione um departamento...</option>
                  {DEPARTAMENTOS.map(departamento => (
                    <option key={departamento} value={departamento} className="font-medium">{departamento}</option>
                  ))}
                </select>
                <p className="text-xs text-beuni-text/50 mt-1 font-medium">{DEPARTAMENTOS.length} departamentos disponíveis</p>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="bg-white rounded-2xl shadow-sm border border-beuni-orange-100 p-6">
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-beuni-orange-100">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-beuni-text">Endereço de Entrega</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="endereco.cep" className="block text-sm font-medium text-gray-700 mb-2">
                  CEP *
                </label>
                <input
                  type="text"
                  id="endereco.cep"
                  name="endereco.cep"
                  required
                  value={formatCep(formData.endereco.cep)}
                  onChange={handleCepChange}
                  maxLength={9}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="00000-000"
                />
                {cepLoading && (
                  <p className="text-sm text-gray-500 mt-1">Buscando CEP...</p>
                )}
              </div>

              <div>
                <label htmlFor="endereco.numero" className="block text-sm font-medium text-gray-700 mb-2">
                  Número *
                </label>
                <input
                  type="text"
                  id="endereco.numero"
                  name="endereco.numero"
                  required
                  value={formData.endereco.numero}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="123"
                />
              </div>

              <div>
                <label htmlFor="endereco.complemento" className="block text-sm font-medium text-gray-700 mb-2">
                  Complemento
                </label>
                <input
                  type="text"
                  id="endereco.complemento"
                  name="endereco.complemento"
                  value={formData.endereco.complemento}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Apto 101, Bloco A"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
              <div>
                <label htmlFor="endereco.logradouro" className="block text-sm font-medium text-gray-700 mb-2">
                  Logradouro {!fieldStates.logradouro.fromCep && '*'}
                  {fieldStates.logradouro.fromCep && (
                    <span className="ml-2 text-xs text-green-600 font-semibold">✓ Preenchido pelo CEP</span>
                  )}
                </label>
                <input
                  type="text"
                  id="endereco.logradouro"
                  name="endereco.logradouro"
                  required={!fieldStates.logradouro.fromCep}
                  value={formData.endereco.logradouro}
                  onChange={handleInputChange}
                  disabled={fieldStates.logradouro.disabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Rua das Flores"
                />
              </div>

              <div>
                <label htmlFor="endereco.bairro" className="block text-sm font-medium text-gray-700 mb-2">
                  Bairro {!fieldStates.bairro.fromCep && '*'}
                  {fieldStates.bairro.fromCep && (
                    <span className="ml-2 text-xs text-green-600 font-semibold">✓ Preenchido pelo CEP</span>
                  )}
                </label>
                <input
                  type="text"
                  id="endereco.bairro"
                  name="endereco.bairro"
                  required={!fieldStates.bairro.fromCep}
                  value={formData.endereco.bairro}
                  onChange={handleInputChange}
                  disabled={fieldStates.bairro.disabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Centro"
                />
              </div>

              <div>
                <label htmlFor="endereco.cidade" className="block text-sm font-medium text-gray-700 mb-2">
                  Cidade {!fieldStates.cidade.fromCep && '*'}
                  {fieldStates.cidade.fromCep && (
                    <span className="ml-2 text-xs text-green-600 font-semibold">✓ Preenchido pelo CEP</span>
                  )}
                </label>
                <input
                  type="text"
                  id="endereco.cidade"
                  name="endereco.cidade"
                  required={!fieldStates.cidade.fromCep}
                  value={formData.endereco.cidade}
                  onChange={handleInputChange}
                  disabled={fieldStates.cidade.disabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="São Paulo"
                />
              </div>

              <div>
                <label htmlFor="endereco.uf" className="block text-sm font-medium text-gray-700 mb-2">
                  Estado (UF) {!fieldStates.uf.fromCep && '*'}
                  {fieldStates.uf.fromCep && (
                    <span className="ml-2 text-xs text-green-600 font-semibold">✓ Preenchido pelo CEP</span>
                  )}
                </label>
                <input
                  type="text"
                  id="endereco.uf"
                  name="endereco.uf"
                  required={!fieldStates.uf.fromCep}
                  value={formData.endereco.uf}
                  onChange={handleInputChange}
                  disabled={fieldStates.uf.disabled}
                  maxLength={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed uppercase"
                  placeholder="SP"
                />
              </div>
            </div>

            {cepData && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-sm font-medium text-green-800 mb-2">Endereço encontrado:</h3>
                <p className="text-sm text-green-700">
                  {cepData.logradouro}, {cepData.bairro} - {cepData.cidade}/{cepData.uf}
                </p>
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => router.push('/colaboradores')}
              className="px-6 py-3 text-beuni-text/70 border-2 border-beuni-orange-200 rounded-xl hover:bg-beuni-cream font-bold transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-beuni-orange-500 to-beuni-orange-600 text-white font-bold rounded-xl hover:from-beuni-orange-600 hover:to-beuni-orange-700 focus:outline-none focus:ring-2 focus:ring-beuni-orange-500 focus:ring-offset-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {submitLoadingText}
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  {submitButtonText}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}