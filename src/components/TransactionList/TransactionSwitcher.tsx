import React, {useState, useCallback, useEffect} from 'react';
import {View, StyleSheet, TouchableOpacity, Text} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import {Dropdown} from 'react-native-element-dropdown';
import CustomText from '../Text/CustomText';
import IncomeList from '../../screens/Wallet/IncomeList';
import ExpenseList from '../../screens/Wallet/ExpenseList';
import {IncomeData, ExpenseData} from '../../types/transaction';
import {MONTHS} from '../../constants/months';
import {getExpenseDetails} from '../../database/Expense/expenseQueries';
import {getIncomeDetails} from '../../database/Incomes/incomeQueries';

const getCurrentDateInfo = () => {
  const today = new Date();
  return {
    currentMonthName: MONTHS[today.getMonth()],
    currentYear: today.getFullYear(),
  };
};

const monthData = MONTHS.map(month => ({label: month, value: month}));

interface DropdownItem {
  label: string;
  value: string;
}

interface TransactionSwitcherProps {
  activeTab: 'income' | 'expense';
  onTabChange: (tab: 'income' | 'expense') => void;
  getDataFn: () => Promise<any[]>;
  onDataLoaded: (data: (IncomeData | ExpenseData)[]) => void;
  onEdit: (item: IncomeData | ExpenseData) => void;
  onDelete: (id: number) => void;
  refreshKey: number;
}

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
  const [selectedMonth, setSelectedMonth] = useState(currentMonthName);
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [yearData, setYearData] = useState<DropdownItem[]>([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    const generateYearList = async () => {
      if (!isFocused) {
        return;
      }

      try {
        const allIncomes = await getIncomeDetails();
        const allExpenses = await getExpenseDetails();
        const allTransactions = [...allIncomes, ...allExpenses];

        let startYear = currentYear;
        if (allTransactions.length > 0) {
          const firstYear = new Date(
            Math.min(...allTransactions.map(t => new Date(t.date).getTime())),
          ).getFullYear();
          startYear = firstYear;
        }

        const endYear = currentYear + 1;
        const years: DropdownItem[] = [];
        for (let i = startYear; i <= endYear; i++) {
          years.push({label: i.toString(), value: i.toString()});
        }
        setYearData(years);
      } catch {
        setYearData([
          {label: currentYear.toString(), value: currentYear.toString()},
          {
            label: (currentYear + 1).toString(),
            value: (currentYear + 1).toString(),
          },
        ]);
      }
    };

    generateYearList();
  }, [isFocused, currentYear]);

  const handleTabPress = useCallback(
    (tab: 'income' | 'expense') => {
      onTabChange(tab);
    },
    [onTabChange],
  );

  const handleMonthChange = useCallback((item: DropdownItem) => {
    setSelectedMonth(item.value);
  }, []);

  const handleYearChange = useCallback((item: DropdownItem) => {
    setSelectedYear(item.value);
  }, []);

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
            <Text>Pendapatan</Text>
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
            <Text>Pengeluaran</Text>
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

      <View style={styles.filterRow}>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          data={monthData}
          maxHeight={300}
          labelField="label"
          valueField="value"
          value={selectedMonth}
          onChange={handleMonthChange}
        />
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          data={yearData}
          maxHeight={300}
          labelField="label"
          valueField="value"
          value={selectedYear}
          onChange={handleYearChange}
        />
      </View>

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
    marginBottom: 12,
  },
  dropdown: {
    flex: 1,
    height: 40,
    borderColor: '#DDDDDD',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
  },
  placeholderStyle: {
    fontSize: 15,
    color: '#888',
  },
  selectedTextStyle: {
    fontSize: 15,
    color: '#0E3345',
  },
  listContainer: {
    flex: 1,
    paddingTop: 4,
  },
});

export default TransactionSwitcher;
