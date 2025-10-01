import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import Layout from '@/components/Layout';
import api, { endpoints } from '@/lib/api';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';

interface UserProfile {
  id: string;
  nome: string;
  email: string;
  organizationId: string;
  organizacao: {
    id: string;
    nome: string;
  };
}

export default function Configuracoes() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organizationName: '',
  });

  const { data: profile, refetch } = useQuery<UserProfile>(
    'userProfile',
    async () => {
      const response = await api.get(endpoints.profile);
      return response.data;
    },
    {
      retry: 1,
      refetchOnWindowFocus: true,
      staleTime: 0,
      cacheTime: 0,
    }
  );

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.nome,
        email: profile.email,
        organizationName: profile.organizacao.nome,
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      toast.error('Dados do usuário não carregados');
      return;
    }

    setIsSaving(true);
    try {
      // Atualizar dados do usuário
      const userResponse = await api.patch(endpoints.updateProfile, {
        name: formData.name,
      });

      // Atualizar nome da organização
      await api.patch(endpoints.updateOrganizacao(profile.organizationId), {
        name: formData.organizationName,
      });

      // Atualizar cookie do usuário com os novos dados
      const updatedUser = userResponse.data;
      const cookieOptions = {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/',
      };
      Cookies.set('beuni_user', JSON.stringify(updatedUser), cookieOptions);

      // Invalidar cache e refetch para atualizar os dados na tela
      await queryClient.invalidateQueries('userProfile');
      await refetch();

      toast.success('Dados atualizados com sucesso!');
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      // Erro já tratado pelo interceptor do axios
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-8">Configurações</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Dados Cadastrais</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Editar
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nome
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  E-mail
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="mt-1 block w-full rounded border-gray-300 shadow-sm bg-gray-100"
                />
                <p className="mt-1 text-sm text-gray-500">
                  O e-mail não pode ser alterado
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nome da Organização
                </label>
                <input
                  type="text"
                  value={formData.organizationName}
                  onChange={(e) =>
                    setFormData({ ...formData, organizationName: e.target.value })
                  }
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      if (profile) {
                        setFormData({
                          name: profile.nome,
                          email: profile.email,
                          organizationName: profile.organizacao.nome,
                        });
                      }
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`px-4 py-2 rounded text-white ${
                      isSaving
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600'
                    }`}
                  >
                    {isSaving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}