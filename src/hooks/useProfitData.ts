import {useEffect, useState} from 'react';
import {useIsFocused} from '@react-navigation/native';
import {MONTHS} from '../constants/months';
import {getMonthlyTotalsUnified} from '../database/transactions/transactionQueriesUnified';

export const useProfitData = (refreshKey: number = 0) => {
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const now = new Date();
      const monthName = MONTHS[now.getMonth()];
      const year = now.getFullYear();

      const t = await getMonthlyTotalsUnified(monthName, year);
      if (mounted) {
        setTotalIncome(t.income);
        setTotalExpense(t.expense);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isFocused, refreshKey]);

  return {
    loading,
    totalIncome,
    totalExpense,
    profit: totalIncome - totalExpense,
  };
};
