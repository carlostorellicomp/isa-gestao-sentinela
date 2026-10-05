import { SystemUser } from '@/types/sentinela';
import { INITIAL_SYSTEM_USERS } from '../mock-data';

const SESSION_KEY = 'sentinela_auth_session';

export function getStoredSession(): SystemUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredSession(user: SystemUser): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch {
    // quota exceeded or private mode
  }
}

export function clearStoredSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}

export function authenticateUser(
  emailInput: string,
  passwordInput: string,
  systemUsers: SystemUser[] = INITIAL_SYSTEM_USERS
): { success: boolean; user?: SystemUser; error?: string } {
  const cleanEmail = emailInput.trim().toLowerCase();
  const cleanPass = passwordInput.trim();

  if (!cleanEmail || !cleanPass) {
    return { success: false, error: 'Por favor, preencha o e-mail e a senha.' };
  }

  // 1. Verificar credencial Master Admin
  if (
    (cleanEmail === 'admin@isagestao.com.br' || cleanEmail === 'rodrigo@empresa.com.br') &&
    cleanPass === 'admin123'
  ) {
    const adminUser = systemUsers.find(u => u.role === 'admin') || INITIAL_SYSTEM_USERS[0];
    const sessionUser: SystemUser = {
      ...adminUser,
      email: cleanEmail,
      lastActiveAt: 'Agora'
    };
    setStoredSession(sessionUser);
    return { success: true, user: sessionUser };
  }

  // 2. Verificar lista de usuários do sistema
  const found = systemUsers.find(u => u.email.trim().toLowerCase() === cleanEmail);
  if (!found) {
    return { success: false, error: 'Usuário não cadastrado no sistema.' };
  }

  if (found.status === 'suspended') {
    return { success: false, error: 'Este acesso foi suspenso pelo administrador.' };
  }

  const expectedPass = found.password || 'senha123';
  if (cleanPass !== expectedPass) {
    return { success: false, error: 'Senha incorreta. Tente novamente.' };
  }

  const sessionUser: SystemUser = {
    ...found,
    lastActiveAt: 'Agora'
  };
  setStoredSession(sessionUser);
  return { success: true, user: sessionUser };
}
