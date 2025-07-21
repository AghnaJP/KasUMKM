import {useEffect, useState} from 'react';
import {useIsFocused} from '@react-navigation/native';
import {MenuItem} from '../types/menu';
import {IncomeData, ExpenseData} from '../types/transaction';
import {IncomeListService} from '../database/Incomes/incomeDBList';
import {ExpenseQueries} from '../database/Expense/expenseDBList';

export const useProfitData = () => {
  const [menuList, _setMenuList] = useState<MenuItem[]>([]);
  const [incomeList, setIncomeList] = useState<IncomeData[]>([]);
  const [expenseList, setExpenseList] = useState<ExpenseData[]>([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [incomes, expenses] = await Promise.all([
          IncomeListService.getIncomeDetails(),
          ExpenseQueries.getExpenseDetails(),
        ]);

        if (isMounted) {
          setIncomeList(incomes);
          setExpenseList(expenses);
        }
      } catch (error) {
        console.error('Fetch error in useProfitData:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [isFocused]);

  return {menuList, incomeList, expenseList, loading};
};
