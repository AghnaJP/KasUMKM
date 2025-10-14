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
import {editUsername} from '../database/users/userQueries';
import {API_BASE} from '../constants/api';

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

    if (s.companyId != null) {
      await EncryptedStorage.setItem(K.COMPANY, s.companyId);
    } else {
      await EncryptedStorage.removeItem(K.COMPANY);
    }

    if (s.role != null) {
      await EncryptedStorage.setItem(K.ROLE, String(s.role));
    } else {
      await EncryptedStorage.removeItem(K.ROLE);
    }

    await EncryptedStorage.setItem(K.PHONE, s.profile.phone ?? '');
    await EncryptedStorage.setItem('profile_name', s.profile.name ?? '');

    // 🧹 kill legacy keys so old code can't write/read them
    try {
      await AsyncStorage.removeItem('userPhone');
      await AsyncStorage.removeItem('userName');
    } catch {}
  }, []);

  const restore = useCallback(async () => {
    try {
      const [token, companyId, role, phone, name] = await Promise.all([
        EncryptedStorage.getItem(K.TOKEN),
        EncryptedStorage.getItem(K.COMPANY),
        EncryptedStorage.getItem(K.ROLE),
        EncryptedStorage.getItem(K.PHONE),
        EncryptedStorage.getItem('profile_name'),
      ]);

      setState({
        isLoggedIn: !!token,
        token: token ?? null,
        companyId: companyId ?? null,
        role: (role as Role) ?? null,
        profile: {
          name: name ?? '',
          phone: phone ?? '-',
        },
      });

      try {
        await AsyncStorage.removeItem('userPhone');
        await AsyncStorage.removeItem('userName');
      } catch {}
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
        let userName = obj.profile?.name ?? '';
        let phone = obj.profile?.phone ?? state.profile.phone ?? '';

        next = {
          isLoggedIn: true,
          token: obj.token,
          companyId: obj.companyId ?? null,
          role: obj.role ?? null,
          profile: {name: userName ?? '', phone},
        };
      } else {
        // back-compat: login(name, phone)
        const name = String(a ?? '');
        const phone = String(b ?? '');

        next = {
          isLoggedIn: true,
          token: state.token,
          companyId: state.companyId,
          role: state.role,
          profile: {name: name ?? '', phone},
        };
      }

      setState(next);
      await persist(next);
    },
    [persist, state.companyId, state.role, state.token, state.profile.phone],
  );

  const logout = useCallback(async () => {
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
      AsyncStorage.removeItem('userPhone'),
      AsyncStorage.removeItem('userName'),
    ]);
  }, []);

  const getAuthHeaders = useCallback(async (): Promise<
    Record<string, string>
  > => {
    const token = state.token ?? (await EncryptedStorage.getItem(K.TOKEN));
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
        console.log('📝 Updating user name to:', name);

        // 1. Update di server dulu
        console.log('📝 Updating name on server...');
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE}/me`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({name}),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Server update failed: ${response.status}`,
          );
        }

        const serverResult = await response.json();
        console.log('Server update successful:', serverResult);

        // 2. Update di SQLite lokal
        console.log('📝 Updating name in SQLite...');
        await editUsername(name, state.profile.phone);
        console.log('SQLite update successful');

        // 3. Update local state
        setState(s => ({...s, profile: {...s.profile, name}}));

        // 4. Update encrypted storage
        await EncryptedStorage.setItem('profile_name', name);

        console.log('User name update completed');
      } catch (error) {
        console.error('Failed to update user name:', error);
        throw error;
      }
    },
    [state.profile.phone, getAuthHeaders],
  );

  const deleteAccount = useCallback(async () => {
    if (!state.profile.phone) {
      throw new Error('Nomor telepon tidak tersedia');
    }

    try {
      console.log(
        'Starting account deletion for user:',
        state.profile.phone,
      );

      // 1. HAPUS DARI SERVER DULU
      console.log('Deleting from server...');
      const headers = await getAuthHeaders();

      const response = await fetch(
        `${API_BASE}/delete?user_phone=${state.profile.phone}`,
        {
          method: 'DELETE',
          headers,
        },
      );

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        // Get detailed error info
        let errorData;
        try {
          errorData = await response.json();
          console.log('Error response body:', errorData);
        } catch {
          errorData = {};
          console.log('Could not parse error response as JSON');
        }

        // Get response text for debugging
        const responseText = await response
          .text()
          .catch(() => 'Unable to read response text');
        console.log('Response text:', responseText);

        throw new Error(
          errorData.error || `HTTP ${response.status}: ${responseText}`,
        );
      }

      console.log('User deleted from server');
      console.log('Auto logout after account deletion...');
      await logout();

      console.log('Account deletion completed - user logged out');
    } catch (error) {
      console.error('Failed to delete account:', error);
      throw error;
    }
  }, [state.profile.phone, getAuthHeaders, logout]);

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
