import React from 'react';
import {
  ExpenseQueries,
  ExpenseData,
} from '../../database/Expense/expenseDBList';
import TransactionList from '../../components/TransactionList/TransactionList';
import {useTransactionList} from '../../hooks/useTransactionList';

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
  const expenses = useTransactionList<ExpenseData>(
    ExpenseQueries.getExpenseDetails,
    selectedMonth,
    selectedYear,
    refreshKey,
    onDataLoaded,
  );

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
