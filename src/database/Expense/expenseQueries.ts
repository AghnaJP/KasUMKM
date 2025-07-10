import {getDBConnection} from '../db';
import {SQLiteDatabase, Transaction} from 'react-native-sqlite-storage';

export const insertExpense = async (
  description: string,
  price: number,
  quantity: number,
  createdAt: string,
  updatedAt: string,
): Promise<void> => {
  const database: SQLiteDatabase = await getDBConnection();
  return new Promise<void>((resolve, reject) => {
    database.transaction((tx: Transaction) => {
      tx.executeSql(
        'INSERT INTO expenses (description, price, quantity, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        [description, price, quantity, createdAt, updatedAt],
        () => resolve(),
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};

export const getAllExpenses = async (): Promise<any> => {
  const database: SQLiteDatabase = await getDBConnection();
  return new Promise((resolve, reject) => {
    database.transaction((tx: Transaction) => {
      tx.executeSql(
        'SELECT * FROM expenses',
        [],
        (_, result: any) => {
          resolve(result);
        },
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};
