import {CREATE_EXPENSE_TABLE} from '../../constants';
import db from '../db';
import {Transaction} from 'react-native-sqlite-storage';

export const initExpenseTable = async () => {
  const database = await db;
  await database.transaction((tx: Transaction) => {
    tx.executeSql(CREATE_EXPENSE_TABLE);
  });
};
