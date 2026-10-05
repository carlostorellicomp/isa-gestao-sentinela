'use client';

import React, { useState } from 'react';
import { 
  UserPlus, 
  Search, 
  ShieldCheck, 
  Edit3, 
  Trash2, 
  X, 
  Key, 
  Phone, 
  Mail, 
  Lock, 
  Unlock,
  AlertCircle
} from 'lucide-react';
import { SystemUser, UserRole, UserStatus, WhatsAppGroup } from '@/types/sentinela';

interface UserManagementProps {
  users: SystemUser[];
  onAddUser: (user: Omit<SystemUser, 'id' | 'createdAt' | 'lastActiveAt'>) => void;
  onUpdateUser: (id: string, updates: Partial<SystemUser>) => void;
  onDeleteUser: (id: string) => void;
  groups: WhatsAppGroup[];
}

const AVAILABLE_PERMISSIONS = [
  { key: 'manage_users', label: 'Gerenciar Usuários & Acessos', desc: 'Convidar, alterar cargos e suspender membros da equipe' },
  { key: 'trigger_removals', label: 'Autorizar Remoção de Grupos', desc: 'Permissão para desvincular alunos reembolsados na Kiwify' },
  { key: 'assign_tickets', label: 'Criar & Atribuir Tickets', desc: 'Encaminhar ocorrências para atendimento N1, N2 e N3' },
  { key: 'view_financials', label: 'Visualizar Dados Financeiros Kiwify', desc: 'Acesso a valores de estorno, planos e faturamento' },
  { key: 'manage_integrations', label: 'Configurar Integrações & Webhooks', desc: 'Editar chaves de API e instâncias de WhatsApp' },
];

export function UserManagement({
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  groups
}: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('senha123');
  const [role, setRole] = useState<UserRole>('attendant');
  const [status, setStatus] = useState<UserStatus>('active');
  const [assignedGroups, setAssignedGroups] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>(['assign_tickets']);

  const openCreateModal = () => {
    setEditingUserId(null);
    setName('');
    setEmail('');
    setPhone('+55 ');
    setPassword('senha123');
    setRole('attendant');
    setStatus('active');
    setAssignedGroups([]);
    setPermissions(['assign_tickets']);
    setIsModalOpen(true);
  };

  const openEditModal = (user: SystemUser) => {
    setEditingUserId(user.id);
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone);
    setPassword(user.password || 'senha123');
    setRole(user.role);
    setStatus(user.status);
    setAssignedGroups(user.assignedGroupIds);
    setPermissions(user.permissions);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const initials = name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    if (editingUserId) {
      onUpdateUser(editingUserId, {
        name,
        email,
        phone,
        password,
        role,
        status,
        assignedGroupIds: assignedGroups,
        permissions,
        avatar: initials
      });
    } else {
      onAddUser({
        name,
        email,
        phone,
        password: password.trim() || 'senha123',
        role,
        status,
        assignedGroupIds: assignedGroups,
        permissions,
        avatar: initials
      });
    }

    setIsModalOpen(false);
  };

  const toggleGroupSelection = (groupId: string) => {
    setAssignedGroups(prev =>
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  };

  const togglePermission = (permKey: string) => {
    setPermissions(prev =>
      prev.includes(permKey) ? prev.filter(k => k !== permKey) : [...prev, permKey]
    );
  };

  const filteredUsers = users.filter(user => {
    const matchSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    const matchRole = selectedRole === 'all' || user.role === selectedRole;
    const matchStatus = selectedStatus === 'all' || user.status === selectedStatus;
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-[#F7F4EB] p-6 rounded-2xl border border-[#E8E4D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-[#111827] tracking-tight">Gestão de Usuários & Controle de Acesso</h2>
            <span className="text-xs text-[#E65C00] font-semibold bg-[#E65C00]/10 px-2.5 py-0.5 rounded-full border border-[#E65C00]/20">
              {users.length} Colaboradores
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-1 max-w-3xl leading-relaxed">
            Cadastre atendentes, supervisores e administradores. O número de WhatsApp cadastrado permite que a IA do Sentinela reconheça as respostas oficiais da equipe nos grupos e congele o SLA das dúvidas.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E65C00] hover:bg-[#CC5200] text-white font-semibold text-xs shadow-sm transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Convidar Usuário
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou WhatsApp..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#FDFBF7] border border-[#E5E7EB] rounded-lg pl-9 pr-4 py-2 text-xs text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#E65C00] focus:ring-1 focus:ring-[#E65C00] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Role Filter */}
          <div className="flex items-center gap-1 bg-[#F7F4EB] border border-[#E8E4D9] rounded-lg p-1">
            <span className="text-[11px] text-[#6B7280] px-2 font-medium">Cargo:</span>
            {(['all', 'admin', 'supervisor', 'attendant', 'viewer'] as const).map(r => (
              <button
                key={r}
                onClick={() => setSelectedRole(r)}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedRole === r
                    ? 'bg-white text-[#E65C00] font-semibold shadow-xs'
                    : 'text-[#4B5563] hover:text-[#111827]'
                }`}
              >
                {r === 'all' ? 'Todos' : r === 'admin' ? 'Admin' : r === 'supervisor' ? 'Supervisor' : r === 'attendant' ? 'Atendente' : 'Visualizador'}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-[#F7F4EB] border border-[#E8E4D9] rounded-lg p-1">
            <span className="text-[11px] text-[#6B7280] px-2 font-medium">Status:</span>
            {(['all', 'active', 'suspended'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSelectedStatus(s)}
                className={`text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedStatus === s
                    ? 'bg-white text-[#111827] font-semibold shadow-xs'
                    : 'text-[#4B5563] hover:text-[#111827]'
                }`}
              >
                {s === 'all' ? 'Todos' : s === 'active' ? 'Ativos' : 'Suspensos'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
        <table className="w-full text-left text-xs text-[#4B5563]">
          <thead className="bg-[#F7F4EB] text-[#4B5563] uppercase tracking-wider text-[10px] border-b border-[#E8E4D9] font-bold">
            <tr>
              <th className="px-5 py-3.5">Membro</th>
              <th className="px-5 py-3.5">WhatsApp Oficial</th>
              <th className="px-5 py-3.5">Cargo</th>
              <th className="px-5 py-3.5">Grupos Monitorados</th>
              <th className="px-5 py-3.5">Permissões Especiais</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-[#9CA3AF] italic">
                  Nenhum usuário encontrado com os filtros selecionados.
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-[#FDFBF7] transition-colors">
                  
                  {/* Name and Email */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#F7F4EB] border border-[#E8E4D9] text-[#E65C00] font-bold text-xs flex items-center justify-center shrink-0">
                        {user.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-[#111827] text-sm">{user.name}</div>
                        <div className="text-[11px] text-[#6B7280] flex items-center gap-1">
                          <Mail className="w-3 h-3 text-[#9CA3AF]" /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* WhatsApp */}
                  <td className="px-5 py-4 font-mono text-[#111827]">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#E65C00] shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 block mt-0.5">
                      ✓ Mapeado pelo Sentinela
                    </span>
                  </td>

                  {/* Role */}
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold inline-flex items-center gap-1 ${
                      user.role === 'admin'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : user.role === 'supervisor'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : user.role === 'attendant'
                        ? 'bg-orange-50 text-[#E65C00] border border-orange-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      <ShieldCheck className="w-3 h-3" />
                      {user.role === 'admin' ? 'Administrador' : user.role === 'supervisor' ? 'Supervisor' : user.role === 'attendant' ? 'Atendente' : 'Visualizador'}
                    </span>
                  </td>

                  {/* Groups */}
                  <td className="px-5 py-4">
                    {user.assignedGroupIds.length === 0 ? (
                      <span className="text-[#9CA3AF] italic text-[11px]">Nenhum grupo vinculado</span>
                    ) : user.assignedGroupIds.length === groups.length ? (
                      <span className="text-[#E65C00] font-medium text-[11px] bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                        Todos os Grupos ({groups.length})
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {user.assignedGroupIds.slice(0, 2).map(gid => {
                          const g = groups.find(x => x.id === gid);
                          return (
                            <span key={gid} className="px-2 py-0.5 rounded bg-[#F7F4EB] text-[10px] text-[#4B5563] border border-[#E8E4D9]">
                              {g?.name || gid}
                            </span>
                          );
                        })}
                        {user.assignedGroupIds.length > 2 && (
                          <span className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] text-[#6B7280]">
                            +{user.assignedGroupIds.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Permissions */}
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {user.permissions.includes('manage_users') && (
                        <span className="px-1.5 py-0.5 rounded bg-purple-50 text-[10px] text-purple-700 border border-purple-200">
                          Usuários
                        </span>
                      )}
                      {user.permissions.includes('trigger_removals') && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-50 text-[10px] text-rose-700 border border-rose-200">
                          Remover Reembolso
                        </span>
                      )}
                      {user.permissions.includes('assign_tickets') && (
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[10px] text-blue-700 border border-blue-200">
                          Tickets
                        </span>
                      )}
                      {user.permissions.includes('view_financials') && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-[10px] text-amber-700 border border-amber-200">
                          Financeiro
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1.5 ${
                      user.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : user.status === 'pending'
                        ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        user.status === 'active' ? 'bg-emerald-500' : user.status === 'pending' ? 'bg-yellow-500' : 'bg-rose-500'
                      }`} />
                      {user.status === 'active' ? 'Ativo' : user.status === 'pending' ? 'Pendente' : 'Suspenso'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        title={user.status === 'active' ? 'Suspender usuário' : 'Ativar usuário'}
                        onClick={() => onUpdateUser(user.id, { status: user.status === 'active' ? 'suspended' : 'active' })}
                        className="p-1.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F7F4EB] text-[#4B5563] transition-colors cursor-pointer"
                      >
                        {user.status === 'active' ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5 text-emerald-600" />}
                      </button>

                      <button
                        title="Editar usuário"
                        onClick={() => openEditModal(user)}
                        className="p-1.5 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F7F4EB] text-[#4B5563] hover:text-[#E65C00] transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {user.role !== 'admin' && (
                        <button
                          title="Remover usuário"
                          onClick={() => onDeleteUser(user.id)}
                          className="p-1.5 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Security and Governance Matrix Card */}
      <div className="p-6 rounded-2xl bg-[#F7F4EB] border border-[#E8E4D9]">
        <h3 className="text-xs uppercase tracking-wider text-[#4B5563] font-bold mb-3 flex items-center gap-2">
          <Key className="w-4 h-4 text-[#E65C00]" />
          Matriz de Governança e Papéis (Sentinela Security)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EB]">
            <span className="font-bold text-purple-800 block mb-1">Administrador Geral</span>
            <p className="text-[11px] text-[#4B5563] leading-relaxed">
              Acesso irrestrito a faturamento, exclusão de grupos, configuração de tokens WhatsApp/Kiwify e gestão total de permissões.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EB]">
            <span className="font-bold text-blue-800 block mb-1">Supervisor de Atendimento</span>
            <p className="text-[11px] text-[#4B5563] leading-relaxed">
              Supervisiona todos os grupos, redistribui chamados no Kanban, autoriza remoção de reembolsados e audita SLA da equipe.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EB]">
            <span className="font-bold text-[#E65C00] block mb-1">Atendente de Suporte</span>
            <p className="text-[11px] text-[#4B5563] leading-relaxed">
              Visualiza os grupos atribuídos, responde alunos, assume tickets N1/N2 e sinaliza ocorrências críticas para a supervisão.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EB]">
            <span className="font-bold text-[#374151] block mb-1">Visualizador / Auditor</span>
            <p className="text-[11px] text-[#4B5563] leading-relaxed">
              Apenas leitura de dashboards analíticos, relatórios de satisfação e descobertas da IA, sem permissão de resposta nos grupos.
            </p>
          </div>
        </div>
      </div>

      {/* Modal: Convidar / Editar Usuário */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl p-6 space-y-5">
            
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#111827]">
                  {editingUserId ? 'Editar Usuário do Sentinela' : 'Convidar Novo Usuário'}
                </h3>
                <p className="text-xs text-[#6B7280]">Preencha os dados e defina o escopo de atuação do colaborador.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#9CA3AF] hover:text-[#111827] p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              
              {/* Nome */}
              <div>
                <label className="text-xs font-semibold text-[#374151] block mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Amanda Silva"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#FDFBF7] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#E65C00]"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#374151] block mb-1">E-mail Corporativo</label>
                  <input
                    type="email"
                    required
                    placeholder="amanda@empresa.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-[#FDFBF7] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#E65C00]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#374151] block mb-1">WhatsApp (Número Oficial)</label>
                  <input
                    type="text"
                    required
                    placeholder="+55 11 99999-0001"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-[#FDFBF7] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#E65C00]"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#F7F4EB] border border-[#E8E4D9] text-[11px] text-[#4B5563] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#E65C00] shrink-0 mt-0.5" />
                <span>
                  O número de WhatsApp cadastrado é essencial: quando este número enviar mensagens nos grupos, a IA marcará a dúvida do aluno como <strong>respondida</strong> em vez de gerar novos alertas.
                </span>
              </div>

              {/* Role & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#374151] block mb-1">Cargo / Função</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as UserRole)}
                    className="w-full bg-[#FDFBF7] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#E65C00] cursor-pointer"
                  >
                    <option value="attendant">Atendente de Suporte</option>
                    <option value="supervisor">Supervisor de Atendimento</option>
                    <option value="admin">Administrador Geral</option>
                    <option value="viewer">Visualizador / Auditor</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#374151] block mb-1">Status da Conta</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as UserStatus)}
                    className="w-full bg-[#FDFBF7] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#E65C00] cursor-pointer"
                  >
                    <option value="active">Ativo (Com acesso)</option>
                    <option value="pending">Pendente (Aguardando convite)</option>
                    <option value="suspended">Suspenso (Acesso bloqueado)</option>
                  </select>
                </div>
              </div>

              {/* Senha de Acesso */}
              <div>
                <label className="text-xs font-semibold text-[#374151] block mb-1">
                  Senha de Acesso à Plataforma
                </label>
                <input
                  type="text"
                  placeholder="Defina a senha (padrão: senha123)"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#FDFBF7] border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#111827] font-mono focus:outline-none focus:border-[#E65C00]"
                />
                <span className="text-[10px] text-[#6B7280] mt-1 block">
                  O colaborador usará este e-mail e senha para fazer login no sistema fechado.
                </span>
              </div>

              {/* Grupos atribuídos */}
              <div>
                <label className="text-xs font-semibold text-[#374151] block mb-1">
                  Grupos de WhatsApp Atribuídos ({assignedGroups.length} selecionados)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto bg-[#FDFBF7] p-2.5 rounded-lg border border-[#E5E7EB] text-xs">
                  {groups.map(g => (
                    <label key={g.id} className="flex items-center gap-2 cursor-pointer text-[#4B5563] hover:text-[#111827]">
                      <input
                        type="checkbox"
                        checked={assignedGroups.includes(g.id)}
                        onChange={() => toggleGroupSelection(g.id)}
                        className="rounded border-[#E5E7EB] text-[#E65C00] focus:ring-[#E65C00]"
                      />
                      <span>{g.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Granular Permissions */}
              <div>
                <label className="text-xs font-semibold text-[#374151] block mb-1.5">Permissões de Acesso</label>
                <div className="space-y-2 bg-[#FDFBF7] p-3 rounded-lg border border-[#E5E7EB]">
                  {AVAILABLE_PERMISSIONS.map(p => (
                    <label key={p.key} className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permissions.includes(p.key)}
                        onChange={() => togglePermission(p.key)}
                        className="mt-0.5 rounded border-[#E5E7EB] text-[#E65C00] focus:ring-[#E65C00]"
                      />
                      <div>
                        <div className="text-xs font-medium text-[#111827]">{p.label}</div>
                        <div className="text-[10px] text-[#6B7280]">{p.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#4B5563] text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#E65C00] hover:bg-[#CC5200] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  {editingUserId ? 'Salvar Alterações' : 'Concluir Convite'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
