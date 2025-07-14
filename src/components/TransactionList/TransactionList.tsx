import React, {useCallback} from 'react';
import {View, FlatList, StyleSheet, Text} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import CustomText from '../Text/CustomText';
import {Transaction} from '../../types/transaction';

const formatRelativeDate = (inputDate: string): string => {
  if (!inputDate) return '';
  const date = new Date(inputDate);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  if (isSameDay(date, today)) return 'Hari ini';
  if (isSameDay(date, yesterday)) return 'Kemarin';

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

interface TransactionListProps {
  data: Transaction[];
  selectedIds: number[];
  onToggleCheckbox: (id: number) => void;
  totalAmount?: number;
  totalLabel?: string;
}

const TransactionList = ({
  data,
  selectedIds,
  onToggleCheckbox,
  totalAmount,
  totalLabel = 'Total',
}: TransactionListProps) => {
  const renderItem = useCallback(
    ({item}: {item: Transaction}) => {
      const isSelected = selectedIds.includes(item.id);
      const formattedAmount = (item.amount || 0).toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      });

      return (
        <View style={styles.itemContainer}>
          <CheckBox
            value={isSelected}
            onValueChange={() => onToggleCheckbox(item.id)}
            tintColors={{true: '#0E3345', false: '#ccc'}}
          />
          <View style={styles.textContainer}>
            <CustomText style={styles.title} numberOfLines={2}>
              {item.description}
            </CustomText>
            <CustomText style={styles.subtitle}>
              {formatRelativeDate(item.date)}
            </CustomText>
          </View>
          <CustomText style={styles.amount}>{formattedAmount}</CustomText>
        </View>
      );
    },
    [selectedIds, onToggleCheckbox],
  );

  const renderEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <CustomText style={styles.empty}>
          <Text>Tidak ada transaksi</Text>
        </CustomText>
      </View>
    ),
    [],
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyComponent}
        // --- TAMBAHKAN PROP INI ---
        scrollIndicatorInsets={{right: -8}}
      />
      {typeof totalAmount === 'number' && totalAmount > 0 && (
        <View style={styles.footerContainer}>
          <CustomText style={styles.footerText}>{totalLabel}</CustomText>
          <CustomText style={styles.footerAmount}>
            {totalAmount.toLocaleString('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
            })}
          </CustomText>
        </View>
      )}
    </View>
  );
};

// ... (Styles tidak berubah)
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 12,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
  },
  textContainer: {
    flex: 1,
    flexShrink: 1,
    marginLeft: 10,
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
    color: '#0E3345',
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
  },
  amount: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#0E3345',
    marginRight: 10,
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    textAlign: 'center',
    color: '#888',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 8,
    marginTop: 8,
    backgroundColor: '#fff',
  },

  footerText: {
    fontSize: 17,
    fontFamily: 'Montserrat-SemiBold',
    color: '#0E3345',
  },
  footerAmount: {
    fontSize: 17,
    fontFamily: 'Montserrat-Bold',
    color: '#0E3345',
  },
});

export default TransactionList;
