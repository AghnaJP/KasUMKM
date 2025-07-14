import {CREATE_INCOME_TABLE} from '../../constants';
import {getDBConnection} from '../db';
import {SQLiteDatabase, Transaction} from 'react-native-sqlite-storage';

export const initIncomeTable = async () => {
  const database: SQLiteDatabase = await getDBConnection();
  await database.transaction((tx: Transaction) => {
    tx.executeSql(CREATE_INCOME_TABLE);
  });
};
