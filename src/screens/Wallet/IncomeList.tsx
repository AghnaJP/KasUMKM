import React from 'react';
import TransactionList from '../../components/TransactionList/TransactionList';
import {useTransactionList} from '../../hooks/useTransactionList';
import type {IncomeData as UIncomeData} from '../../database/transactions/unifiedForWallet';
import {ID} from '../../types/menu';

interface Props {
  selectedMonth: string;
  selectedYear: number;
  getDataFn: () => Promise<UIncomeData[]>;
  onDataLoaded: (data: UIncomeData[]) => void;
  onEdit: (item: UIncomeData) => void;
  onDelete: (id: ID) => void;
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

  const normalized = incomes.map(it => ({
    ...it,
    amount: (it as any).amount ?? Number(it.price) * Number(it.quantity ?? 1),
  }));

  const totalIncome = normalized.reduce((sum, item) => sum + item.amount, 0);

  return (
    <TransactionList
      data={normalized}
      totalAmount={totalIncome}
      totalLabel="Total Pendapatan: "
      onEdit={onEdit as unknown as (item: any) => void}
      onDelete={onDelete}
      refreshKey={refreshKey}
    />
  );
};

export default IncomeList;
