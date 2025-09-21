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

type LoginObject = {
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
  restore: async () => {},
});

const K = {
  TOKEN: 'session_token',
  COMPANY: 'company_id',
  ROLE: 'role',
  NAME: 'profile_name',
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
    if (s.token) await EncryptedStorage.setItem(K.TOKEN, s.token);
    else await EncryptedStorage.removeItem(K.TOKEN);

    if (s.companyId != null)
      await EncryptedStorage.setItem(K.COMPANY, s.companyId);
    else await EncryptedStorage.removeItem(K.COMPANY);

    if (s.role != null) await EncryptedStorage.setItem(K.ROLE, String(s.role));
    else await EncryptedStorage.removeItem(K.ROLE);

    await EncryptedStorage.setItem(K.NAME, s.profile.name ?? '');
    await EncryptedStorage.setItem(K.PHONE, s.profile.phone ?? '');

    // 🧹 kill legacy keys so old code can't write/read them
    try {
      await AsyncStorage.removeItem('userPhone');
      await AsyncStorage.removeItem('userName');
    } catch {}
  }, []);

  const restore = useCallback(async () => {
    try {
      const [token, companyId, role, name, phone] = await Promise.all([
        EncryptedStorage.getItem(K.TOKEN),
        EncryptedStorage.getItem(K.COMPANY),
        EncryptedStorage.getItem(K.ROLE),
        EncryptedStorage.getItem(K.NAME),
        EncryptedStorage.getItem(K.PHONE),
      ]);

      setState({
        isLoggedIn: !!token,
        token: token ?? null,
        companyId: companyId ?? null,
        role: (role as Role) ?? null,
        profile: {name: name ?? '', phone: phone ?? ''},
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
      if (typeof a === 'object') {
        const obj = a as LoginObject;
        const next: AuthState = {
          isLoggedIn: true,
          token: obj.token,
          companyId: obj.companyId ?? null,
          role: obj.role ?? null,
          profile: {
            name: obj.profile?.name ?? state.profile.name ?? '',
            phone: obj.profile?.phone ?? state.profile.phone ?? '',
          },
        };
        setState(next);
        await persist(next);
        return;
      }
      // back-compat: login(name, phone)
      const name = String(a ?? '');
      const phone = String(b ?? '');
      const next: AuthState = {
        isLoggedIn: true,
        token: state.token,
        companyId: state.companyId,
        role: state.role,
        profile: {name, phone},
      };
      setState(next);
      await persist(next);
    },
    [
      persist,
      state.companyId,
      state.role,
      state.token,
      state.profile.name,
      state.profile.phone,
    ],
  ) as AuthContextType['login'];

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
      EncryptedStorage.removeItem(K.NAME),
      EncryptedStorage.removeItem(K.PHONE),
      AsyncStorage.removeItem('userPhone'),
      AsyncStorage.removeItem('userName'),
    ]);
  }, []);

  const updateUserName = useCallback(async (name: string) => {
    setState(s => ({...s, profile: {...s.profile, name}}));
    await EncryptedStorage.setItem(K.NAME, name ?? '');
  }, []);

  const getAuthHeaders = useCallback(async (): Promise<
    Record<string, string>
  > => {
    const token = state.token ?? (await EncryptedStorage.getItem(K.TOKEN));
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }, [state.token]);

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
      restore,
    }),
    [state, login, logout, updateUserName, getAuthHeaders, restore],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
