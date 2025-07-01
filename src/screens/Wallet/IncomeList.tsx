import React, { useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { IncomeListService, IncomeData } from '../../database/Incomes/incomeDBList';
import TransactionList from '../../components/TransactionList/TransactionList';

interface Props {
  selectedMonth: string;
  selectedYear: string;
  selectedIds: number[];
  onToggleCheckbox: (id: number) => void;
  refreshKey: number;
  onDataLoaded: (data: IncomeData[]) => void;
}

const IncomeList = ({
  selectedMonth,
  selectedYear,
  selectedIds,
  onToggleCheckbox,
  refreshKey,
  onDataLoaded,
}: Props) => {
  const [incomes, setIncomes] = useState<IncomeData[]>([]);
  const isFocused = useIsFocused();

  const monthToNumber = (month: string): string => {
    const index = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ].indexOf(month);
    return (index + 1).toString().padStart(2, '0');
  };

  useEffect(() => {
    if (isFocused) {
      const fetchData = async () => {
        try {
          const result = await IncomeListService.getIncomeDetails();
          
          // --- PERBAIKAN DI SINI ---
          // 1. Logika filter diaktifkan kembali
          const filtered = result.filter((item: IncomeData) => {
            const date = new Date(item.date);
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear().toString();
            return (
              month === monthToNumber(selectedMonth) &&
              year === selectedYear
            );
          });

          // 2. Gunakan 'filtered' lagi, bukan 'result'
          setIncomes(filtered);
          onDataLoaded(filtered);
        } catch (e) {
          console.error('Gagal ambil data pemasukan:', e);
        }
      };
      fetchData();
    }
  }, [isFocused, selectedMonth, selectedYear, refreshKey]);

  const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);

  return (
    <TransactionList
      data={incomes}
      selectedIds={selectedIds}
      onToggleCheckbox={onToggleCheckbox}
      totalAmount={totalIncome}
      totalLabel="Total Pendapatan"
    />
  );
};

export default IncomeList;