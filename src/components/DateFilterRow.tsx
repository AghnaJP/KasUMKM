import React, {useCallback, useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import {MONTHS} from '../constants/months';

interface MonthDropdownItem {
  label: string;
  value: string;
}

interface YearDropdownItem {
  label: string;
  value: number;
}

interface DateFilterRowProps {
  selectedMonth?: string;
  selectedYear?: number;
  onMonthChange?: (month: string) => void;
  onYearChange?: (year: number) => void;
  showMonth?: boolean;
  showYear?: boolean;
  yearData?: YearDropdownItem[];
}

const DateFilterRow: React.FC<DateFilterRowProps> = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  showMonth = true,
  showYear = true,
  yearData = [],
}) => {
  const today = new Date();
  const currentMonth = MONTHS[today.getMonth()];
  const currentYear = today.getFullYear();

  const monthData = useMemo<MonthDropdownItem[]>(
    () => MONTHS.map(m => ({label: m, value: m})),
    [],
  );

  const years = useMemo(() => {
    if (yearData.length > 0) {
      return yearData;
    }

    const startYear = currentYear - 2;
    const endYear = currentYear + 2;
    return Array.from({length: endYear - startYear + 1}, (_, i) => ({
      label: (startYear + i).toString(),
      value: startYear + i,
    }));
  }, [yearData, currentYear]);

  const month = selectedMonth || currentMonth;
  const year = selectedYear || currentYear;

  const handleMonthChange = useCallback(
    (item: MonthDropdownItem) => {
      onMonthChange?.(item.value);
    },
    [onMonthChange],
  );

  const handleYearChange = useCallback(
    (item: YearDropdownItem) => {
      onYearChange?.(item.value);
    },
    [onYearChange],
  );

  return (
    <View style={styles.container}>
      {showMonth && (
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          data={monthData}
          maxHeight={300}
          labelField="label"
          valueField="value"
          value={month}
          onChange={handleMonthChange}
        />
      )}

      {showYear && (
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          data={years}
          maxHeight={300}
          labelField="label"
          valueField="value"
          value={year}
          onChange={handleYearChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
});

export default React.memo(DateFilterRow);
