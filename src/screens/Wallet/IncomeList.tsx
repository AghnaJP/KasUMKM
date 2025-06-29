import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import CustomText from '../../components/Text/CustomText';
import { getAllIncomes } from '../../database/Incomes/incomeQueries';
import { useIsFocused } from '@react-navigation/native';

const IncomeList = () => {
  const [incomes, setIncomes] = useState<any[]>([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      const fetchData = async () => {
        try {
          const result = await getAllIncomes();
          const data = result.rows
            ? Array.from({ length: result.rows.length }, (_, i) => result.rows.item(i))
            : result;
          setIncomes(data);
        } catch (e) {
          console.error('Gagal mengambil data pemasukan:', e);
        }
      };
      fetchData();
    }
  }, [isFocused]);

  return (
    <View>
      <CustomText variant="title" style={styles.title}>
        Daftar Pemasukan
      </CustomText>
      <FlatList
        data={incomes}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text>Menu ID: {item.menu_id}</Text>
            <Text>Jumlah: {item.quantity}</Text>
            <Text>Tanggal: {item.created_at}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>Tidak ada pemasukan</Text>}
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
});

export default IncomeList;
