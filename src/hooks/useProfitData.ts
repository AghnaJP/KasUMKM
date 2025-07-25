import {useEffect, useState} from 'react';
import {useIsFocused} from '@react-navigation/native';
import {MenuItem} from '../types/menu';
import {IncomeData, ExpenseData} from '../types/transaction';
import {getExpenseDetails} from '../database/Expense/expenseQueries';
import {getIncomeDetails} from '../database/Incomes/incomeQueries';

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
          getIncomeDetails(),
          getExpenseDetails(),
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
