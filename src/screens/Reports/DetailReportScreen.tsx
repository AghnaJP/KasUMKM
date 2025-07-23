import React from 'react';
import {ScrollView, View, StyleSheet} from 'react-native';
import {useRoute} from '@react-navigation/native';
import CustomText from '../../components/Text/CustomText';
import Button from '../../components/Button/Button';

const parse = (val: any) => Number(String(val).replace(/\D/g, ''));

const DetailReport = () => {
  const route = useRoute();
  const {month, year, incomeList, expenseList} = route.params as any;

  const getTotalIncome = () =>
    incomeList.reduce(
      (acc: number, item: any) => acc + parse(item.qty) * parse(item.price),
      0,
    );

  const getTotalExpense = () =>
    expenseList.reduce(
      (acc: number, item: any) => acc + parse(item.qty) * parse(item.price),
      0,
    );

  const incomeTotal = getTotalIncome();
  const expenseTotal = getTotalExpense();
  const netIncome = incomeTotal - expenseTotal;

  return (
    <ScrollView style={styles.container}>
      <CustomText variant="title">
        Detail Laporan - {month} {year}
      </CustomText>

      <CustomText variant="subtitle" style={styles.sectionTitle}>
        Pemasukan
      </CustomText>
      {incomeList.map((item: any, index: number) => (
        <View key={index} style={styles.row}>
          <CustomText>{item.date}</CustomText>
          <CustomText>{item.product}</CustomText>
          <CustomText>{parse(item.qty)}</CustomText>
          <CustomText>
            Rp {(parse(item.qty) * parse(item.price)).toLocaleString('id-ID')}
          </CustomText>
        </View>
      ))}

      <View style={styles.divider} />

      <CustomText variant="subtitle">Pengeluaran</CustomText>
      {expenseList.map((item: any, index: number) => (
        <View key={index} style={styles.row}>
          <CustomText>{item.date}</CustomText>
          <CustomText>{item.item}</CustomText>
          <CustomText>{parse(item.qty)}</CustomText>
          <CustomText>
            Rp {(parse(item.qty) * parse(item.price)).toLocaleString('id-ID')}
          </CustomText>
        </View>
      ))}

      <View style={styles.divider} />

      <CustomText variant="subtitle">Total Pendapatan Bersih:</CustomText>
      <CustomText>
        Rp {incomeTotal.toLocaleString('id-ID')} - Rp{' '}
        {expenseTotal.toLocaleString('id-ID')} = Rp{' '}
        {netIncome.toLocaleString('id-ID')}
      </CustomText>

      <Button
        title="UNDUH PDF (disabled for now)"
        onPress={() => {}}
        customStyle={styles.button}
      />
    </ScrollView>
  );
};

export default DetailReport;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  sectionTitle: {
    marginTop: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  divider: {
    borderBottomWidth: 1,
    marginVertical: 12,
  },
  button: {
    marginTop: 24,
  },
});
