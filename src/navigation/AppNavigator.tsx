import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/Home/HomeScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import TransactionListScreen from '../screens/Wallet/TransactionListScreen';
import DocumentsScreen from '../screens/Documents/DocumentsScreen';
import AddScreen from '../screens/Add/AddScreen';
import MainLayout from '../components/MainLayout';
import BottomNav from '../components/BottomNav';
import {AppTabParamList} from '../types/navigation';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';

const Tab = createBottomTabNavigator<AppTabParamList>();

function renderTabBar(props: BottomTabBarProps) {
  return <BottomNav {...props} />;
}

const AppNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{headerShown: true}} tabBar={renderTabBar}>
      <Tab.Screen
        name="Home"
        children={() => (
          <MainLayout>
            <HomeScreen />
          </MainLayout>
        )}
      />
      <Tab.Screen
        name="Wallet"
        options={{title: 'Transaksi Keuangan'}}
        children={() => (
          <MainLayout>
            <TransactionListScreen />
          </MainLayout>
        )}
      />
      <Tab.Screen
        name="Add"
        options={{title: 'Tambah Transaksi'}}
        children={() => (
          <MainLayout>
            <AddScreen />
          </MainLayout>
        )}
      />
      <Tab.Screen
        name="Documents"
        options={{title: 'Pengelolaan Menu'}}
        children={() => (
          <MainLayout>
            <DocumentsScreen />
          </MainLayout>
        )}
      />
      <Tab.Screen
        name="Profile"
        children={() => (
          <MainLayout>
            <ProfileScreen />
          </MainLayout>
        )}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
