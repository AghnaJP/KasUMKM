import React from 'react';
import TransactionList from '../../components/TransactionList/TransactionList';
import {useTransactionList} from '../../hooks/useTransactionList';
import type {ExpenseData as UExpenseData} from '../../database/transactions/unifiedForWallet';
import {ID} from '../../types/menu';

interface Props {
  selectedMonth: string;
  selectedYear: number;
  getDataFn: () => Promise<UExpenseData[]>;
  onDataLoaded: (data: UExpenseData[]) => void;
  onEdit: (item: UExpenseData) => void;
  onDelete: (id: ID) => void;
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

  const normalized = expenses.map(it => ({
    ...it,
    amount: (it as any).amount ?? Number(it.price) * Number(it.quantity ?? 1),
  }));

  const totalExpense = normalized.reduce((sum, item) => sum + item.amount, 0);

  return (
    <TransactionList
      data={normalized}
      totalAmount={totalExpense}
      totalLabel="Total Pengeluaran: "
      onEdit={onEdit as unknown as (item: any) => void}
      onDelete={onDelete}
      refreshKey={refreshKey}
    />
  );
};

export default ExpenseList;
