import React from 'react';
import { ScrollView, StyleSheet, SafeAreaView, View } from 'react-native';
import IncomeList from '../../screens/Wallet/IncomeList';
import ExpenseList from '../../screens/Wallet/ExpenseList';

const WalletScreen = () => {
  return (
    <SafeAreaView style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.fullWidth}>
          <IncomeList />
          <View style={styles.divider} />
          <ExpenseList />
        </View>
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 24,
    width: '100%',
  },
  fullWidth: {
    width: '100%',
  },
  divider: {
    height: 24,
  },
});

export default WalletScreen;
