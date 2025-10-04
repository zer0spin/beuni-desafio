import { useState } from 'react';
import { X, Package, Clock, Truck, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';

interface EnvioBrinde {
  id: string;
  colaboradorId: string;
  anoAniversario: number;
  status: 'PENDENTE' | 'PRONTO_PARA_ENVIO' | 'ENVIADO' | 'ENTREGUE' | 'CANCELADO';
  dataGatilhoEnvio?: string;
  dataEnvioRealizado?: string;
  observacoes?: string;
  createdAt: string;
  colaborador: {
    id: string;
    nomeCompleto: string;
    dataNascimento: string;
    cargo: string;
    departamento: string;
    endereco: {
      cidade: string;
      uf: string;
      logradouro: string;
      numero: string;
      complemento?: string;
      bairro: string;
      cep: string;
    };
  };
}

interface ShipmentStatusModalProps {
  envio: EnvioBrinde;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const statusOptions = [
  {
    value: 'PENDENTE',
    label: 'Pendente',
    description: 'Aguardando aproximação do aniversário',
    icon: Clock,
    color: 'yellow'
  },
  {
    value: 'PRONTO_PARA_ENVIO',
    label: 'Pronto para Envio',
    description: 'Pode ser processado pela logística',
    icon: Package,
    color: 'blue'
  },
  {
    value: 'ENVIADO',
    label: 'Enviado',
    description: 'Brinde foi enviado para o colaborador',
    icon: Truck,
    color: 'green'
  },
  {
    value: 'ENTREGUE',
    label: 'Entregue',
    description: 'Confirmação de entrega recebida',
    icon: CheckCircle,
    color: 'emerald'
  },
  {
    value: 'CANCELADO',
    label: 'Cancelado',
    description: 'Envio foi cancelado',
    icon: AlertCircle,
    color: 'red'
  }
];

export default function ShipmentStatusModal({ envio, isOpen, onClose, onUpdate }: ShipmentStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(envio.status);
  const [observacoes, setObservacoes] = useState(envio.observacoes || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedStatus === envio.status && observacoes === (envio.observacoes || '')) {
      toast.error('Nenhuma alteração foi feita');
      return;
    }

    setLoading(true);
    try {
      await api.patch(`/envio-brindes/${envio.id}/status`, {
        status: selectedStatus,
        observacoes: observacoes.trim() || undefined
      });
      
      toast.success('Status atualizado com sucesso!');
      onUpdate();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar status');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-beuni-orange-500 to-beuni-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                {envio.colaborador.nomeCompleto.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-beuni-text">
                  Gerenciar Status de Envio
                </h3>
                <p className="text-sm text-beuni-text/60">
                  {envio.colaborador.nomeCompleto} • {envio.colaborador.cargo}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-beuni-text/40 hover:text-beuni-text hover:bg-beuni-cream rounded-lg transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Colaborador Info */}
          <div className="bg-beuni-cream rounded-xl p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-beuni-orange-600" />
                <div>
                  <p className="text-xs text-beuni-text/60 font-semibold uppercase">Aniversário</p>
                  <p className="text-sm font-bold text-beuni-text">
                    {formatDate(envio.colaborador.dataNascimento)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Package className="h-5 w-5 text-beuni-orange-600" />
                <div>
                  <p className="text-xs text-beuni-text/60 font-semibold uppercase">Endereço</p>
                  <p className="text-sm font-bold text-beuni-text">
                    {envio.colaborador.endereco.cidade}/{envio.colaborador.endereco.uf}
                  </p>
                  <p className="text-xs text-beuni-text/60">
                    {envio.colaborador.endereco.logradouro}, {envio.colaborador.endereco.numero}
                    {envio.colaborador.endereco.complemento && `, ${envio.colaborador.endereco.complemento}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Status Selection */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-beuni-text mb-4">
                Selecionar Status
              </label>
              <div className="grid grid-cols-1 gap-3">
                {statusOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedStatus === option.value;
                  
                  return (
                    <label
                      key={option.value}
                      className={`cursor-pointer transition-all rounded-xl border-2 p-4 ${
                        isSelected
                          ? `border-${option.color}-500 bg-${option.color}-50`
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="status"
                          value={option.value}
                          checked={isSelected}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="sr-only"
                        />
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isSelected ? `bg-${option.color}-500 text-white` : 'bg-gray-100 text-gray-500'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className={`font-bold ${
                            isSelected ? `text-${option.color}-900` : 'text-beuni-text'
                          }`}>
                            {option.label}
                          </p>
                          <p className={`text-sm ${
                            isSelected ? `text-${option.color}-700` : 'text-beuni-text/60'
                          }`}>
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Observações */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-beuni-text mb-2">
                Observações
              </label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Adicione observações sobre esta mudança de status (opcional)..."
                rows={3}
                className="w-full px-4 py-3 border border-beuni-orange-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-beuni-orange-500 focus:border-beuni-orange-500 resize-none"
              />
              <p className="text-xs text-beuni-text/60 mt-1">
                Ex: "Enviado via Correios - Código: BR123456789" ou "Cancelado por mudança de endereço"
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-beuni-text bg-beuni-cream hover:bg-beuni-orange-50 rounded-xl font-semibold transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-beuni-orange-500 to-beuni-orange-600 text-white font-semibold rounded-xl hover:from-beuni-orange-600 hover:to-beuni-orange-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Atualizando...</span>
                  </div>
                ) : (
                  'Atualizar Status'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}