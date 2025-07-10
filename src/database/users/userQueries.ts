import {getDBConnection} from '../db';
import {
  Transaction,
  ResultSet,
  SQLiteDatabase,
} from 'react-native-sqlite-storage';
import {User} from '../../types/user';

export const insertUser = async (
  name: string,
  phone: string,
  password: string,
) => {
  const database: SQLiteDatabase = await getDBConnection();

  return new Promise((resolve, reject) => {
    database.transaction((tx: Transaction) => {
      tx.executeSql(
        'INSERT INTO users (name, phone, password) VALUES (?, ?, ?)',
        [name, phone, password],
        (_, result) => resolve(result),
        (_, error) => reject(error),
      );
    });
  });
};

export const getUserByPhone = async (phone: string): Promise<User | null> => {
  const database: SQLiteDatabase = await getDBConnection();

  return new Promise((resolve, reject) => {
    database.transaction((tx: Transaction) => {
      tx.executeSql(
        'SELECT * FROM users WHERE phone = ?',
        [phone],
        (_: Transaction, result: ResultSet) => {
          if (result.rows.length > 0) {
            const user = result.rows.item(0) as User;
            resolve(user);
          } else {
            resolve(null);
          }
        },
        (_: Transaction, error: any) => {
          reject(error);
          return false;
        },
      );
    });
  });
};

export const editUsername = async (name: string, phone: string) => {
  const database: SQLiteDatabase = await getDBConnection();

  return new Promise((resolve, reject) => {
    database.transaction((tx: Transaction) => {
      tx.executeSql(
        'UPDATE users SET name = ? WHERE phone = ?',
        [name, phone],
        (_, result) => resolve(result),
        (_, error) => reject(error),
      );
    });
  });
};

export const updateUserPassword = async (
  phone: string,
  newPassword: string,
) => {
  const database: SQLiteDatabase = await getDBConnection();
  return new Promise((resolve, reject) => {
    database.transaction((tx: Transaction) => {
      tx.executeSql(
        'UPDATE users SET password = ? WHERE phone = ?',
        [newPassword, phone],
        (_, result) => resolve(result),
        (_, error) => reject(error),
      );
    });
  });
};

export const deleteUser = async (phone: string) => {
  const database: SQLiteDatabase = await getDBConnection();
  return new Promise((resolve, reject) => {
    database.transaction((tx: Transaction) => {
      tx.executeSql(
        'DELETE FROM users WHERE phone = ?',
        [phone],
        (_, result) => resolve(result),
        (_, error) => reject(error),
      );
    });
  });
};
