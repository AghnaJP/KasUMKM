import {MONTHS} from '../constants/months';
import {TransactionData} from '../types/transaction';

export const groupByMonth = (transactions: TransactionData[]) => {
  const result: {
    income: number;
    expense: number;
    month: string;
    year: number;
  }[] = [];

  const transactionMap: Record<
    string,
    {income: number; expense: number; month: string; year: number}
  > = {};

  const years = new Set<number>();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();

  transactions.forEach(tx => {
    const dateObj = new Date(tx.date);
    const monthIndex = dateObj.getMonth();
    const year = dateObj.getFullYear();
    const monthName = MONTHS[monthIndex];
    const key = `${monthName}-${year}`;

    years.add(year);

    if (!transactionMap[key]) {
      transactionMap[key] = {
        income: 0,
        expense: 0,
        month: monthName,
        year,
      };
    }

    if (tx.type === 'income') {
      transactionMap[key].income += tx.amount;
    } else if (tx.type === 'expense') {
      transactionMap[key].expense += tx.amount;
    }
  });

  years.forEach(year => {
    const maxMonth = year === currentYear ? currentMonthIndex : 11;

    for (let i = 0; i <= maxMonth; i++) {
      const monthName = MONTHS[i];
      const key = `${monthName}-${year}`;

      if (!transactionMap[key]) {
        transactionMap[key] = {
          income: 0,
          expense: 0,
          month: monthName,
          year,
        };
      }

      result.push(transactionMap[key]);
    }
  });

  return result.sort((a, b) => {
    if (a.year !== b.year) {
      return b.year - a.year;
    }
    return MONTHS.indexOf(a.month) - MONTHS.indexOf(b.month);
  });
};
