import { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';

import api, { setAuthToken, endpoints } from '@/lib/api';
import type { RegisterCredentials, AuthResponse } from '@/types';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterCredentials>();

  const password = watch('password');

  const onSubmit = async (data: RegisterCredentials) => {
    setIsLoading(true);
    try {
      const response = await api.post<AuthResponse>(endpoints.register, data);
      const { access_token, user } = response.data;

      setAuthToken(access_token, user);
      toast.success(`Bem-vindo, ${user.nome}! Conta criada com sucesso.`);
      router.push('/dashboard');
    } catch (error) {
      // Error is handled by axios interceptor
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <UserPlus className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crie sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Cadastre sua organização na Plataforma Beuni
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="nome" className="form-label">
                Nome completo
              </label>
              <input
                {...register('nome', {
                  required: 'Nome é obrigatório',
                  minLength: {
                    value: 2,
                    message: 'Nome deve ter pelo menos 2 caracteres',
                  },
                })}
                type="text"
                className="form-input"
                placeholder="Seu nome completo"
              />
              {errors.nome && (
                <p className="form-error">{errors.nome.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="form-label">
                E-mail
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
                className="form-input"
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p className="form-error">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="organizacao" className="form-label">
                Nome da organização
              </label>
              <input
                {...register('organizacao', {
                  required: 'Nome da organização é obrigatório',
                  minLength: {
                    value: 2,
                    message: 'Nome da organização deve ter pelo menos 2 caracteres',
                  },
                })}
                type="text"
                className="form-input"
                placeholder="Nome da sua empresa"
              />
              {errors.organizacao && (
                <p className="form-error">{errors.organizacao.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Senha
              </label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Senha é obrigatória',
                    minLength: {
                      value: 6,
                      message: 'Senha deve ter pelo menos 6 caracteres',
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="form-input pr-10"
                  placeholder="Sua senha"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="form-error">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="form-label">
                Confirmar senha
              </label>
              <input
                {...register('confirmPassword', {
                  required: 'Confirmação de senha é obrigatória',
                  validate: (value) =>
                    value === password || 'Senhas não conferem',
                })}
                type="password"
                className="form-input"
                placeholder="Confirme sua senha"
              />
              {errors.confirmPassword && (
                <p className="form-error">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary"
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner mr-2" />
                  Criando conta...
                </>
              ) : (
                'Criar conta'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Entre aqui
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}