import React, {useEffect, useState} from 'react';
import {StatusBar} from 'react-native';
import RootNavigator from './navigation/RootNavigator';
import {initUserTable} from './database/users/initUserTable';
import Toast from 'react-native-toast-message';
import {AuthContext} from './context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const App = (): React.JSX.Element => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const setupApp = async () => {
      try {
        await initUserTable();
        console.log('User table initialized');

        const isLogged = await AsyncStorage.getItem('isLoggedIn');
        if (isLogged === 'true') {
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('App setup failed', error);
      }
    };

    setupApp();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        login: () => setIsLoggedIn(true),
        logout: () => setIsLoggedIn(false),
      }}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <RootNavigator />
      <Toast />
    </AuthContext.Provider>
  );
};

export default App;
