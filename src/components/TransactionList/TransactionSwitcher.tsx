import React, {useState, useCallback} from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import CustomText from '../Text/CustomText';
import IncomeList from '../../screens/Wallet/IncomeList';
import ExpenseList from '../../screens/Wallet/ExpenseList';
import DateFilterRow from '../DateFilterRow';
import {MONTHS} from '../../constants/months';
import type {
  IncomeData,
  ExpenseData,
} from '../../database/transactions/unifiedForWallet';

type AnyTx = IncomeData | ExpenseData;

interface TransactionSwitcherProps {
  activeTab: 'income' | 'expense';
  onTabChange: (tab: 'income' | 'expense') => void;
  getDataFn: () => Promise<AnyTx[]>;
  onDataLoaded: (data: AnyTx[]) => void;
  onEdit: (item: AnyTx) => void;
  onDelete: (id: number) => void;
  refreshKey: number;
}

const getCurrentDateInfo = () => {
  const today = new Date();
  return {
    currentMonthName: MONTHS[today.getMonth()],
    currentYear: today.getFullYear(),
  };
};

const TransactionSwitcher = ({
  activeTab,
  onTabChange,
  getDataFn,
  onDataLoaded,
  onEdit,
  onDelete,
  refreshKey,
}: TransactionSwitcherProps) => {
  const {currentMonthName, currentYear} = getCurrentDateInfo();
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthName);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const handleTabPress = useCallback(
    (tab: 'income' | 'expense') => {
      onTabChange(tab);
    },
    [onTabChange],
  );

  const listComponent =
    activeTab === 'income' ? (
      <IncomeList
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        getDataFn={getDataFn}
        onDataLoaded={onDataLoaded}
        onEdit={onEdit}
        onDelete={onDelete}
        refreshKey={refreshKey}
      />
    ) : (
      <ExpenseList
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        getDataFn={getDataFn}
        onDataLoaded={onDataLoaded}
        onEdit={onEdit}
        onDelete={onDelete}
        refreshKey={refreshKey}
      />
    );

  return (
    <View style={styles.card}>
      <View style={styles.tabRow}>
        <TouchableOpacity
          onPress={() => handleTabPress('income')}
          style={styles.tabButton}>
          <CustomText
            style={[
              styles.tabText,
              activeTab === 'income' && styles.activeTabText,
            ]}>
            Pendapatan
          </CustomText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleTabPress('expense')}
          style={styles.tabButton}>
          <CustomText
            style={[
              styles.tabText,
              activeTab === 'expense' && styles.activeTabText,
            ]}>
            Pengeluaran
          </CustomText>
        </TouchableOpacity>
      </View>

      <View style={styles.underlineTrack}>
        <View
          style={[
            styles.activeUnderline,
            activeTab === 'income'
              ? styles.leftUnderline
              : styles.rightUnderline,
          ]}
        />
      </View>

      <DateFilterRow
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
        showMonth
        showYear
      />

      <View style={styles.listContainer}>{listComponent}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    marginBottom: 16,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 6,
  },
  tabButton: {paddingBottom: 6, flex: 1},
  tabText: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#A0A0A0',
    textAlign: 'center',
  },
  activeTabText: {color: '#0E3345'},
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
  leftUnderline: {left: 0},
  rightUnderline: {right: 0},
  listContainer: {flex: 1, paddingTop: 4},
});

export default TransactionSwitcher;
