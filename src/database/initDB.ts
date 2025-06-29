import {initUserTable} from './users/initUserTable';
import {initMenuTable} from './menus/initMenuTable';
import {initIncomeTable} from './Incomes/initIncomeTable';
import {initExpenseTable} from './Expense/initExpenseTable';

export const initAllTables = async () => {
  await initUserTable();
  await initMenuTable();
  await initIncomeTable();
  await initExpenseTable();
  console.log('All tables initialized');
};
