// src/components/TransactionItem.tsx

import React from 'react';
import {View, StyleSheet} from 'react-native';
import CustomText from '../Text/CustomText';

interface Props {
  name: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
}

const TransactionItem: React.FC<Props> = ({name, date, amount, type}) => {
  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <CustomText variant="body" numberOfLines={1}>
          {name}
        </CustomText>
        <CustomText variant="caption" color="#888" numberOfLines={1}>
          {date}
        </CustomText>
      </View>
      {/* TO-DO : FIX ESLINT */}
      <CustomText
        variant="body"
        style={[styles.amount, {color: type === 'income' ? 'green' : 'red'}]}>
        {type === 'income' ? '+' : '-'}Rp{' '}
        {Math.abs(amount).toLocaleString('id-ID')}.00
      </CustomText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  info: {
    flex: 1,
  },
  amount: {
    fontWeight: '600',
  },
});

export default TransactionItem;
