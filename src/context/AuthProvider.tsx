import React, {ReactNode, useEffect, useState} from 'react';
import {AuthContext} from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getUserByPhone} from '../database/users/userQueries';

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
        const storedPhone = await AsyncStorage.getItem('userPhone');

        if (logged === 'true' && storedPhone) {
          const user = await getUserByPhone(storedPhone);
          if (user) {
            setIsLoggedIn(true);
            setUserName(user.name);
            setUserPhone(storedPhone);
          }
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
    const user = await getUserByPhone(phone);
    setIsLoggedIn(true);
    setUserName(user?.name || name);
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
