import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('beuni_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'Erro desconhecido';

    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      Cookies.remove('beuni_token');
      Cookies.remove('beuni_user');

      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 429) {
      toast.error('Muitas tentativas. Tente novamente em alguns minutos.');
    } else if (error.response?.status >= 500) {
      toast.error('Erro interno do servidor. Tente novamente mais tarde.');
    } else if (error.response?.status >= 400) {
      toast.error(Array.isArray(message) ? message[0] : message);
    } else {
      toast.error('Erro de conexão. Verifique sua internet.');
    }

    return Promise.reject(error);
  }
);

export default api;

// Helper function to handle API calls with loading states
export const apiCall = async <T = any>(
  request: () => Promise<any>,
  options?: {
    showSuccessToast?: boolean;
    successMessage?: string;
    showErrorToast?: boolean;
  }
): Promise<T> => {
  try {
    const response = await request();

    if (options?.showSuccessToast) {
      toast.success(options.successMessage || 'Operação realizada com sucesso!');
    }

    return response.data;
  } catch (error: any) {
    if (options?.showErrorToast !== false) {
      const message = error.response?.data?.message || error.message || 'Erro desconhecido';
      toast.error(Array.isArray(message) ? message[0] : message);
    }
    throw error;
  }
};

// Auth helpers
export const setAuthToken = (token: string, user: any) => {
  Cookies.set('beuni_token', token, { expires: 7 }); // 7 days
  Cookies.set('beuni_user', JSON.stringify(user), { expires: 7 });
};

export const removeAuthToken = () => {
  Cookies.remove('beuni_token');
  Cookies.remove('beuni_user');
};

export const getAuthToken = (): string | undefined => {
  return Cookies.get('beuni_token');
};

export const getUser = (): any | null => {
  try {
    const userStr = Cookies.get('beuni_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

// API endpoints
export const endpoints = {
  // Auth
  login: '/auth/login',
  register: '/auth/register',
  profile: '/auth/profile',

  // Colaboradores
  colaboradores: '/colaboradores',
  colaboradoresProximos: '/colaboradores/aniversariantes-proximos',

  // CEP
  cep: (cep: string) => `/cep/${cep}`,

  // Envio de Brindes
  enviosBrindes: '/envio-brindes',
  enviosProntos: '/envio-brindes/prontos-para-envio',
  marcarEnviado: (id: string) => `/envio-brindes/${id}/marcar-enviado`,
  estatisticas: '/envio-brindes/estatisticas',
  simularProcessamento: '/envio-brindes/simular-processamento',

  // Relatórios
  relatorios: '/envio-brindes/relatorios',
};