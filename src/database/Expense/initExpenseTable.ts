import {CREATE_EXPENSE_TABLE} from '../../constants';
import {getDBConnection} from '../db';
import {SQLiteDatabase, Transaction} from 'react-native-sqlite-storage';

export const initExpenseTable = async () => {
  const database: SQLiteDatabase = await getDBConnection();
  await database.transaction((tx: Transaction) => {
    tx.executeSql(CREATE_EXPENSE_TABLE);
  });
};
