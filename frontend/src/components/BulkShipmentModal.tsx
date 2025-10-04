import { useState } from 'react';
import { X, Package, Users, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';

interface BulkShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkShipmentModal({ isOpen, onClose, onSuccess }: BulkShipmentModalProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'confirm' | 'processing'>('select');

  // Últimos 5 anos incluindo o atual (ex: 2021, 2022, 2023, 2024, 2025)
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i).reverse();

  const handleCreateRecords = async () => {
    setStep('processing');
    setLoading(true);
    
    try {
      const response = await api.post(`/envio-brindes/criar-registros-ano/${selectedYear}`);
      
      toast.success(`Registros criados para o ano ${selectedYear}!`);
      onSuccess();
      onClose();
      setStep('select');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao criar registros');
      setStep('select');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedTestData = async () => {
    setStep('processing');
    setLoading(true);
    
    try {
      const response = await api.post('/envio-brindes/seed-test-data');
      
      toast.success('Dados de teste criados com sucesso!');
      onSuccess();
      onClose();
      setStep('select');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao criar dados de teste');
      setStep('select');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep('select');
    setSelectedYear(new Date().getFullYear());
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-beuni-orange-500 to-beuni-orange-600 flex items-center justify-center text-white shadow-md">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-beuni-text">
                  Criar Envios em Massa
                </h3>
                <p className="text-sm text-beuni-text/60">
                  Gerar registros de envio para colaboradores
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-beuni-text/40 hover:text-beuni-text hover:bg-beuni-cream rounded-lg transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {step === 'select' && (
            <>
              {/* Year Selection */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-beuni-text mb-3">
                  Selecionar Ano
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {availableYears.map((year) => (
                    <label
                      key={year}
                      className={`cursor-pointer transition-all rounded-xl border-2 p-4 ${
                        selectedYear === year
                          ? 'border-beuni-orange-500 bg-beuni-orange-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="year"
                          value={year}
                          checked={selectedYear === year}
                          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                          className="sr-only"
                        />
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          selectedYear === year 
                            ? 'bg-beuni-orange-500 text-white' 
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className={`font-bold ${
                            selectedYear === year ? 'text-beuni-orange-900' : 'text-beuni-text'
                          }`}>
                            Ano {year}
                          </p>
                          <p className={`text-sm ${
                            selectedYear === year ? 'text-beuni-orange-700' : 'text-beuni-text/60'
                          }`}>
                            Criar registros para todos os colaboradores
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <div className="flex space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-800">
                      Importante
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Esta ação criará registros de envio para <strong>todos os colaboradores</strong> no ano selecionado.
                      Registros já existentes não serão duplicados.
                    </p>
                  </div>
                </div>
              </div>

              {/* Test Data Option */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex space-x-3">
                  <Users className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-800">
                      Dados de Teste
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Se você não tem colaboradores cadastrados, pode criar dados de demonstração
                      com colaboradores e envios de exemplo.
                    </p>
                    <button
                      onClick={handleSeedTestData}
                      disabled={loading}
                      className="mt-3 px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50"
                    >
                      Criar Dados de Teste
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={handleClose}
                  className="px-6 py-3 text-beuni-text bg-beuni-cream hover:bg-beuni-orange-50 rounded-xl font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setStep('confirm')}
                  className="px-6 py-3 bg-gradient-to-r from-beuni-orange-500 to-beuni-orange-600 text-white font-semibold rounded-xl hover:from-beuni-orange-600 hover:to-beuni-orange-700 transition-all shadow-md hover:shadow-lg"
                >
                  Continuar
                </button>
              </div>
            </>
          )}

          {step === 'confirm' && (
            <>
              {/* Confirmation */}
              <div className="bg-beuni-cream rounded-xl p-6 mb-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-beuni-orange-500 to-beuni-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-lg font-bold text-beuni-text mb-2">
                  Confirmar Criação
                </h4>
                <p className="text-beuni-text/70">
                  Você está prestes a criar registros de envio para <strong>todos os colaboradores</strong> no ano <strong>{selectedYear}</strong>.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setStep('select')}
                  className="px-6 py-3 text-beuni-text bg-beuni-cream hover:bg-beuni-orange-50 rounded-xl font-semibold transition-all"
                >
                  Voltar
                </button>
                <button
                  onClick={handleCreateRecords}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Criando...' : 'Criar Registros'}
                </button>
              </div>
            </>
          )}

          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-beuni-orange-500 to-beuni-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
              <h4 className="text-lg font-bold text-beuni-text mb-2">
                Criando Registros...
              </h4>
              <p className="text-beuni-text/60">
                Por favor, aguarde enquanto os registros são criados.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}