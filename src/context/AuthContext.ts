import {createContext} from 'react';

type AuthContextType = {
  isLoggedIn: boolean;
  userName: string;
  userPhone: string;
  login: (name: string, phone: string) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  userName: '',
  userPhone: '',
  login: () => {},
  logout: () => {},
});
