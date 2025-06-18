import React from 'react';
import OnboardingScreen from '../screens/Auth/OnboardingScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import {AuthStackParamList} from '../types/navigation';
import {createStackNavigator} from '@react-navigation/stack';
import BackButton from '../components/Button/BackButton';

const Stack = createStackNavigator<AuthStackParamList>();
const renderBackButton = () => <BackButton />;

const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{headerShown: true}}>
    <Stack.Screen
      name="Onboarding"
      component={OnboardingScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="Register"
      component={RegisterScreen}
      options={{
        title: 'Sign Up',
        headerTitleAlign: 'center',
        headerLeft: renderBackButton,
      }}
    />
    <Stack.Screen
      name="Login"
      component={LoginScreen}
      options={{
        title: 'Login',
        headerTitleAlign: 'center',
        headerLeft: renderBackButton,
      }}
    />
  </Stack.Navigator>
);

export default AuthNavigator;
