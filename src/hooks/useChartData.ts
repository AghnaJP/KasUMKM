import {useEffect, useState} from 'react';
import {getIncomeDetails} from '../database/Incomes/incomeQueries';
import {getExpenseDetails} from '../database/Expense/expenseQueries';

interface ChartData {
  labels: string[];
  data: number[];
}

export function useChartData(
  period: 'Hari' | 'Minggu' | 'Bulan' | 'Tahun',
  type: 'income' | 'expense',
  refreshKey: number,
): ChartData {
  const [chartData, setChartData] = useState<ChartData>({labels: [], data: []});

  useEffect(() => {
    const fetchData = async () => {
      const rawData =
        type === 'income'
          ? await getIncomeDetails()
          : await getExpenseDetails();

      const now = new Date();

      if (period === 'Hari') {
        const daysInMonth = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
        ).getDate();
        const labels = Array.from({length: daysInMonth}, (_, i) =>
          (i + 1).toString(),
        );
        const data = new Array(daysInMonth).fill(0);

        rawData.forEach(item => {
          const date = new Date(item.date);
          if (
            date.getFullYear() === now.getFullYear() &&
            date.getMonth() === now.getMonth()
          ) {
            const day = date.getDate();
            data[day - 1] += item.amount || 0;
          }
        });

        setChartData({labels, data});
      } else if (period === 'Minggu') {
        const labels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
        const data = new Array(7).fill(0);

        const currentDate = new Date();
        const currentDay = currentDate.getDay();
        const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
        const monday = new Date(currentDate);
        monday.setDate(currentDate.getDate() - distanceToMonday);
        monday.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(23, 59, 59, 999);

        rawData.forEach(item => {
          const date = new Date(item.date);
          if (date >= monday && date <= today) {
            const dayIndex = date.getDay();
            const index = dayIndex === 0 ? 6 : dayIndex - 1;
            data[index] += item.amount || 0;
          }
        });

        setChartData({labels, data});
      } else if (period === 'Bulan') {
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
          const date = new Date(item.date);
          if (date.getFullYear() === now.getFullYear()) {
            const month = date.getMonth();
            data[month] += item.amount || 0;
          }
        });

        setChartData({labels, data});
      } else if (period === 'Tahun') {
        const yearMap: Record<string, number> = {};

        rawData.forEach(item => {
          const year = new Date(item.date).getFullYear().toString();
          yearMap[year] = (yearMap[year] || 0) + (item.amount || 0);
        });

        const sortedYears = Object.keys(yearMap).sort();
        const data = sortedYears.map(year => yearMap[year]);
        setChartData({labels: sortedYears, data});
      }
    };

    fetchData();
  }, [period, type, refreshKey]);

  return chartData;
}
