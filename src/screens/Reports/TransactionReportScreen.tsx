import React, {useEffect, useState} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import CustomText from '../../components/Text/CustomText';
import {getAllTransactions} from '../../database/transactions/transactionQueries';
import {groupByMonth} from '../../utils/transactionUtils';
import {TransactionData} from '../../types/transaction';
import {COLORS} from '../../constants';
import {Picker} from '@react-native-picker/picker';
import Button from '../../components/Button/Button';
import {useDetailNavigation} from '../../hooks/useDetailNavigation'; // ✅ ADD THIS

const TransactionReport = () => {
  const currentYear = new Date().getFullYear();
  const [monthlyData, setMonthlyData] = useState<
    {month: string; income: number; expense: number; year: number}[]
  >([]);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const {handlePressDetail} = useDetailNavigation();

  useEffect(() => {
    const fetchData = async () => {
      const transactions: TransactionData[] = await getAllTransactions();
      const formattedData = groupByMonth(transactions);

      const years = Array.from(
        new Set(formattedData.map(item => item.year)),
      ).sort((a, b) => b - a);
      setAvailableYears(years);
      setMonthlyData(formattedData);
    };

    fetchData();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <CustomText variant="title">Laporan Keuangan</CustomText>

        <View style={styles.headerRow}>
          <View style={styles.yearPickerWrapper}>
            <Picker
              selectedValue={selectedYear}
              style={styles.yearPicker}
              onValueChange={(itemValue: number) => setSelectedYear(itemValue)}>
              {availableYears.map(year => (
                <Picker.Item key={year} label={String(year)} value={year} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.tableContainer}>
          <View style={[styles.row, styles.header]}>
            <View style={[styles.cell, styles.colBulan]}>
              <CustomText style={styles.headerText}>Bulan</CustomText>
            </View>
            <View style={[styles.cell, styles.colNominal]}>
              <CustomText style={styles.headerText}>Pendapatan</CustomText>
            </View>
            <View style={[styles.cell, styles.colNominal]}>
              <CustomText style={styles.headerText}>Pengeluaran</CustomText>
            </View>
            <View style={[styles.cell, styles.colAksi]}>
              <CustomText style={styles.headerText}>Aksi</CustomText>
            </View>
          </View>

          {monthlyData
            .filter(item => item.year === selectedYear)
            .map((item, index) => (
              <View
                key={index}
                style={[
                  styles.row,
                  {
                    backgroundColor:
                      index % 2 === 0 ? COLORS.veryLightGray : COLORS.white,
                  },
                ]}>
                <View style={[styles.cell, styles.colBulan]}>
                  <CustomText>{item.month}</CustomText>
                </View>
                <View style={[styles.cell, styles.colNominal]}>
                  <CustomText>{item.income.toLocaleString('id-ID')}</CustomText>
                </View>
                <View style={[styles.cell, styles.colNominal]}>
                  <CustomText>
                    {item.expense.toLocaleString('id-ID')}
                  </CustomText>
                </View>
                <View style={[styles.cell, styles.colAksi]}>
                  <Button
                    title="Detail"
                    customStyle={styles.detailButton}
                    onPress={() => handlePressDetail(item.month, item.year)}
                  />
                </View>
              </View>
            ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    backgroundColor: '#fff',
    flexGrow: 1,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  yearPickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
  },
  yearPicker: {
    height: 36,
    width: 120,
  },
  tableContainer: {
    marginTop: 16,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  header: {
    backgroundColor: '#cbe8f3',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  cell: {
    paddingHorizontal: 4,
  },
  colBulan: {
    flex: 1.2,
    justifyContent: 'flex-start',
  },
  colNominal: {
    flex: 1.5,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  colAksi: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  detailButton: {
    backgroundColor: '#0039a6',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
});

export default TransactionReport;
