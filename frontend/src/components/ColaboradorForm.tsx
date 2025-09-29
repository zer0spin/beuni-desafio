import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Save, User, MapPin, Building, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
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

          setFormData({
            nome_completo: colaborador.nomeCompleto || '',
            data_nascimento: colaborador.dataNascimento ? colaborador.dataNascimento.split('T')[0] : '',
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

        setFormData(prev => ({
          ...prev,
          endereco: {
            ...prev.endereco,
            cep: cep,
            logradouro: data.logradouro,
            bairro: data.bairro,
            cidade: data.cidade,
            uf: data.uf,
          },
        }));
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        toast.error('CEP não encontrado');
        setCepData(null);
        setFormData(prev => ({
          ...prev,
          endereco: {
            ...prev.endereco,
            cep: cep,
            logradouro: '',
            bairro: '',
            cidade: '',
            uf: '',
          },
        }));
      } finally {
        setCepLoading(false);
      }
    } else {
      setCepData(null);
      setFormData(prev => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          cep: cep,
          logradouro: '',
          bairro: '',
          cidade: '',
          uf: '',
        },
      }));
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      <div className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
                <p className="text-sm text-gray-600">{pageDescription}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {mode === 'edit' && (
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="inline-flex items-center px-4 py-2 text-red-700 hover:text-red-900 font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                  ) : (
                    <Trash2 className="h-5 w-5 mr-2" />
                  )}
                  {deleteLoading ? 'Excluindo...' : 'Excluir'}
                </button>
              )}
              <Link
                href="/colaboradores"
                className="inline-flex items-center px-4 py-2 text-gray-700 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <User className="h-5 w-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-gray-900">Dados Pessoais</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="nome_completo" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  id="nome_completo"
                  name="nome_completo"
                  required
                  value={formData.nome_completo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Digite o nome completo"
                />
              </div>

              <div>
                <label htmlFor="data_nascimento" className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Nascimento *
                </label>
                <input
                  type="date"
                  id="data_nascimento"
                  name="data_nascimento"
                  required
                  value={formData.data_nascimento}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Building className="h-5 w-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-gray-900">Dados Profissionais</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="cargo" className="block text-sm font-medium text-gray-700 mb-2">
                  Cargo *
                </label>
                <select
                  id="cargo"
                  name="cargo"
                  required
                  value={formData.cargo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                >
                  <option value="">Selecione um cargo</option>
                  {CARGOS.map(cargo => (
                    <option key={cargo} value={cargo}>{cargo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="departamento" className="block text-sm font-medium text-gray-700 mb-2">
                  Departamento *
                </label>
                <select
                  id="departamento"
                  name="departamento"
                  required
                  value={formData.departamento}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                >
                  <option value="">Selecione um departamento</option>
                  {DEPARTAMENTOS.map(departamento => (
                    <option key={departamento} value={departamento}>{departamento}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <MapPin className="h-5 w-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-gray-900">Endereço</h2>
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
                  Logradouro
                </label>
                <input
                  type="text"
                  id="endereco.logradouro"
                  name="endereco.logradouro"
                  value={formData.endereco.logradouro}
                  onChange={handleInputChange}
                  disabled={!!cepData}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Rua das Flores"
                />
              </div>

              <div>
                <label htmlFor="endereco.bairro" className="block text-sm font-medium text-gray-700 mb-2">
                  Bairro
                </label>
                <input
                  type="text"
                  id="endereco.bairro"
                  name="endereco.bairro"
                  value={formData.endereco.bairro}
                  onChange={handleInputChange}
                  disabled={!!cepData}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Centro"
                />
              </div>

              <div>
                <label htmlFor="endereco.cidade" className="block text-sm font-medium text-gray-700 mb-2">
                  Cidade
                </label>
                <input
                  type="text"
                  id="endereco.cidade"
                  name="endereco.cidade"
                  value={formData.endereco.cidade}
                  onChange={handleInputChange}
                  disabled={!!cepData}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="São Paulo"
                />
              </div>

              <div>
                <label htmlFor="endereco.uf" className="block text-sm font-medium text-gray-700 mb-2">
                  Estado (UF)
                </label>
                <input
                  type="text"
                  id="endereco.uf"
                  name="endereco.uf"
                  value={formData.endereco.uf}
                  onChange={handleInputChange}
                  disabled={!!cepData}
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

          <div className="flex justify-end space-x-4">
            <Link
              href="/colaboradores"
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <React.Fragment>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {submitLoadingText}
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <Save className="h-5 w-5 mr-2" />
                  {submitButtonText}
                </React.Fragment>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}