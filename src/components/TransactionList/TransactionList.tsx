import React from 'react';
import {View, FlatList, StyleSheet} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import CustomText from '../Text/CustomText';

export interface TransactionItem {
  id: number;
  description: string;
  amount: number;
  date: string;
}

interface TransactionListProps {
  title?: string;
  data: TransactionItem[];
  selectedIds: number[];
  onToggleCheckbox: (id: number) => void;
  totalAmount?: number;
  totalLabel?: string;
}

const TransactionList = ({ data, selectedIds, onToggleCheckbox, totalAmount, totalLabel = "Total" }: TransactionListProps) => {

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

    // PERUBAHAN DI SINI: Tampilkan tanggal, bulan, dan tahun lengkap
    return new Date(inputDate).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };
  
  const renderFooter = () => {
    if (!data || data.length === 0 || totalAmount === undefined) {
      return null;
    }

    return (
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
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        style={styles.list}
        renderItem={({item}) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <View style={styles.itemContainer}>
              <CheckBox
                value={isSelected}
                onValueChange={() => onToggleCheckbox(item.id)}
                tintColors={{true: '#0E3345', false: '#ccc'}}
              />
              <View style={styles.textContainer}>
                <CustomText style={styles.title}>{item.description}</CustomText>
                <CustomText style={styles.subtitle}>
                  {formatRelativeDate(item.date)}
                </CustomText>
              </View>
              <CustomText style={styles.amount}>
                {item.amount.toLocaleString('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                })}
              </CustomText>
            </View>
          );
        }}
        ListEmptyComponent={
          <CustomText style={styles.empty}>Tidak ada transaksi</CustomText>
        }
        ListFooterComponent={renderFooter}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  list: {
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
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
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
  empty: {
    textAlign: 'center',
    marginTop: 16,
    color: '#888',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    marginTop: 8,
    borderColor: '#EEEEEE',
  },
  footerText: {
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
    color: '#0E3345',
  },
  footerAmount: {
    fontSize: 15,
    fontFamily: 'Montserrat-Bold',
    color: '#0E3345',
  },
});

export default TransactionList;