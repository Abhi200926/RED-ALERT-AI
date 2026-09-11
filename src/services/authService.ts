import { User, UserRole, AuthSession } from '../types';

const AUTH_STORAGE_KEY = 'redalert_auth_session_v1';

class AuthService {
  private currentSession: AuthSession | null = null;
  private listeners: Array<(session: AuthSession | null) => void> = [];

  constructor() {
    this.loadSession();
  }

  private loadSession() {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed: AuthSession = JSON.parse(saved);
        // Check if token has expired
        if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
          this.clearSession();
        } else {
          this.currentSession = parsed;
        }
      }
    } catch {
      this.clearSession();
    }
  }

  private saveSession(session: AuthSession) {
    this.currentSession = session;
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    } catch {
      // ignore
    }
    this.notifyListeners();
  }

  private clearSession() {
    this.currentSession = null;
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
    this.notifyListeners();
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      listener(this.currentSession);
    }
  }

  public subscribe(callback: (session: AuthSession | null) => void): () => void {
    this.listeners.push(callback);
    callback(this.currentSession);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  public getSession(): AuthSession | null {
    if (this.currentSession && this.currentSession.expiresAt && Date.now() > this.currentSession.expiresAt) {
      this.clearSession();
      return null;
    }
    return this.currentSession;
  }

  public getUser(): User | null {
    const session = this.getSession();
    return session ? session.user : null;
  }

  public getRole(): UserRole {
    const user = this.getUser();
    return user ? user.role : 'CITIZEN';
  }

  public isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  public getAuthHeaders(): HeadersInit {
    const session = this.getSession();
    if (session && session.token) {
      return {
        Authorization: `Bearer ${session.token}`,
        'Content-Type': 'application/json',
      };
    }
    return {
      'Content-Type': 'application/json',
    };
  }

  public async login(email: string, pass: string): Promise<{ success: boolean; error?: string; remainingSec?: number }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          error: data.error || 'Authentication failed',
          remainingSec: data.remainingSec,
        };
      }

      this.saveSession({
        user: data.user,
        token: data.token,
        expiresAt: data.expiresAt,
        sessionVersion: data.sessionVersion,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during login' };
    }
  }

  public async register(name: string, email: string, pass: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      this.saveSession({
        user: data.user,
        token: data.token,
        expiresAt: data.expiresAt,
        sessionVersion: data.sessionVersion,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during registration' };
    }
  }

  public async logout(): Promise<void> {
    const session = this.getSession();
    if (session) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: this.getAuthHeaders(),
        });
      } catch {
        // ignore
      }
    }
    this.clearSession();
  }

  public async logoutAllDevices(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch('/api/auth/logout-all', {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });
      const data = await res.json();
      this.clearSession();
      return { success: true, message: data.message };
    } catch (err: any) {
      this.clearSession();
      return { success: false, error: err.message };
    }
  }

  // Demo switch helper: quick one-click switch for test accounts
  public async demoLogin(role: UserRole): Promise<{ success: boolean; error?: string }> {
    const credentials: Record<UserRole, { email: string; pass: string }> = {
      CITIZEN: { email: 'citizen@redalert.ai', pass: 'CitizenSafe2026!' },
      RESCUE_OPERATOR: { email: 'operator@redalert.ai', pass: 'RescueSquad2026!' },
      ADMIN: { email: 'admin@redalert.ai', pass: 'AdminSecurity2026!' },
    };

    const cred = credentials[role];
    return this.login(cred.email, cred.pass);
  }
}

export const authService = new AuthService();
