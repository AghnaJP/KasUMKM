import React, {ReactNode, useEffect, useState} from 'react';
import {AuthContext} from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = {
  children: ReactNode;
};

const AuthProvider = ({children}: Props) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const logged = await AsyncStorage.getItem('isLoggedIn');
        const storedName = await AsyncStorage.getItem('userName');
        const storedPhone = await AsyncStorage.getItem('userPhone');

        if (logged === 'true' && storedName && storedPhone) {
          setIsLoggedIn(true);
          setUserName(storedName);
          setUserPhone(storedPhone);
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (name: string, phone: string) => {
    setIsLoggedIn(true);
    setUserName(name);
    setUserPhone(phone);

    await AsyncStorage.multiSet([
      ['isLoggedIn', 'true'],
      ['userName', name],
      ['userPhone', phone],
    ]);
  };

  const logout = async () => {
    setIsLoggedIn(false);
    setUserName('');
    setUserPhone('');
    await AsyncStorage.clear();
  };

  const updateUserName = async (name: string) => {
    setUserName(name);
    await AsyncStorage.setItem('userName', name);
  };

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{isLoggedIn, userName, userPhone, login, logout, updateUserName}}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
