export interface TransactionData {
  id: number;
  name: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  price: number;
  date: string;
}

export interface IncomeData extends Transaction {
  menu_id: number;
}

export type ExpenseData = Transaction;
