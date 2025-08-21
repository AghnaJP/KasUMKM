import {getDBConnection} from '../db';
import {TransactionData} from '../../types/transaction';
import {SQLiteDatabase} from 'react-native-sqlite-storage';

export async function getAllTransactions(): Promise<TransactionData[]> {
  const db: SQLiteDatabase = await getDBConnection();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      const query = `
        SELECT
          i.id,
          COALESCE(i.custom_description, m.name) AS name,
          (COALESCE(i.custom_quantity, i.quantity) * COALESCE(i.custom_price, m.price)) AS amount,
          COALESCE(i.custom_created_at, i.created_at) AS date,
          'income' AS type
        FROM incomes i
        JOIN menus m ON i.menu_id = m.id

        UNION ALL

        SELECT
          e.id,
          COALESCE(e.custom_description, e.description) AS name,
          (COALESCE(e.custom_quantity, e.quantity) * COALESCE(e.custom_price, e.price)) AS amount,
          COALESCE(e.custom_created_at, e.created_at) AS date,
          'expense' AS type
        FROM expenses e

        ORDER BY date DESC;
      `;

      tx.executeSql(
        query,
        [],
        (_, resultSet) => {
          const data: TransactionData[] = [];
          const rows = resultSet.rows;
          for (let i = 0; i < rows.length; i++) {
            data.push(rows.item(i));
          }
          resolve(data);
        },
        (_, error) => {
          console.error('Failed to fetch all transactions:', error);
          reject(error);
          return false;
        },
      );
    });
  });
}

export const checkTodayTransactions = async (): Promise<{
  hasIncome: boolean;
  hasExpense: boolean;
}> => {
  const database = await getDBConnection();
  const today = new Date();
  const todayString = today.toISOString().slice(0, 10);

  return new Promise((resolve, reject) => {
    database.transaction(tx => {
      tx.executeSql(
        'SELECT COUNT(*) as count FROM incomes WHERE DATE(created_at) = ?',
        [todayString],
        (_, incomeResults) => {
          const incomeCount = incomeResults.rows.item(0).count;

          tx.executeSql(
            'SELECT COUNT(*) as count FROM expenses WHERE DATE(created_at) = ?',
            [todayString],
            (__, expenseResults) => {
              const expenseCount = expenseResults.rows.item(0).count;
              resolve({
                hasIncome: incomeCount > 0,
                hasExpense: expenseCount > 0,
              });
            },
            (__, error) => {
              console.error('Error checking expenses:', error);
              reject(error || new Error('Failed to check expenses'));
              return false;
            },
          );
        },
        (_, error) => {
          console.error('Error checking incomes:', error);
          reject(error || new Error('Failed to check incomes'));
          return false;
        },
      );
    });
  });
};
