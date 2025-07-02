import React, {useEffect, useState, useCallback} from 'react';
import {useIsFocused} from '@react-navigation/native';
import { ExpenseQueries, ExpenseData } from '../../database/Expense/expenseDBList';
import TransactionList from '../../components/TransactionList/TransactionList';

interface Props {
  selectedMonth: string;
  selectedYear: string;
  selectedIds: number[];
  onToggleCheckbox: (id: number) => void;
  refreshKey: number;
  onDataLoaded: (data: ExpenseData[]) => void;
}

const monthToNumber = (month: string): string => {
  const index = [
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
  ].indexOf(month);
  return (index + 1).toString().padStart(2, '0');
};

const ExpenseList = ({
  selectedMonth,
  selectedYear,
  selectedIds,
  onToggleCheckbox,
  refreshKey,
  onDataLoaded,
}: Props) => {
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const isFocused = useIsFocused();

  const fetchData = useCallback(async () => {
    try {
      const result = await ExpenseQueries.getExpenseDetails();
      const filtered = result.filter((item: ExpenseData) => {
        const date = new Date(item.date);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString();
        return month === monthToNumber(selectedMonth) && year === selectedYear;
      });

      setExpenses(filtered);
      onDataLoaded(filtered);
    } catch (e) {
      console.error('Gagal ambil data pengeluaran:', e);
    }
  }, [selectedMonth, selectedYear, onDataLoaded]);

  useEffect(() => {
    if (isFocused) {
      fetchData();
    }
  }, [isFocused, refreshKey, fetchData]);

  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <TransactionList
      data={expenses}
      selectedIds={selectedIds}
      onToggleCheckbox={onToggleCheckbox}
      totalAmount={totalExpense}
      totalLabel="Total Pengeluaran"
    />
  );
};

export default ExpenseList;
