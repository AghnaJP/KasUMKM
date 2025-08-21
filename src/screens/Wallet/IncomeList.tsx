import React from 'react';
import TransactionList from '../../components/TransactionList/TransactionList';
import {useTransactionList} from '../../hooks/useTransactionList';
import {IncomeData} from '../../types/transaction';

interface Props {
  selectedMonth: string;
  selectedYear: string;
  getDataFn: () => Promise<IncomeData[]>;
  onDataLoaded: (data: IncomeData[]) => void;
  onEdit: (item: IncomeData) => void;
  onDelete: (id: number) => void;
  refreshKey: number;
}

const IncomeList = ({
  selectedMonth,
  selectedYear,
  getDataFn,
  onDataLoaded,
  onEdit,
  onDelete,
  refreshKey,
}: Props) => {
  const incomes = useTransactionList(
    getDataFn,
    selectedMonth,
    selectedYear,
    onDataLoaded,
    refreshKey,
  );

  const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);

  return (
    <TransactionList
      data={incomes}
      totalAmount={totalIncome}
      totalLabel="Total Pendapatan: "
      onEdit={onEdit as (item: any) => void}
      onDelete={onDelete}
      refreshKey={refreshKey}
    />
  );
};

export default IncomeList;
