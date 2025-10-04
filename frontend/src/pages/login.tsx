import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

import api, { setAuthToken, endpoints } from '@/lib/api';
import type { LoginCredentials, AuthResponse } from '@/types';
import { useUser } from '@/contexts/UserContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, refreshUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user && !isLoading) {
      console.log('Login: Usuário já logado, redirecionando');
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  // Após login bem-sucedido, aguardar UserContext atualizar
  useEffect(() => {
    if (loginSuccess && user) {
      console.log('Login: UserContext atualizado após login, redirecionando');
      router.replace('/dashboard');
      setLoginSuccess(false);
    }
  }, [loginSuccess, user, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>();

  const onSubmit = async (data: LoginCredentials) => {
    setIsLoading(true);
    try {
      console.log('Login: Enviando dados', data);
      // SECURITY: Backend now sets httpOnly cookie automatically
      const response = await api.post<{ user: any }>(endpoints.login, data);
      const { user } = response.data;

      console.log('Login: Resposta recebida', { user });
      // SECURITY: Only store user data (token is httpOnly from backend)
      setAuthToken(user);
      console.log('Login: Cookie de usuário definido, atualizando UserContext...');

      // Atualizar UserContext
      refreshUser();

      toast.success(`Bem-vindo, ${user.nome}!`);

      // Marcar login como bem-sucedido para triggerar o useEffect
      setLoginSuccess(true);

      console.log('Login: Processo concluído');
    } catch (error) {
      console.error('Login: Erro no login', error);
      // Error is handled by axios interceptor
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-beuni-cream">
      {/* Demo credentials */}
      <div className="absolute top-2 right-2 bg-white/80 backdrop-blur px-4 py-2 rounded shadow text-xs text-gray-700 border border-orange-200">
        <p className="font-semibold text-orange-700">Acesso Demo</p>
        <p>Email: <code className="font-mono">admin@beuni.com</code></p>
        <p>Senha: <code className="font-mono">Admin@123</code></p>
      </div>

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

      {/* Right Side - Login Form */}
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
                Bem-vindo(a) à BeUni! 👋
              </h1>
              <p className="text-beuni-text/60">
                Faça login para continuar
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-beuni-text mb-2">
                  Email
                </label>
                <input
                  {...register('email', {
                    required: 'E-mail é obrigatório',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'E-mail inválido',
                    },
                  })}
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-beuni-orange-500 focus:border-beuni-orange-500 transition-colors"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-beuni-text">
                    Senha
                  </label>
                  <button
                    type="button"
                    className="text-sm text-beuni-orange-600 hover:text-beuni-orange-700 font-medium"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <input
                    {...register('password', {
                      required: 'Senha é obrigatória',
                    })}
                    id="password"
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 bg-beuni-orange-600 text-white font-semibold rounded-xl hover:bg-beuni-orange-700 focus:outline-none focus:ring-2 focus:ring-beuni-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Entrando...
                  </div>
                ) : (
                  'Login'
                )}
              </button>

              {/* Register Link */}
              <div className="text-center pt-4">
                <p className="text-sm text-beuni-text/70">
                  Novo na nossa plataforma?{' '}
                  <button
                    type="button"
                    onClick={() => router.push('/register')}
                    className="font-semibold text-beuni-orange-600 hover:text-beuni-orange-700 transition-colors"
                  >
                    Crie uma conta
                  </button>
                </p>
              </div>
            </form>

            {/* Demo Account Card */}
            <div className="mt-6 bg-gradient-to-br from-beuni-orange-50 to-beuni-brown-50 rounded-2xl p-4 border border-beuni-orange-200">
              <p className="text-xs font-semibold text-beuni-orange-600 mb-2">
                🎯 Conta de Demonstração
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-beuni-text/60 font-medium">E-mail:</span>
                  <p className="text-beuni-text font-mono text-xs">admin@beuni.com</p>
                </div>
                <div>
                  <span className="text-beuni-text/60 font-medium">Senha:</span>
                  <p className="text-beuni-text font-mono text-xs">Admin@123</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}