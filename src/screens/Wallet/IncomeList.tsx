import React from 'react';
import {
  IncomeListService,
  IncomeData,
} from '../../database/Incomes/incomeDBList';
import TransactionList from '../../components/TransactionList/TransactionList';
import {useTransactionList} from '../../hooks/useTransactionList';

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
  onDataLoaded,
}: Props) => {
  const incomes = useTransactionList<IncomeData>(
    IncomeListService.getIncomeDetails,
    selectedMonth,
    selectedYear,
    onDataLoaded,
  );

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
