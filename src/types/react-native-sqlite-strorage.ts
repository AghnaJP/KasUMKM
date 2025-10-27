declare module 'react-native-sqlite-storage' {
  export type ResultSet = {
    insertId?: number;
    rowsAffected: number;
    rows: {
      length: number;
      item: (index: number) => any;
      _array: any[];
    };
  };

  export interface Transaction {
    executeSql: (
      sqlStatement: string,
      args?: any[],
      successCallback?: (tx: Transaction, resultSet: ResultSet) => void,
      errorCallback?: (tx: Transaction, error: any) => void,
    ) => void;
  }

  export interface SQLiteDatabase {
    transaction: (callback: (tx: Transaction) => void) => Promise<void>;
    executeSql: (sqlStatement: string, args?: any[]) => Promise<[ResultSet]>;
    close: () => Promise<void>;
  }

  const SQLite: {
    openDatabase: (options: {
      name: string;
      location: 'default';
    }) => Promise<SQLiteDatabase>;

    enablePromise: (flag: boolean) => void;

    DEBUG: (flag: boolean) => void;
  };

  export default SQLite;
}
