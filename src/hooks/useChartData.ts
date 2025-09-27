import {useEffect, useState} from 'react';
import {getSeriesUnified} from '../database/transactions/transactionQueriesUnified';

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
  const [state, setState] = useState<ChartData>({labels: [], data: []});

  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await getSeriesUnified(period, type, {
        month: filters?.month,
        year: filters?.year,
      });
      if (mounted) setState(res);
    })();
    return () => {
      mounted = false;
    };
  }, [period, type, filters?.month, filters?.year, refreshKey]);

  return state;
}
