import {getDBConnection} from '../db';
import {SQLiteDatabase} from 'react-native-sqlite-storage';

export interface ExpenseData {
  id: number;
  description: string;
  amount: number;
  price: number;
  date: string;
}

const getExpenseDetails = async (): Promise<ExpenseData[]> => {
  const database: SQLiteDatabase = await getDBConnection();
  return new Promise((resolve, reject) => {
    database.transaction(tx => {
      const query = `
        SELECT
          id,
          description,
          price,
          (price * quantity) as amount,
          created_at as date
        FROM expenses
        ORDER BY id DESC;
      `;
      tx.executeSql(
        query,
        [],
        (_, results) => {
          const data: ExpenseData[] = [];
          for (let i = 0; i < results.rows.length; i++) {
            data.push(results.rows.item(i));
          }
          resolve(data);
        },
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};

const deleteExpensesByIds = async (ids: number[]): Promise<void> => {
  if (ids.length === 0) {
    return Promise.resolve();
  }
  const database: SQLiteDatabase = await getDBConnection();
  return new Promise((resolve, reject) => {
    database.transaction(tx => {
      const placeholders = ids.map(() => '?').join(', ');
      const query = `DELETE FROM expenses WHERE id IN (${placeholders})`;
      tx.executeSql(
        query,
        ids,
        () => resolve(),
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};

const updateExpenseDetails = async (
  id: number,
  newDescription: string,
  newPrice: number,
): Promise<void> => {
  const database: SQLiteDatabase = await getDBConnection();
  return new Promise((resolve, reject) => {
    database.transaction(tx => {
      const query =
        'UPDATE expenses SET description = ?, price = ? WHERE id = ?';
      tx.executeSql(
        query,
        [newDescription, newPrice, id],
        () => resolve(),
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};

export const ExpenseQueries = {
  getExpenseDetails,
  deleteExpensesByIds,
  updateExpenseDetails,
};
