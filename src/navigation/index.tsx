import React from 'react';
// import {NavigationContainer} from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
// import AppNavigator from './AppNavigator';

// TODO: Ganti dengan logic autentikasi real
// const isLoggedIn = false;

const RootNavigation = () => {
  return (
    <AuthNavigator />
    // <NavigationContainer>
    //   {isLoggedIn ? <AppNavigator /> : <AuthNavigator />}
    // </NavigationContainer>
  );
};

export default RootNavigation;
