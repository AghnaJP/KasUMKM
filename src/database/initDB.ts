import {initUserTable} from './users/initUserTable';
import {initMenuTable} from './menus/initMenuTable';
import {initIncomeTable} from './Incomes/initIncomeTable';
import {initExpenseTable} from './Expense/initExpenseTable';
import {migrateCreateTransactionsTable} from './migrations/001_transaction_table';
import {migrateCreateMenuTable} from './migrations/002_menu_table';

export const initAllTables = async () => {
  await initUserTable();
  await initMenuTable();
  await initIncomeTable();
  await initExpenseTable();
  await migrateCreateTransactionsTable();
  await migrateCreateMenuTable();
  console.log('All tables initialized');
};
