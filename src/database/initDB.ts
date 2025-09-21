import {initUserTable} from './users/initUserTable';
import {initMenuTable} from './menus/initMenuTable';
import {initIncomeTable} from './Incomes/initIncomeTable';
import {initExpenseTable} from './Expense/initExpenseTable';
import {migrateCreateTransactionsTable} from './migrations/001_transaction_table';
import {createTransactionsTable} from './transactions/transactionUnified';

export const initAllTables = async () => {
  await initUserTable();
  await initMenuTable();
  await initIncomeTable();
  await initExpenseTable();
  await migrateCreateTransactionsTable();
  await createTransactionsTable();
  console.log('All tables initialized');
};
