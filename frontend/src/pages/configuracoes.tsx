import { useEffect, useState, useRef } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import Layout from '@/components/Layout';
import api, { endpoints } from '@/lib/api';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';
import { Camera, Upload, X, User } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

interface UserProfile {
  id: string;
  nome: string;
  email: string;
  imagemPerfil?: string;
  organizationId: string;
  organizacao: {
    id: string;
    nome: string;
  };
}

export default function Configuracoes() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateUser, refreshUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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

      // Atualizar contexto do usuário
      updateUser({
        nome: formData.name,
        organizacao: {
          ...userResponse.data.organizacao,
          nome: formData.organizationName,
        },
      });

      // Invalidar cache e refetch para atualizar os dados na tela
      await queryClient.invalidateQueries('userProfile');
      await refetch();

      toast.success('Dados atualizados com sucesso!');
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      toast.error('Erro ao atualizar dados');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('Imagem muito grande. Tamanho máximo: 5MB');
      return;
    }

    // Mostrar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload da imagem
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post(endpoints.uploadProfileImage, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Atualizar contexto do usuário
      updateUser({
        imagemPerfil: response.data.user.imagemPerfil,
      });

      // Invalidar cache
      await queryClient.invalidateQueries('userProfile');
      await refetch();

      toast.success('Foto de perfil atualizada com sucesso!');
      setImagePreview(null);
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      setImagePreview(null);
      toast.error('Erro ao fazer upload da imagem');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = async () => {
    if (!profile?.imagemPerfil) return;

    setIsUploadingImage(true);
    try {
      // Atualizar perfil removendo a imagem
      const response = await api.patch(endpoints.updateProfile, {
        imagemPerfil: null,
      });

      // Atualizar contexto do usuário
      updateUser({
        imagemPerfil: undefined,
      });

      // Invalidar cache e recarregar
      await queryClient.invalidateQueries('userProfile');
      await refetch();

      toast.success('Foto de perfil removida com sucesso!');
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      toast.error('Erro ao remover foto de perfil');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeImagePreview = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-8">Configurações</h1>

        {/* Foto de Perfil */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-6">Foto de Perfil</h2>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-beuni-orange-500 to-beuni-orange-600 rounded-full flex items-center justify-center text-white font-bold text-2xl overflow-hidden">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                ) : profile?.imagemPerfil ? (
                  <img 
                    src={`${process.env.NEXT_PUBLIC_API_URL}/auth/profile-image/${profile.imagemPerfil}`}
                    alt="Perfil" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  profile?.nome?.charAt(0) || <User className="h-8 w-8" />
                )}
              </div>
              {isUploadingImage && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-4">
                Escolha uma foto de perfil. Formatos aceitos: JPEG, PNG, WebP. Tamanho máximo: 5MB.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={triggerImageUpload}
                  disabled={isUploadingImage}
                  className="flex items-center px-4 py-2 bg-beuni-orange-500 hover:bg-beuni-orange-600 text-white rounded-lg transition-colors disabled:bg-gray-400"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {isUploadingImage ? 'Enviando...' : profile?.imagemPerfil ? 'Alterar Foto' : 'Adicionar Foto'}
                </button>
                
                {profile?.imagemPerfil && !imagePreview && (
                  <button
                    onClick={handleRemoveImage}
                    disabled={isUploadingImage}
                    className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:bg-gray-400"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remover
                  </button>
                )}
                
                {imagePreview && (
                  <button
                    onClick={removeImagePreview}
                    className="flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </button>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

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