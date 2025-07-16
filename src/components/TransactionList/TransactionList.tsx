import React, {useCallback, useRef} from 'react';
import {View, StyleSheet} from 'react-native';
import {SwipeListView} from 'react-native-swipe-list-view';
import CustomText from '../Text/CustomText';
import HiddenTransactionActions from './HiddenTransactionActions';
import {TransactionItem} from '../../types/transaction';

interface TransactionListProps {
  data: TransactionItem[];
  totalAmount?: number;
  totalLabel?: string;
  onEdit: (item: TransactionItem) => void;
  onDelete: (id: number) => void;
  refreshKey: number;
}

const formatRelativeDate = (inputDate: string): string => {
  const date = new Date(inputDate);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  if (isSameDay(date, today)) return 'Hari ini';
  if (isSameDay(date, yesterday)) return 'Kemarin';

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const TransactionList = ({
  data,
  totalAmount,
  totalLabel = 'Total',
  onEdit,
  onDelete,
}: TransactionListProps) => {
  const listRef = useRef<SwipeListView<any>>(null);

  const sortedData = [...data].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const handleEdit = useCallback(
    (item: TransactionItem) => {
      listRef.current?.closeAllOpenRows();
      onEdit(item);
    },
    [onEdit],
  );

  const renderItem = useCallback(({item}: {item: TransactionItem}) => {
    const formattedAmount = item.amount.toLocaleString('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    });

    return (
      <View style={styles.itemContainer}>
        <View style={styles.textContainer}>
          <CustomText style={styles.title}>{item.description}</CustomText>
          <CustomText style={styles.subtitle}>
            {formatRelativeDate(item.date)}
          </CustomText>
        </View>
        <CustomText style={styles.amount}>{formattedAmount}</CustomText>
      </View>
    );
  }, []);

  const renderHiddenItem = useCallback(
    ({item}: {item: TransactionItem}) => (
      <HiddenTransactionActions
        item={item}
        onEdit={handleEdit}
        onDelete={onDelete}
      />
    ),
    [handleEdit, onDelete],
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <CustomText style={styles.empty}>Tidak ada transaksi</CustomText>
    </View>
  );

  return (
    <View style={styles.container}>
      <SwipeListView
        ref={listRef}
        data={sortedData}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        renderHiddenItem={renderHiddenItem}
        rightOpenValue={-150}
        disableRightSwipe
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyComponent}
      />

      {typeof totalAmount === 'number' && data.length > 0 && (
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },
  textContainer: {
    flex: 1,
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
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderColor: '#EEEEEE',
    paddingHorizontal: 12,
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
