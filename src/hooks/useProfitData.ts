import {useEffect, useState} from 'react';
import {useIsFocused} from '@react-navigation/native';
import {getDBConnection} from '../database/db'; // pastikan sudah ada
import {MenuItem, IncomeItem, ExpenseItem} from '../types/menu';

export const useProfitData = () => {
  const [menuList, setMenuList] = useState<MenuItem[]>([]);
  const [incomeList, setIncomeList] = useState<IncomeItem[]>([]);
  const [expenseList, setExpenseList] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    let isMounted = true;

    const fetchTable = async <T>(
      db: Awaited<ReturnType<typeof getDBConnection>>,
      table: string,
    ): Promise<T[]> => {
      const [result] = await db.executeSql(`SELECT * FROM ${table}`);
      const rows = result.rows;
      const data: T[] = [];

      for (let i = 0; i < rows.length; i++) {
        data.push(rows.item(i));
      }

      return data;
    };

    const fetchData = async () => {
      setLoading(true);

      try {
        const db = await getDBConnection();

        const [menus, incomes, expenses] = await Promise.all([
          fetchTable<MenuItem>(db, 'menus'),
          fetchTable<IncomeItem>(db, 'incomes'),
          fetchTable<ExpenseItem>(db, 'expenses'),
        ]);

        if (isMounted) {
          setMenuList(menus);
          setIncomeList(incomes);
          setExpenseList(expenses);
        }
      } catch (error) {
        console.error('SQLITE Fetch Error', error);
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
