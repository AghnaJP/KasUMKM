import React from 'react';
import {StyleSheet, SafeAreaView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import MenuManagementCard from '../../components/Menu/MenuManagementCard';
import type {AppStackParamList} from '../../types/navigation'; // ganti sesuai file kamu

const DocumentsScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  return (
    <SafeAreaView style={styles.wrapper}>
      <MenuManagementCard
        onAddMenu={() => navigation.navigate('AddMenu')}
        onViewAllMenu={() => navigation.navigate('MenuList')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default DocumentsScreen;
