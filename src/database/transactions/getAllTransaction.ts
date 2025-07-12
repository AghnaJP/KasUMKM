import type {IncomeItem, ExpenseItem, MenuItem} from '../../types/menu';
import {TransactionData} from '../../types/transaction';
import {getAllIncomes} from '../Incomes/incomeQueries';
import {getAllExpenses} from '../Expense/expenseQueries';
import {getAllMenus} from '../menus/menuQueries';

export async function getAllTransactions(): Promise<TransactionData[]> {
  const incomes: IncomeItem[] = await getAllIncomes();
  const expenses: ExpenseItem[] = await getAllExpenses();
  const menus: MenuItem[] = await getAllMenus();

  const incomeTransactions: TransactionData[] = incomes.map(
    (item: IncomeItem) => {
      const menu: MenuItem | undefined = menus.find(
        (m: MenuItem) => m.id === item.menu_id,
      );
      return {
        id: item.id,
        name: menu?.name ?? 'Unknown Menu',
        amount: menu ? menu.price * item.quantity : 0,
        date: item.created_at,
        type: 'income',
      };
    },
  );

  const expenseTransactions: TransactionData[] = expenses.map(
    (item: ExpenseItem) => ({
      id: item.id,
      name: item.description,
      amount: item.price * item.quantity,
      date: item.created_at,
      type: 'expense',
    }),
  );

  return [...incomeTransactions, ...expenseTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}
