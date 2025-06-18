import React from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import AppNavigator from './navigation/AuthNavigator';

const App = (): React.JSX.Element => {
  return (
    <NavigationContainer>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <AppNavigator />
    </NavigationContainer>
  );
};

export default App;
