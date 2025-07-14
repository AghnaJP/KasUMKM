import React from 'react';
import TransactionList from '../../components/TransactionList/TransactionList';
import {IncomeData} from '../../types/transaction';

interface Props {
  data: IncomeData[];
  selectedIds: number[];
  onToggleCheckbox: (id: number) => void;
}

const IncomeList = ({data, selectedIds, onToggleCheckbox}: Props) => {
  const totalIncome = data.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <TransactionList
      data={data}
      selectedIds={selectedIds}
      onToggleCheckbox={onToggleCheckbox}
      totalAmount={totalIncome}
      totalLabel="Total Pendapatan"
    />
  );
};

export default IncomeList;
