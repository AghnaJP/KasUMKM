import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AppNavigator from './AppNavigator';
import AddMenu from '../screens/Menus/AddMenu';
import MenuList from '../screens/Menus/MenuList';
import EditProfile from '../screens/Profile/EditProfile';
import TransactionReport from '../screens/Reports/TransactionReportScreen';
import BackButton from '../components/Button/BackButton';
import {AppStackParamList} from '../types/navigation';
import DetailReport from '../screens/Reports/DetailReportScreen';

const Stack = createNativeStackNavigator<AppStackParamList>();
const renderBackButton = () => <BackButton />;

const AppStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      contentStyle: {backgroundColor: '#fff'},
    }}>
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
    <Stack.Screen
      name="EditProfile"
      component={EditProfile}
      options={{
        title: 'Akun Saya',
        headerTitleAlign: 'center',
        headerLeft: renderBackButton,
      }}
    />
    <Stack.Screen
      name="TransactionReport"
      component={TransactionReport}
      options={{
        title: 'Laporan Keuangan',
        headerTitleAlign: 'center',
        headerLeft: renderBackButton,
      }}
    />
    <Stack.Screen
      name="DetailReport"
      component={DetailReport}
      options={{
        title: 'Detail Laporan',
        headerTitleAlign: 'center',
        headerLeft: renderBackButton,
      }}
    />
  </Stack.Navigator>
);

export default AppStackNavigator;
