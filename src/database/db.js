import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

const db = SQLite.openDatabase({name: 'KasUMKM.db', location: 'default'});

export default db;
