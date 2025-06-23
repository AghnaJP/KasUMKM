import {CREATE_USERS_TABLE} from '../../constants';
import db from '../db';
import {Transaction} from 'react-native-sqlite-storage';

export const initUserTable = async () => {
  const database = await db;
  await database.transaction((tx: Transaction) => {
    tx.executeSql(CREATE_USERS_TABLE);
  });
};
