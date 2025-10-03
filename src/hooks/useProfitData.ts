import {useEffect, useState} from 'react';
import {useIsFocused} from '@react-navigation/native';
import {
  getUnifiedIncomeDetails,
  getUnifiedExpenseDetails,
} from '../database/transactions/unifiedForWallet';

export const useProfitData = (refreshKey: number = 0) => {
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  useEffect(() => {
    let mounted = true;

    const fetchProfitData = async () => {
      try {
        setLoading(true);

        const [incomeData, expenseData] = await Promise.all([
          getUnifiedIncomeDetails(),
          getUnifiedExpenseDetails(),
        ]);

        const totalAllTimeIncome = incomeData.reduce(
          (sum, item) => sum + (item.amount || 0),
          0,
        );

        const totalAllTimeExpense = expenseData.reduce(
          (sum, item) => sum + (item.amount || 0),
          0,
        );

        if (mounted) {
          setTotalIncome(totalAllTimeIncome);
          setTotalExpense(totalAllTimeExpense);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch profit data:', error);
        if (mounted) {
          setTotalIncome(0);
          setTotalExpense(0);
          setLoading(false);
        }
      }
    };

    fetchProfitData();

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
