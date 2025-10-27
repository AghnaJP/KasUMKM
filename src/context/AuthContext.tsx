import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  PropsWithChildren,
  useContext,
} from 'react';
import EncryptedStorage from 'react-native-encrypted-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {editUsername, deleteUser} from '../database/users/userQueries';
import {API_BASE} from '../constants/api';
import {
  saveSession,
  clearSession,
  getActiveSession,
  getAccessToken,
} from '../database/sessions/sessionStore';

type Role = 'OWNER' | 'CASHIER' | string | null;

type AuthProfile = {
  name: string;
  phone: string;
};

export type AuthState = {
  isLoggedIn: boolean;
  token: string | null;
  companyId: string | null;
  role: Role;
  profile: AuthProfile;
};

export type LoginObject = {
  token: string;
  companyId?: string | null;
  role?: Role;
  profile?: Partial<AuthProfile>;
};

type AuthContextType = {
  isLoggedIn: boolean;
  token: string | null;
  companyId: string | null;
  role: Role;
  profile: AuthProfile;
  login: ((name: string, phone: string) => Promise<void>) &
    ((obj: LoginObject) => Promise<void>);
  logout: () => Promise<void>;
  updateUserName: (name: string) => Promise<void>;
  getAuthHeaders: () => Promise<Record<string, string>>;
  deleteAccount: () => Promise<void>;
  restore: () => Promise<void>;
};

const defaultProfile: AuthProfile = {name: '', phone: ''};

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  token: null,
  companyId: null,
  role: null,
  profile: defaultProfile,
  login: async () => {},
  logout: async () => {},
  updateUserName: async () => {},
  getAuthHeaders: async () => ({'Content-Type': 'application/json'}),
  deleteAccount: async () => {},
  restore: async () => {},
});

const K = {
  TOKEN: 'session_token',
  COMPANY: 'company_id',
  ROLE: 'role',
  PHONE: 'profile_phone',
};

export function AuthProvider({children}: PropsWithChildren) {
  const [state, setState] = useState<AuthState>({
    isLoggedIn: false,
    token: null,
    companyId: null,
    role: null,
    profile: defaultProfile,
  });

  const persist = useCallback(async (s: AuthState) => {
    if (s.token) {
      await EncryptedStorage.setItem(K.TOKEN, s.token);
    } else {
      await EncryptedStorage.removeItem(K.TOKEN);
    }

    if (s.companyId) {
      await EncryptedStorage.setItem(K.COMPANY, s.companyId);
    } else {
      await EncryptedStorage.removeItem(K.COMPANY);
    }

    if (s.role) {
      await EncryptedStorage.setItem(K.ROLE, String(s.role));
    } else {
      await EncryptedStorage.removeItem(K.ROLE);
    }

    await EncryptedStorage.setItem(K.PHONE, s.profile.phone ?? '');
    await EncryptedStorage.setItem('profile_name', s.profile.name ?? '');

    try {
      await AsyncStorage.multiRemove(['userPhone', 'userName']);
    } catch {}
  }, []);

  const restore = useCallback(async () => {
    try {
      const tokenInEncrypted = await EncryptedStorage.getItem(K.TOKEN);
      const sqliteSession = await getActiveSession();
      const finalToken =
        tokenInEncrypted ?? (sqliteSession ? await getAccessToken() : null);

      const [companyId, role, phone, name] = await Promise.all([
        EncryptedStorage.getItem(K.COMPANY),
        EncryptedStorage.getItem(K.ROLE),
        EncryptedStorage.getItem(K.PHONE),
        EncryptedStorage.getItem('profile_name'),
      ]);

      setState({
        isLoggedIn: !!finalToken || !!sqliteSession,
        token: finalToken ?? null,
        companyId: companyId ?? null,
        role: (role as Role) ?? null,
        profile: {name: name ?? '', phone: phone ?? '-'},
      });
    } catch {
      setState(s => ({...s, isLoggedIn: false, token: null}));
    }
  }, []);
  useEffect(() => {
    restore();
  }, [restore]);

  const login = useCallback(
    async (a: any, b?: any) => {
      let next: AuthState;
      if (typeof a === 'object') {
        const obj = a as LoginObject;
        const name = obj.profile?.name ?? '';
        const phone = obj.profile?.phone ?? state.profile.phone ?? '';

        next = {
          isLoggedIn: true,
          token: obj.token,
          companyId: obj.companyId ?? null,
          role: obj.role ?? null,
          profile: {name, phone},
        };
      } else {
        const name = String(a ?? '');
        const phone = String(b ?? '');
        next = {
          isLoggedIn: true,
          token: state.token,
          companyId: state.companyId,
          role: state.role,
          profile: {name, phone},
        };
      }

      setState(next);
      await persist(next);
      if (next.token) {
        await saveSession({
          userId: next.companyId ?? next.profile.phone ?? 'unknown',
          accessToken: next.token,
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
          deviceId: 'rn-device',
        });
      }
    },
    [persist, state],
  );

  const logout = useCallback(async () => {
    await clearSession();
    setState({
      isLoggedIn: false,
      token: null,
      companyId: null,
      role: null,
      profile: defaultProfile,
    });
    await Promise.all([
      EncryptedStorage.removeItem(K.TOKEN),
      EncryptedStorage.removeItem(K.COMPANY),
      EncryptedStorage.removeItem(K.ROLE),
      EncryptedStorage.removeItem(K.PHONE),
      EncryptedStorage.removeItem('profile_name'),
    ]);
  }, []);

  const getAuthHeaders = useCallback(async () => {
    const token = state.token ?? (await getAccessToken());
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }, [state.token]);

  const updateUserName = useCallback(
    async (name: string) => {
      if (!state.profile.phone) {
        throw new Error('Nomor telepon tidak tersedia');
      }
      try {
        console.log('Updating user name to:', name);
        const res = await fetch(`${API_BASE}/me`, {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({name, phone: state.profile.phone}),
        });
        const raw = await res.text();
        let json: any = {};
        try {
          json = raw ? JSON.parse(raw) : {};
        } catch {}

        if (!res.ok) {
          throw new Error(
            json?.error || json?.message || `Server error ${res.status}`,
          );
        }

        await editUsername(name, state.profile.phone);
        await EncryptedStorage.setItem('profile_name', name);
        setState(s => ({...s, profile: {...s.profile, name}}));
        console.log('Username updated');
      } catch (err) {
        console.error('Failed to update user name:', err);
        throw err;
      }
    },
    [state.profile.phone],
  );

  const deleteAccount = useCallback(async () => {
    if (!state.profile.phone) {
      throw new Error('Nomor telepon tidak tersedia');
    }

    try {
      console.log('Starting account deletion for:', state.profile.phone);

      const res = await fetch(
        `${API_BASE}/delete?user_phone=${encodeURIComponent(
          state.profile.phone,
        )}`,
        {method: 'DELETE', headers: {'Content-Type': 'application/json'}},
      );

      const raw = await res.text();
      let json: any = {};
      try {
        json = raw ? JSON.parse(raw) : {};
      } catch {}

      if (!res.ok) {
        throw new Error(
          json?.error || json?.message || `Server error ${res.status}`,
        );
      }

      console.log('User deleted from server:', json);

      try {
        await deleteUser(state.profile.phone);
        console.log('Local user deleted from SQLite');
      } catch (e) {
        console.warn('Skip local delete:', e);
      }

      await logout();
      console.log('Account deletion completed and logged out');
    } catch (err) {
      console.error('Failed to delete account:', err);
      throw err;
    }
  }, [state.profile.phone, logout]);

  const value = useMemo<AuthContextType>(
    () => ({
      isLoggedIn: state.isLoggedIn,
      token: state.token,
      companyId: state.companyId,
      role: state.role,
      profile: state.profile,
      login,
      logout,
      updateUserName,
      getAuthHeaders,
      deleteAccount,
      restore,
    }),
    [
      state,
      login,
      logout,
      updateUserName,
      getAuthHeaders,
      deleteAccount,
      restore,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
