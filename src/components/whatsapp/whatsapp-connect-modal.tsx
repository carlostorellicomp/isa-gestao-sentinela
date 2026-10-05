'use client';

import React, { useState } from 'react';
import { 
  QrCode, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Smartphone, 
  X, 
  ArrowRight, 
  RefreshCw, 
  Check, 
  Users, 
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';
import { WhatsAppGroup, WhatsAppInstance } from '@/types/sentinela';

interface WhatsAppConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  instance: WhatsAppInstance;
  groups: WhatsAppGroup[];
  onUpdateGroups: (updatedGroups: WhatsAppGroup[]) => void;
  onUpdateInstance: (updatedInstance: WhatsAppInstance) => void;
}

export function WhatsAppConnectModal({
  isOpen,
  onClose,
  instance,
  groups,
  onUpdateGroups,
  onUpdateInstance
}: WhatsAppConnectModalProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isScanning, setIsScanning] = useState(false);
  const [tempGroups, setTempGroups] = useState<WhatsAppGroup[]>(groups);
  const [localInstance, setLocalInstance] = useState<WhatsAppInstance>(instance);

  if (!isOpen) return null;

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setLocalInstance({
        ...localInstance,
        status: 'connected',
        phone: '+55 11 97722-1000',
        lastConnectedAt: 'Conectado agora'
      });
      setCurrentStep(2);
    }, 1200);
  };

  const handleToggleMonitored = (groupId: string) => {
    setTempGroups(prev =>
      prev.map(g => (g.id === groupId ? { ...g, isMonitored: !g.isMonitored } : g))
    );
  };

  const handlePromoteAdmin = (groupId: string) => {
    setTempGroups(prev =>
      prev.map(g => (g.id === groupId ? { ...g, isBotAdmin: true } : g))
    );
  };

  const handleSaveAndFinish = () => {
    onUpdateGroups(tempGroups);
    onUpdateInstance(localInstance);
    onClose();
  };

  const monitoredCount = tempGroups.filter(g => g.isMonitored).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-[#E5E7EB] bg-[#F7F4EB] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#E65C00] text-white flex items-center justify-center font-bold text-xs">
                WA
              </span>
              <h3 className="text-lg font-bold text-[#111827]">Assistente de Conexão do WhatsApp</h3>
            </div>
            <p className="text-xs text-[#4B5563] mt-1">
              Conecte o número do Sentinela, verifique permissões de Admin e selecione quais grupos monitorar.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-[#9CA3AF] hover:text-[#111827] p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="grid grid-cols-3 border-b border-[#E5E7EB] text-center text-xs font-semibold bg-[#FDFBF7]">
          <button
            onClick={() => setCurrentStep(1)}
            className={`py-3 px-2 border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              currentStep === 1
                ? 'border-[#E65C00] text-[#E65C00] bg-orange-50/50'
                : 'border-transparent text-[#6B7280]'
            }`}
          >
            <span className="w-5 h-5 rounded-full border border-current text-[11px] flex items-center justify-center">1</span>
            <span>1. Escanear QR Code</span>
          </button>

          <button
            onClick={() => setCurrentStep(2)}
            className={`py-3 px-2 border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              currentStep === 2
                ? 'border-[#E65C00] text-[#E65C00] bg-orange-50/50'
                : 'border-transparent text-[#6B7280]'
            }`}
          >
            <span className="w-5 h-5 rounded-full border border-current text-[11px] flex items-center justify-center">2</span>
            <span>2. Validar Admin</span>
          </button>

          <button
            onClick={() => setCurrentStep(3)}
            className={`py-3 px-2 border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              currentStep === 3
                ? 'border-[#E65C00] text-[#E65C00] bg-orange-50/50'
                : 'border-transparent text-[#6B7280]'
            }`}
          >
            <span className="w-5 h-5 rounded-full border border-current text-[11px] flex items-center justify-center">3</span>
            <span>3. Selecionar Grupos</span>
          </button>
        </div>

        {/* Modal Body per Step */}
        <div className="p-6 flex-1 space-y-6">
          
          {/* STEP 1: QR CODE CONNECTION */}
          {currentStep === 1 && (
            <div className="flex flex-col items-center text-center space-y-5">
              <div className="max-w-md">
                <h4 className="text-base font-bold text-[#111827]">Conecte seu WhatsApp ao Sentinela</h4>
                <p className="text-xs text-[#4B5563] mt-1">
                  Abra o WhatsApp no aparelho que atuará como bot do suporte, vá em <strong>Configurações &gt; Aparelhos Conectados &gt; Conectar um Aparelho</strong> e aponte para o código abaixo:
                </p>
              </div>

              {/* Graphic QR Code Simulation Container */}
              <div className="p-6 bg-white border-2 border-dashed border-[#E5E7EB] rounded-2xl flex flex-col items-center justify-center shadow-xs">
                {localInstance.status === 'connected' ? (
                  <div className="flex flex-col items-center py-6 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-[#111827] block">WhatsApp Conectado com Sucesso!</span>
                      <span className="text-xs text-[#6B7280] font-mono mt-0.5 block">{localInstance.phone}</span>
                    </div>
                    <span className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-medium border border-emerald-200">
                      Sessão Ativa • Multi-Device
                    </span>
                  </div>
                ) : (
                  <div className="space-y-4 flex flex-col items-center">
                    {/* Stylized QR Code Box */}
                    <div className="w-48 h-48 bg-[#F7F4EB] border border-[#E8E4D9] rounded-xl p-3 flex flex-col items-center justify-center relative overflow-hidden group">
                      <QrCode className="w-36 h-36 text-[#111827]" />
                      {isScanning && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center flex-col gap-2">
                          <RefreshCw className="w-6 h-6 text-[#E65C00] animate-spin" />
                          <span className="text-xs font-semibold text-[#111827]">Sincronizando chats...</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] text-[#6B7280] flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 text-[#9CA3AF]" /> Atualiza automaticamente em 45 segundos
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {localInstance.status !== 'connected' ? (
                  <button
                    onClick={handleSimulateScan}
                    disabled={isScanning}
                    className="px-5 py-2.5 bg-[#E65C00] hover:bg-[#CC5200] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Smartphone className="w-4 h-4" />
                    {isScanning ? 'Emparelhando aparelho...' : 'Simular Leitura do QR Code'}
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-2.5 bg-[#E65C00] hover:bg-[#CC5200] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
                  >
                    Avançar para Verificação de Admin <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: ADMIN VALIDATION */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="bg-[#F7F4EB] p-4 rounded-xl border border-[#E8E4D9]">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#E65C00] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                      Por que o número conectado deve ser Administrador dos Grupos?
                    </h4>
                    <p className="text-xs text-[#4B5563] mt-1 leading-relaxed">
                      Para que o Sentinela possa <strong>expulsar alunos reembolsados na Kiwify</strong> e ler todas as mensagens sem limites de privacidade, adicione o número <strong>{localInstance.phone}</strong> como Administrador em cada grupo de suporte.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <span className="text-xs font-bold text-[#111827] block">Status de Administrador por Grupo:</span>
                <div className="divide-y divide-[#E5E7EB] border border-[#E5E7EB] rounded-xl bg-white overflow-hidden">
                  {tempGroups.map(group => (
                    <div key={group.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-[#FDFBF7]">
                      <div>
                        <span className="font-semibold text-[#111827]">{group.name}</span>
                        <span className="text-[11px] text-[#6B7280] block">{group.totalStudents} membros</span>
                      </div>

                      <div className="flex items-center gap-3">
                        {group.isBotAdmin ? (
                          <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-emerald-200">
                            <Check className="w-3.5 h-3.5" /> Administrador Confirmado
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-amber-200">
                              <AlertTriangle className="w-3.5 h-3.5" /> Não é Admin
                            </span>
                            <button
                              onClick={() => handlePromoteAdmin(group.id)}
                              className="px-2.5 py-1 bg-white hover:bg-gray-50 border border-[#E5E7EB] text-[#111827] font-semibold rounded-lg text-[10px] cursor-pointer"
                            >
                              Promover a Admin
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 text-xs font-medium text-[#4B5563] hover:text-[#111827] cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 bg-[#E65C00] hover:bg-[#CC5200] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
                >
                  Avançar para Seleção de Grupos <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: GROUP SELECTION FOR MONITORING */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#111827]">Selecione quais Grupos Deseja Monitorar</h4>
                  <p className="text-xs text-[#4B5563]">Apenas os grupos marcados terão análise de dúvidas por IA e automação de reembolso.</p>
                </div>
                <span className="text-xs font-bold text-[#E65C00] bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                  {monitoredCount} de {tempGroups.length} selecionados
                </span>
              </div>

              {/* Group Selection Checklist */}
              <div className="divide-y divide-[#E5E7EB] border border-[#E5E7EB] rounded-xl bg-white max-h-72 overflow-y-auto">
                {tempGroups.map(group => (
                  <label
                    key={group.id}
                    className="p-4 flex items-center justify-between text-xs hover:bg-[#FDFBF7] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={group.isMonitored}
                        onChange={() => handleToggleMonitored(group.id)}
                        className="rounded border-[#E5E7EB] text-[#E65C00] focus:ring-[#E65C00] w-4 h-4"
                      />
                      <div>
                        <div className="font-semibold text-[#111827] text-sm">{group.name}</div>
                        <div className="text-[11px] text-[#6B7280] flex items-center gap-2 mt-0.5">
                          <span>{group.totalStudents} alunos</span>
                          <span>•</span>
                          <span>{group.totalAttendants} atendentes</span>
                          <span>•</span>
                          <span className={group.isBotAdmin ? 'text-emerald-600 font-medium' : 'text-amber-600 font-medium'}>
                            {group.isBotAdmin ? 'Bot Admin OK' : 'Bot Não é Admin'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      group.isMonitored
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {group.isMonitored ? 'Monitoramento Ativo' : 'Ignorado'}
                    </span>
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 text-xs font-medium text-[#4B5563] hover:text-[#111827] cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  onClick={handleSaveAndFinish}
                  className="px-6 py-2.5 bg-[#E65C00] hover:bg-[#CC5200] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Salvar e Iniciar Monitoramento
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
