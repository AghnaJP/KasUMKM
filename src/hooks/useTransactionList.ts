import {useEffect, useState, useCallback} from 'react';
import {useIsFocused} from '@react-navigation/native';
import {MONTHS} from '../constants/months';

const monthToNumber = (month: string): string => {
  const index = MONTHS.indexOf(month);
  return (index + 1).toString().padStart(2, '0');
};

export function useTransactionList<T>(
  getDataFn: () => Promise<T[]>,
  selectedMonth: string,
  selectedYear: string,
  onDataLoaded: (data: T[]) => void,
  refreshKey?: number,
) {
  const [data, setData] = useState<T[]>([]);
  const isFocused = useIsFocused();

  const fetchData = useCallback(async () => {
    try {
      const result = await getDataFn();
      const filtered = result.filter((item: any) => {
        const date = new Date(item.date);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString();
        return month === monthToNumber(selectedMonth) && year === selectedYear;
      });

      setData(filtered);
      onDataLoaded(filtered);
    } catch (e) {
      console.error('Gagal ambil data transaksi:', e);
    }
  }, [getDataFn, selectedMonth, selectedYear, onDataLoaded]);

  useEffect(() => {
    if (isFocused) {
      fetchData();
    }
  }, [isFocused, fetchData, refreshKey]);

  return data;
}
