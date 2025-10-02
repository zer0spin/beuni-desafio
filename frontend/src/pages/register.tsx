import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

import api, { setAuthToken, endpoints } from '@/lib/api';
import type { RegisterCredentials, AuthResponse } from '@/types';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      // SECURITY: Backend now sets httpOnly cookie automatically
      const response = await api.post<{ user: any }>(endpoints.register, {
        name: data.nome,
        email: data.email,
        password: data.password,
      });
      const { user } = response.data;

      // SECURITY: Only store user data (token is httpOnly from backend)
      setAuthToken(user);
      toast.success(`Bem-vindo, ${user.nome}! Conta criada com sucesso.`);
      router.push('/dashboard');
    } catch (error) {
      // Error is handled by axios interceptor
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-beuni-cream">
      {/* Left Side - Product Grid */}
      <div className="hidden lg:flex lg:w-1/2 p-12 items-center justify-center">
        <div className="max-w-2xl w-full">
          {/* Logo */}
          <div className="mb-12">
            <Image
              src="/images/logos/logo-beuni.png"
              alt="Beuni Logo"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </div>

          {/* Grid de Produtos 2x2 */}
          <div className="grid grid-cols-2 gap-6">
            {/* Garrafa */}
            <div className="bg-gradient-to-br from-[#FFD4BA] to-[#FFB89A] rounded-3xl p-8 flex items-center justify-center aspect-square shadow-lg">
              <Image
                src="/images/products/garrafa-laranja.png"
                alt="Garrafa personalizada"
                width={200}
                height={200}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Camiseta */}
            <div className="bg-gradient-to-br from-[#FFD4BA] to-[#FFB89A] rounded-3xl p-8 flex items-center justify-center aspect-square shadow-lg">
              <Image
                src="/images/products/camiseta-laranja.png"
                alt="Camiseta personalizada"
                width={200}
                height={200}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Mochila */}
            <div className="bg-gradient-to-br from-[#FFD4BA] to-[#FFB89A] rounded-3xl p-8 flex items-center justify-center aspect-square shadow-lg">
              <Image
                src="/images/products/mochila-marrom.png"
                alt="Mochila personalizada"
                width={200}
                height={200}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Ecobag */}
            <div className="bg-gradient-to-br from-[#FFD4BA] to-[#FFB89A] rounded-3xl p-8 flex items-center justify-center aspect-square shadow-lg">
              <Image
                src="/images/products/ecobag-laranja.png"
                alt="Ecobag personalizada"
                width={200}
                height={200}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          {/* Logo Mobile */}
          <div className="lg:hidden mb-8">
            <Image
              src="/images/logos/logo-beuni.png"
              alt="Beuni Logo"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-beuni-text mb-2">
                Crie sua conta 🎯
              </h1>
              <p className="text-beuni-text/60">
                Comece sua jornada com a BeUni
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Nome Field */}
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-beuni-text mb-2">
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
                  placeholder="Seu nome"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-beuni-orange-500 focus:border-beuni-orange-500 transition-colors"
                />
                {errors.nome && (
                  <p className="mt-2 text-sm text-red-600">{errors.nome.message}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-beuni-text mb-2">
                  E-mail profissional
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
                  placeholder="seuemail@empresa.com"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-beuni-orange-500 focus:border-beuni-orange-500 transition-colors"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-beuni-text mb-2">
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
                    placeholder="••••••"
                    className="block w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-beuni-orange-500 focus:border-beuni-orange-500 transition-colors"
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

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-beuni-text mb-2">
                  Confirmar senha
                </label>
                <div className="relative">
                  <input
                    {...register('confirmPassword', {
                      required: 'Confirmação de senha é obrigatória',
                      validate: (value) =>
                        value === password || 'Senhas não conferem',
                    })}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••"
                    className="block w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-beuni-orange-500 focus:border-beuni-orange-500 transition-colors"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-beuni-orange-500 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 bg-beuni-orange-600 text-white font-semibold rounded-xl hover:bg-beuni-orange-700 focus:outline-none focus:ring-2 focus:ring-beuni-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Criando conta...
                  </div>
                ) : (
                  'Criar conta'
                )}
              </button>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-sm text-beuni-text/70">
                  Já tem uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => router.push('/login')}
                    className="font-semibold text-beuni-orange-600 hover:text-beuni-orange-700 transition-colors"
                  >
                    Faça login
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}