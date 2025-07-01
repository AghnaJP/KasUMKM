import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import CustomText from '../Text/CustomText';
import IncomeList from '../../screens/Wallet/IncomeList';
import ExpenseList from '../../screens/Wallet/ExpenseList';
import { IncomeData } from '../../database/Incomes/incomeDBList';
import { ExpenseData } from '../../database/Expense/expenseDBList'; 

const getCurrentDateInfo = () => {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const today = new Date();
  const currentMonthName = months[today.getMonth()];
  const currentYear = today.getFullYear().toString();
  return { currentMonthName, currentYear };
};

interface TransactionSwitcherProps {
  activeTab: 'income' | 'expense';
  onTabChange: (tab: 'income' | 'expense') => void;
  selectedIds: number[];
  onToggleCheckbox: (id: number) => void;
  refreshKey: number;
  onDataLoaded: (data: (IncomeData | ExpenseData)[]) => void;
}

const TransactionSwitcher = ({ activeTab, onTabChange, selectedIds, onToggleCheckbox, refreshKey, onDataLoaded }: TransactionSwitcherProps) => {
  const { currentMonthName, currentYear } = getCurrentDateInfo(); 
  const [selectedMonth, setSelectedMonth] = useState(currentMonthName);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  return (
    <View style={styles.card}>
      <View style={styles.tabRow}>
        <TouchableOpacity onPress={() => onTabChange('income')} style={styles.tabButton}>
          <CustomText style={[styles.tabText, activeTab === 'income' && styles.activeTabText]}>
            Pendapatan
          </CustomText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onTabChange('expense')} style={styles.tabButton}>
          <CustomText style={[styles.tabText, activeTab === 'expense' && styles.activeTabText]}>
            Pengeluaran
          </CustomText>
        </TouchableOpacity>
      </View>

      <View style={styles.underlineTrack}>
        <View
          style={[
            styles.activeUnderline,
            activeTab === 'income' ? styles.leftUnderline : styles.rightUnderline,
          ]}
        />
      </View>
      
      <View style={styles.filterRow}>
        <View style={styles.dropdownContainer}>
          <Picker
            selectedValue={selectedMonth}
            onValueChange={value => setSelectedMonth(value)}
            style={styles.picker}
            dropdownIconColor="#888888">
            {months.map(month => (
              <Picker.Item key={month} label={month} value={month} color="#0E3345" />
            ))}
          </Picker>
        </View>
        <View style={styles.dropdownContainer}>
          <Picker
            selectedValue={selectedYear}
            onValueChange={value => setSelectedYear(value)}
            style={styles.picker}
            dropdownIconColor="#888888">
            {['2024', '2025'].map(year => (
              <Picker.Item key={year} label={year} value={year} color="#0E3345" />
            ))}
          </Picker>
        </View>
      </View>
      
      <View style={styles.listContainer}>
        {activeTab === 'income' ? (
          <IncomeList
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            selectedIds={selectedIds}
            onToggleCheckbox={onToggleCheckbox}
            refreshKey={refreshKey}
            onDataLoaded={onDataLoaded}
          />
        ) : (
          <ExpenseList
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            selectedIds={selectedIds}
            onToggleCheckbox={onToggleCheckbox}
            refreshKey={refreshKey}
            onDataLoaded={onDataLoaded}
          />
        )}
      </View>
    </View>
  );
};

const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 6,
  },
  tabButton: {
    paddingBottom: 6,
    flex: 1,
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#A0A0A0',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#0E3345',
  },
  underlineTrack: {
    height: 2,
    backgroundColor: '#EEEEEE',
    width: '100%',
    marginBottom: 10,
    position: 'relative',
  },
  activeUnderline: {
    position: 'absolute',
    height: 2,
    width: '50%',
    backgroundColor: '#375A93',
    bottom: 0,
  },
  leftUnderline: {
    left: 0,
  },
  rightUnderline: {
    right: 0,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  dropdownContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
  },
  picker: {
    color: '#0E3345',
  },
  listContainer: {
    paddingTop: 4,
  },
});

export default TransactionSwitcher;