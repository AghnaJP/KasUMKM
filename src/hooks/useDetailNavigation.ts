import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';
import {getExpenseDetails} from '../database/Expense/expenseQueries';
import {MONTHS} from '../constants/months';
import {getIncomeDetails} from '../database/Incomes/incomeQueries';

const getMonthIndex = (monthName: string): number => {
  return MONTHS.indexOf(monthName);
};

export const useDetailNavigation = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handlePressDetail = async (month: string, year: number) => {
    const [incomeRaw, expenseRaw] = await Promise.all([
      getIncomeDetails(),
      getExpenseDetails(),
    ]);

    const monthIndex = getMonthIndex(month);

    const filteredIncome = incomeRaw.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getFullYear() === year && tDate.getMonth() === monthIndex;
    });

    const filteredExpense = expenseRaw.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getFullYear() === year && tDate.getMonth() === monthIndex;
    });

    const incomeList = filteredIncome.map(t => ({
      date: t.date,
      product: t.description,
      qty: t.quantity ?? 1,
      price: t.price,
    }));

    const expenseList = filteredExpense.map(t => ({
      date: t.date,
      item: t.description,
      qty: t.quantity ?? 1,
      price: t.price,
    }));

    navigation.navigate('App', {
      screen: 'DetailReport',
      params: {
        month,
        year,
        incomeList,
        expenseList,
      },
    });
  };

  return {handlePressDetail};
};
