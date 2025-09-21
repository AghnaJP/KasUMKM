// src/hooks/useTransactionList.ts
import {useEffect, useState, useCallback} from 'react';
import {useIsFocused} from '@react-navigation/native';
import {MONTHS} from '../constants/months';

const monthToNumber = (month: string): string => {
  const index = MONTHS.indexOf(month);
  // fallback kalau tidak ditemukan -> bulan sekarang
  const idx = index >= 0 ? index : new Date().getMonth();
  return (idx + 1).toString().padStart(2, '0');
};

export function useTransactionList<T extends {date?: string | number | Date}>(
  getDataFn: () => Promise<T[]>, // fetcher tanpa argumen
  selectedMonth: string,
  selectedYear: number,
  onDataLoaded: (data: T[]) => void, // callback setelah data siap
  refreshKey?: number, // opsional trigger refresh eksternal
) {
  const [data, setData] = useState<T[]>([]);
  const isFocused = useIsFocused();

  const fetchData = useCallback(async () => {
    try {
      const result = await getDataFn();

      // SELALU guard agar array
      const arr: T[] = Array.isArray(result) ? result : [];

      // Filter aman: kalau item.date tidak valid, skip
      const mm = monthToNumber(selectedMonth);
      const filtered = arr.filter((item: any) => {
        if (!item || !item.date) return false;
        const d = new Date(item.date);
        if (isNaN(d.getTime())) return false;

        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        return month === mm && year === selectedYear;
      });

      setData(filtered);
      onDataLoaded(filtered);
    } catch (e) {
      console.error('Gagal ambil data transaksi:', e);
      // Pastikan state tetap array agar komponen pemanggil tidak error
      setData([]);
      onDataLoaded([]);
    }
  }, [getDataFn, selectedMonth, selectedYear, onDataLoaded]);

  useEffect(() => {
    if (isFocused) {
      fetchData();
    }
  }, [isFocused, fetchData, refreshKey]);

  return data;
}
