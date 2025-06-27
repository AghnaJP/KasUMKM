import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AppNavigator from './AppNavigator';
import AddMenu from '../screens/Documents/AddMenu';
import MenuList from '../screens/Documents/MenuList';
import BackButton from '../components/Button/BackButton';
import {AppStackParamList} from '../types/navigation';

const Stack = createNativeStackNavigator<AppStackParamList>();
const renderBackButton = () => <BackButton />;

const AppStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="AppTabs"
      component={AppNavigator}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="AddMenu"
      component={AddMenu}
      options={{
        title: 'Tambah Menu',
        headerTitleAlign: 'center',
        headerLeft: renderBackButton,
      }}
    />
    <Stack.Screen
      name="MenuList"
      component={MenuList}
      options={{
        title: 'Semua Menu',
        headerTitleAlign: 'center',
        headerLeft: renderBackButton,
      }}
    />
  </Stack.Navigator>
);

export default AppStackNavigator;
