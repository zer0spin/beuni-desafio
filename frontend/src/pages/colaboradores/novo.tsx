import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Save, User, MapPin, Building } from 'lucide-react';
import { toast } from 'react-hot-toast';

import api from '../../lib/api';

interface FormData {
  nome_completo: string;
  data_nascimento: string;
  cargo: string;
  departamento: string;
  endereco: {
    cep: string;
    numero: string;
    complemento: string;
  };
}

interface CepData {
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export default function NovoColaboradorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepData, setCepData] = useState<CepData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nome_completo: '',
    data_nascimento: '',
    cargo: '',
    departamento: '',
    endereco: {
      cep: '',
      numero: '',
      complemento: '',
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setCepData(response.data);
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        toast.error('CEP não encontrado');
        setCepData(null);
      } finally {
        setCepLoading(false);
      }
    } else {
      setCepData(null);
    }
  };

  const formatCep = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cepData) {
      toast.error('Por favor, insira um CEP válido');
      return;
    }

    setLoading(true);
    try {
      await api.post('/colaboradores', formData);
      toast.success('Colaborador cadastrado com sucesso!');
      router.push('/colaboradores');
    } catch (error: any) {
      console.error('Erro ao cadastrar colaborador:', error);
      toast.error(error.response?.data?.message || 'Erro ao cadastrar colaborador');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Novo Colaborador</h1>
                <p className="text-sm text-gray-600">Cadastre um novo colaborador na organização</p>
              </div>
            </div>
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

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Dados Pessoais */}
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

          {/* Dados Profissionais */}
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
                <input
                  type="text"
                  id="cargo"
                  name="cargo"
                  required
                  value={formData.cargo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Ex: Desenvolvedor, Analista, Gerente"
                />
              </div>

              <div>
                <label htmlFor="departamento" className="block text-sm font-medium text-gray-700 mb-2">
                  Departamento *
                </label>
                <input
                  type="text"
                  id="departamento"
                  name="departamento"
                  required
                  value={formData.departamento}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Ex: TI, RH, Financeiro"
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
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

            {cepData && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-sm font-medium text-green-800 mb-2">Endereço encontrado:</h3>
                <p className="text-sm text-green-700">
                  {cepData.logradouro}, {cepData.bairro} - {cepData.cidade}/{cepData.uf}
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link
              href="/colaboradores"
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading || !cepData}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Cadastrar Colaborador
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}