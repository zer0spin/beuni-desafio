import { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { toast } from 'react-hot-toast';

import api, { setAuthToken, endpoints } from '@/lib/api';
import type { LoginCredentials, AuthResponse } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>();

  const onSubmit = async (data: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await api.post<AuthResponse>(endpoints.login, data);
      const { access_token, user } = response.data;

      setAuthToken(access_token, user);
      toast.success(`Bem-vindo, ${user.nome}!`);
      router.push('/dashboard');
    } catch (error) {
      // Error is handled by axios interceptor
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-beuni-cream py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Logo da Beuni */}
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-r from-beuni-orange-500 to-beuni-orange-600 shadow-lg mb-6">
            <Gift className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-beuni-text mb-2">
            Entre na Plataforma
          </h2>
          <p className="text-beuni-text/70">
            Acesse sua conta na Beuni e gerencie aniversários corporativos
          </p>
        </div>

        <form className="mt-8 space-y-6 bg-white rounded-2xl p-8 shadow-lg border border-beuni-orange-100" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-beuni-text mb-2">
                E-mail corporativo
              </label>
              <input
                {...register('email', {
                  required: 'E-mail é obrigatório',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'E-mail inválido',
                  },
                })}
                type="email"
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-beuni-orange-500 focus:border-beuni-orange-500 transition-colors"
                placeholder="seu.email@empresa.com"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-beuni-text mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Senha é obrigatória',
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="block w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-beuni-orange-500 focus:border-beuni-orange-500 transition-colors"
                  placeholder="Digite sua senha"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-beuni-orange-500 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-beuni-brown-800 text-white font-semibold rounded-xl hover:bg-beuni-brown-900 focus:outline-none focus:ring-2 focus:ring-beuni-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Entrando...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <LogIn className="mr-2 h-5 w-5" />
                  Acessar Plataforma
                </div>
              )}
            </button>
          </div>

          <div className="text-center pt-4">
            <p className="text-sm text-beuni-text/70">
              Não tem uma conta?{' '}
              <button
                type="button"
                onClick={() => router.push('/register')}
                className="font-semibold text-beuni-orange-600 hover:text-beuni-orange-500 transition-colors"
              >
                Cadastre-se aqui
              </button>
            </p>
          </div>
        </form>

        {/* Card de demonstração melhorado */}
        <div className="bg-gradient-to-br from-beuni-orange-50 to-beuni-brown-50 rounded-2xl p-6 border border-beuni-orange-200">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-beuni-orange-500 rounded-xl flex items-center justify-center mr-3">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-beuni-text">
                Conta de Demonstração
              </h3>
              <p className="text-xs text-beuni-text/70">
                Teste a plataforma gratuitamente
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-beuni-text/60 font-medium">E-mail:</span>
                <p className="text-beuni-text font-mono">ana.rh@beunidemo.com</p>
              </div>
              <div>
                <span className="text-beuni-text/60 font-medium">Senha:</span>
                <p className="text-beuni-text font-mono">123456</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}