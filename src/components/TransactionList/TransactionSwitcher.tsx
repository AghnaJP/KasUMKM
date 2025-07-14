import React, {useState, useCallback, useEffect} from 'react';
import {View, StyleSheet, TouchableOpacity, Text} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import {Dropdown} from 'react-native-element-dropdown';
import CustomText from '../Text/CustomText';
import IncomeList from '../../screens/Wallet/IncomeList';
import ExpenseList from '../../screens/Wallet/ExpenseList';
import {IncomeListService} from '../../database/Incomes/incomeDBList';
import {ExpenseQueries} from '../../database/Expense/expenseDBList';
import {IncomeData, ExpenseData} from '../../types/transaction';

const getCurrentDateInfo = () => {
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  const today = new Date();
  const currentMonthName = months[today.getMonth()];
  const currentYear = today.getFullYear();
  return {currentMonthName, currentYear: currentYear};
};

const monthData = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
].map(month => ({label: month, value: month}));

interface DropdownItem {
  label: string;
  value: string;
}

interface TransactionSwitcherProps {
  activeTab: 'income' | 'expense';
  onTabChange: (tab: 'income' | 'expense') => void;
  selectedIds: number[];
  onToggleCheckbox: (id: number) => void;
  refreshKey: number;
  onDataLoaded: (data: (IncomeData | ExpenseData)[]) => void;
  transactions: (IncomeData | ExpenseData)[];
}

const TransactionSwitcher = ({
  activeTab,
  onTabChange,
  selectedIds,
  onToggleCheckbox,
  refreshKey,
  onDataLoaded,
  transactions,
}: TransactionSwitcherProps) => {
  const {currentMonthName, currentYear} = getCurrentDateInfo();
  const [selectedMonth, setSelectedMonth] = useState(currentMonthName);
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [yearData, setYearData] = useState<DropdownItem[]>([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    const loadAllData = async () => {
      try {
        const incomes = await IncomeListService.getIncomeDetails();
        const expenses = await ExpenseQueries.getExpenseDetails();
        const allData = [...incomes, ...expenses];
        onDataLoaded(allData);

        const validTimestamps = allData
          .map(t => new Date(t.date).getTime())
          .filter(t => !isNaN(t));

        let startYear = new Date().getFullYear();
        if (validTimestamps.length > 0) {
          startYear = new Date(Math.min(...validTimestamps)).getFullYear();
        }

        const endYear = new Date().getFullYear();
        const years = [];
        for (let i = startYear; i <= endYear; i++) {
          years.push({label: i.toString(), value: i.toString()});
        }
        setYearData(years);
      } catch (error) {
        console.error('Gagal memuat data:', error);
        const currentY = new Date().getFullYear().toString();
        setYearData([{label: currentY, value: currentY}]);
      }
    };
    loadAllData();
  }, [refreshKey, isFocused, onDataLoaded]);

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

  const monthMap: {[key: string]: number} = {
    Januari: 0,
    Februari: 1,
    Maret: 2,
    April: 3,
    Mei: 4,
    Juni: 5,
    Juli: 6,
    Agustus: 7,
    September: 8,
    Oktober: 9,
    November: 10,
    Desember: 11,
  };
  const monthIndex = monthMap[selectedMonth];
  const yearNumber = parseInt(selectedYear, 10);

  const filteredData = transactions.filter(item => {
    if (!item.date) return false;
    const itemDate = new Date(item.date);
    return (
      itemDate.getMonth() === monthIndex &&
      itemDate.getFullYear() === yearNumber
    );
  });

  const incomeData = filteredData.filter(t => 'menu_id' in t) as IncomeData[];
  const expenseData = filteredData.filter(
    t => !('menu_id' in t),
  ) as ExpenseData[];

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

      <View style={styles.listContainer}>
        {activeTab === 'income' ? (
          <IncomeList
            data={incomeData}
            selectedIds={selectedIds}
            onToggleCheckbox={onToggleCheckbox}
          />
        ) : (
          <ExpenseList
            data={expenseData}
            selectedIds={selectedIds}
            onToggleCheckbox={onToggleCheckbox}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1, // Penting agar bisa expand
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
    flex: 1, // Penting agar FlatList di dalamnya bisa scroll
    paddingTop: 4,
  },
});

export default TransactionSwitcher;
