// File: src/screens/Wallet/ExpenseList.tsx

import React, { useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
// Ganti import ini ke service/query untuk pengeluaran
import { ExpenseQueries, ExpenseData } from '../../database/Expense/expenseDBList'; 
import TransactionList from '../../components/TransactionList/TransactionList';

// Ganti nama interface agar sesuai
interface Props {
  selectedMonth: string;
  selectedYear: string;
  selectedIds: number[];
  onToggleCheckbox: (id: number) => void;
  refreshKey: number;
  onDataLoaded: (data: ExpenseData[]) => void;
}

const ExpenseList = ({
  selectedMonth,
  selectedYear,
  selectedIds,
  onToggleCheckbox,
  refreshKey,
  onDataLoaded,
}: Props) => {
  // Ganti nama state agar sesuai
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
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
          // Ganti panggilan ini ke fungsi untuk mengambil data pengeluaran
          const result = await ExpenseQueries.getExpenseDetails();
          const filtered = result.filter((item: ExpenseData) => {
            const date = new Date(item.date);
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear().toString();
            return (
              month === monthToNumber(selectedMonth) &&
              year === selectedYear
            );
          });

          setExpenses(filtered);
          onDataLoaded(filtered);
        } catch (e) {
          console.error('Gagal ambil data pengeluaran:', e);
        }
      };
      fetchData();
    }
  }, [isFocused, selectedMonth, selectedYear, refreshKey]);
  
  // Hitung total pengeluaran
  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <TransactionList
      data={expenses}
      selectedIds={selectedIds}
      onToggleCheckbox={onToggleCheckbox}
      totalAmount={totalExpense}
      totalLabel="Total Pengeluaran" // Tambahkan label custom
    />
  );
};

export default ExpenseList;