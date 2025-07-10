import {getDBConnection} from '../db';
import {SQLiteDatabase, Transaction} from 'react-native-sqlite-storage';

export const insertIncome = async (
  menuId: number,
  quantity: number,
  createdAt: string,
  updatedAt: string,
): Promise<void> => {
  const database: SQLiteDatabase = await getDBConnection();
  return new Promise<void>((resolve, reject) => {
    database.transaction((tx: Transaction) => {
      tx.executeSql(
        'INSERT INTO incomes (menu_id, quantity, created_at, updated_at) VALUES (?, ?, ?, ?)',
        [menuId, quantity, createdAt, updatedAt],
        () => resolve(),
        (_, error) => {
          console.error(
            'SQL Insert Error:',
            error,
            menuId,
            quantity,
            createdAt,
            updatedAt,
          );
          reject(error ?? new Error('Unknown SQL error'));
          return false;
        },
      );
    });
  });
};

export const getAllIncomes = async (): Promise<any> => {
  const database: SQLiteDatabase = await getDBConnection();
  return new Promise((resolve, reject) => {
    database.transaction((tx: Transaction) => {
      tx.executeSql(
        'SELECT * FROM incomes',
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
