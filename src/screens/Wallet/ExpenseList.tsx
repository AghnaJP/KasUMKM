import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import CustomText from '../../components/Text/CustomText';
import { getAllExpenses } from '../../database/Expense/expenseQueries';
import { useIsFocused } from '@react-navigation/native';
import { ExpenseItem } from '../../types/menu';

const ExpenseList = () => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      const fetchData = async () => {
        try {
          const result = await getAllExpenses();
          const data = result.rows
            ? Array.from({ length: result.rows.length }, (_, i) => result.rows.item(i))
            : result;
          setExpenses(data);
        } catch (e) {
          console.error('Gagal mengambil data pengeluaran:', e);
        }
      };
      fetchData();
    }
  }, [isFocused]);

  return (
    <View>
      <CustomText variant="title" style={styles.title}>
        Daftar Pengeluaran
      </CustomText>
      <FlatList
        data={expenses}
        style={styles.list}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text>Deskripsi: {item.description}</Text>
            <Text>Jumlah: {item.quantity}</Text>
            <Text>Harga: {item.price}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>Tidak ada pengeluaran</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  title: {
    marginVertical: 12,
  },
  list: {
    maxHeight: 200,
    flexGrow: 1,
  },
});

export default ExpenseList;
