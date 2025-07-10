import React from 'react';
import {View, StyleSheet} from 'react-native';
import CustomText from '../../components/Text/CustomText';

const TransactionReport = () => {
  return (
    <View style={styles.container}>
      <CustomText variant="title">Laporan Keuangan</CustomText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
});

export default TransactionReport;
