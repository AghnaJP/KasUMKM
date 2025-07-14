import React from 'react';
import TransactionList from '../../components/TransactionList/TransactionList';
import {ExpenseData} from '../../types/transaction';

interface Props {
  data: ExpenseData[];
  selectedIds: number[];
  onToggleCheckbox: (id: number) => void;
}

const ExpenseList = ({data, selectedIds, onToggleCheckbox}: Props) => {
  const totalExpense = data.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <TransactionList
      data={data}
      selectedIds={selectedIds}
      onToggleCheckbox={onToggleCheckbox}
      totalAmount={totalExpense}
      totalLabel="Total Pengeluaran"
    />
  );
};

export default ExpenseList;
