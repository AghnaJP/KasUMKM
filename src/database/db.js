import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

export const getDBConnection = async () => {
  const db = await SQLite.openDatabase({
    name: 'KasUMKM.db',
    location: 'default',
  });

  await db.executeSql('PRAGMA foreign_keys = ON;');

  return db;
};
