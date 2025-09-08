import {useEffect, useState, useMemo} from 'react';
import {getIncomeDetails} from '../database/Incomes/incomeQueries';
import {getExpenseDetails} from '../database/Expense/expenseQueries';
import {MONTHS} from '../constants/months';

interface ChartData {
  labels: string[];
  data: number[];
}

interface ChartFilters {
  month?: string | number;
  year?: number;
}

export function useChartData(
  period: 'Hari' | 'Minggu' | 'Bulan' | 'Tahun',
  type: 'income' | 'expense',
  refreshKey: number,
  filters?: ChartFilters,
): ChartData {
  const [rawData, setRawData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data =
        type === 'income'
          ? await getIncomeDetails()
          : await getExpenseDetails();
      const parsed = data.map(item => {
        const date = new Date(item.date);
        return {
          ...item,
          _year: date.getFullYear(),
          _month: date.getMonth(),
          _day: date.getDate(),
          _dayOfWeek: date.getDay(),
          _time: date.getTime(),
        };
      });
      setRawData(parsed);
    };
    fetchData();
  }, [type, refreshKey]);

  const chartData: ChartData = useMemo(() => {
    const now = new Date();
    const filterYear = filters?.year ?? now.getFullYear();

    let filterMonthIndex = now.getMonth();
    if (filters?.month !== undefined) {
      if (typeof filters.month === 'number') {
        filterMonthIndex = filters.month;
      } else {
        const idx = MONTHS.indexOf(filters.month);
        filterMonthIndex = idx !== -1 ? idx : parseInt(filters.month, 10) - 1;
      }
    }

    if (period === 'Hari') {
      const daysInMonth = new Date(
        filterYear,
        filterMonthIndex + 1,
        0,
      ).getDate();
      const labels = Array.from({length: daysInMonth}, (_, i) =>
        (i + 1).toString(),
      );
      const data = new Array(daysInMonth).fill(0);

      rawData.forEach(item => {
        if (item._year === filterYear && item._month === filterMonthIndex) {
          data[item._day - 1] += item.amount || 0;
        }
      });

      return {labels, data};
    }

    if (period === 'Minggu') {
      const labels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
      const data = new Array(7).fill(0);

      const currentDate = new Date();
      const distanceToMonday =
        currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1;
      const monday = new Date(currentDate);
      monday.setDate(currentDate.getDate() - distanceToMonday);
      monday.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      rawData.forEach(item => {
        if (item._time >= monday.getTime() && item._time <= today.getTime()) {
          const idx = item._dayOfWeek === 0 ? 6 : item._dayOfWeek - 1;
          data[idx] += item.amount || 0;
        }
      });

      return {labels, data};
    }

    if (period === 'Bulan') {
     const labels = [
       'Jan',
       'Feb',
       'Mar',
       'Apr',
       'Mei',
       'Jun',
       'Jul',
       'Agu',
       'Sep',
       'Okt',
       'Nov',
       'Des',
     ];
      const data = new Array(12).fill(0);
      rawData.forEach(item => {
        if (item._year === filterYear) {
          data[item._month] += item.amount || 0;
        }
      });
      return {labels, data};
    }

    if (period === 'Tahun') {
      const yearMap: Record<number, number> = {};
      rawData.forEach(item => {
        yearMap[item._year] = (yearMap[item._year] || 0) + (item.amount || 0);
      });
      const sortedYears = Object.keys(yearMap)
        .map(Number)
        .sort((a, b) => a - b);
      const data = sortedYears.map(y => yearMap[y]);
      return {labels: sortedYears.map(String), data};
    }

    return {labels: [], data: []};
  }, [rawData, period, filters?.month, filters?.year]);

  return chartData;
}
