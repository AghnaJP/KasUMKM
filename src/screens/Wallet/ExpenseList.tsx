import React from 'react';
import TransactionList from '../../components/TransactionList/TransactionList';
import {useTransactionList} from '../../hooks/useTransactionList';
import {ExpenseData} from '../../types/transaction';

interface Props {
  selectedMonth: string;
  selectedYear: string;
  getDataFn: () => Promise<ExpenseData[]>;
  onDataLoaded: (data: ExpenseData[]) => void;
  onEdit: (item: ExpenseData) => void;
  onDelete: (id: number) => void;
  refreshKey: number;
}

const ExpenseList = ({
  selectedMonth,
  selectedYear,
  getDataFn,
  onDataLoaded,
  onEdit,
  onDelete,
  refreshKey,
}: Props) => {
  const expenses = useTransactionList(
    getDataFn,
    selectedMonth,
    selectedYear,
    onDataLoaded,
    refreshKey,
  );

  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <TransactionList
      data={expenses}
      totalAmount={totalExpense}
      totalLabel="Total Pengeluaran"
      onEdit={onEdit}
      onDelete={onDelete}
      refreshKey={refreshKey}
    />
  );
};

export default ExpenseList;
