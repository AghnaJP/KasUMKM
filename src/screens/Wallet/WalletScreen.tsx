import React from 'react';
import {ScrollView, StyleSheet, SafeAreaView} from 'react-native';
import CustomText from '../../components/Text/CustomText';

const WalletScreen = () => {
  return (
    <SafeAreaView style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <CustomText variant="title">Halo Ini Wallet Screen</CustomText>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});

export default WalletScreen;
