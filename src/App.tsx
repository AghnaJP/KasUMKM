import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import RootNavigator from './navigation/RootNavigator';
import Toast from 'react-native-toast-message';
import {initAllTables} from './database/initDB';
import AuthProvider from './context/AuthProvider';
import {configureNotifications} from './utils/notification';

const App = (): React.JSX.Element => {
  useEffect(() => {
    const setupApp = async () => {
      try {
        await initAllTables();
        console.log('User table initialized');
      } catch (error) {
        console.error('App setup failed', error);
      }
    };

    setupApp();
    configureNotifications();
  }, []);

  return (
    <AuthProvider>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <RootNavigator />
      <Toast />
    </AuthProvider>
  );
};

export default App;
