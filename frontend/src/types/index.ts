// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

// User and Auth Types
export interface User {
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

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface RegisterCredentials {
  nome: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Colaborador Types
export interface Endereco {
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface Colaborador {
  id: string;
  nome_completo: string;
  data_nascimento: string; // dd/MM/yyyy format
  cargo: string;
  departamento: string;
  endereco: Endereco;
  status_envio_atual?: EnvioStatus;
}

export interface CreateColaboradorData {
  nome_completo: string;
  data_nascimento: string; // YYYY-MM-DD format
  cargo: string;
  departamento: string;
  endereco: {
    cep: string;
    numero: string;
    complemento?: string;
  };
}

// CEP Types
export interface CepData {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
  fromCache: boolean;
}

// Envio de Brindes Types
export type EnvioStatus =
  | 'PENDENTE'
  | 'PRONTO_PARA_ENVIO'
  | 'ENVIADO'
  | 'ENTREGUE'
  | 'CANCELADO';

export interface EnvioBrinde {
  id: string;
  anoAniversario: number;
  status: EnvioStatus;
  dataGatilhoEnvio?: string;
  dataEnvioRealizado?: string;
  observacoes?: string;
  colaborador: Colaborador;
}

export interface EstatisticasEnvio {
  ano: number;
  total: number;
  porStatus: Record<EnvioStatus, number>;
}

// Pagination Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ColaboradoresResponse {
  colaboradores: Colaborador[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter Types
export interface ColaboradorFilters {
  mes?: number;
  departamento?: string;
  page?: number;
  limit?: number;
}

// Form Types
export interface FormState {
  isLoading: boolean;
  error?: string;
  success?: boolean;
}

// Dashboard Types
export interface DashboardStats {
  totalColaboradores: number;
  aniversariantesProximoMes: number;
  enviosPendentes: number;
  enviosRealizados: number;
}

// Component Props Types
export interface PageProps {
  params?: { [key: string]: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

// Error Types
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  details?: any;
}

// Status Badge Types
export interface StatusBadgeProps {
  status: EnvioStatus;
  size?: 'sm' | 'md' | 'lg';
}

// Table Types
export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
}