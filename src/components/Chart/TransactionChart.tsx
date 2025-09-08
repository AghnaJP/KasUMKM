import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import {LineChart} from 'react-native-chart-kit';
import ChartPeriodTabs from './ChartPeriodTabs';
import CustomText from '../Text/CustomText';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useChartData} from '../../hooks/useChartData';
import DateFilterRow from '../DateFilterRow';
import {MONTHS} from '../../constants/months';

const getCurrentDateInfo = () => {
  const today = new Date();
  return {
    currentMonth: MONTHS[today.getMonth()],
    currentYear: today.getFullYear(),
  };
};

const TransactionChart = ({refreshKey}: {refreshKey: number}) => {
  const [period, setPeriod] = useState<'Hari' | 'Minggu' | 'Bulan' | 'Tahun'>(
    'Hari',
  );
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [tooltipPos, setTooltipPos] = useState({
    x: 0,
    y: 0,
    value: 0,
    index: -1,
    visible: false,
  });

  const {currentMonth, currentYear} = getCurrentDateInfo();

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const scrollViewRef = useRef<ScrollView | null>(null);
  const {width: screenWidth} = useWindowDimensions();

  const pendingDotRef = useRef<{
    x: number;
    y: number;
    index: number;
    value: number;
  } | null>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollTo({x: 0, animated: false});
    setTooltipPos(prev => ({...prev, visible: false}));
  }, [period, selectedMonth, selectedYear]);

  const {labels, data: rawDataset} = useChartData(period, type, refreshKey, {
    month: selectedMonth,
    year: selectedYear,
  });

  const dataset = rawDataset;

  const isEmpty = dataset.length === 0 || dataset.every(d => d === 0);

  const chartWidth = Math.max(screenWidth, labels.length * 40);

  const chartData = React.useMemo(
    () => ({
      labels,
      datasets: [{data: dataset}],
    }),
    [labels, dataset],
  );

  useEffect(() => {
    if (pendingDotRef.current) {
      const {x, y, index, value} = pendingDotRef.current;
      setTooltipPos({
        x,
        y,
        value,
        index,
        visible: true,
      });
      pendingDotRef.current = null;
    }
  }, [dataset]);

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) =>
      type === 'income'
        ? `rgba(0, 122, 255, ${opacity})`
        : `rgba(255, 0, 0, ${opacity})`,
    labelColor: () => '#888',
    strokeWidth: 3,
    propsForDots: {
      r: '8',
      strokeWidth: '2',
      stroke: 'rgba(0,0,0,0)',
      fill: 'rgba(0,0,0,0)',
    },
    propsForLabels: styles.chartLabel,
    formatYLabel: () => '',
  };

  const toggleType = () => {
    setTooltipPos(prev => ({...prev, visible: false}));
    setType(prev => (prev === 'income' ? 'expense' : 'income'));
  };

  const getTooltipLeft = (x: number) => {
    const tooltipWidth = 100;
    if (x + tooltipWidth > chartWidth) {
      return x - tooltipWidth + 20;
    }
    if (x < 20) {
      return x + 10;
    }
    return x - 10;
  };

  const handleMonthChange = React.useCallback((month: string) => {
    setTooltipPos(prev => ({...prev, visible: false}));
    setSelectedMonth(month);
  }, []);

  const handleYearChange = React.useCallback((year: number) => {
    setTooltipPos(prev => ({...prev, visible: false}));
    setSelectedYear(year);
  }, []);

  const LABEL_PIXEL_WIDTH = 40;
  const SIDE_PADDING = 16;
  const prevDatasetRef = useRef<number[] | null>(null);
  const prevLabelsRef = useRef<string[] | null>(null);

  const showLastDataTooltip = React.useCallback(() => {
    if (isEmpty || dataset.length === 0) {
      return;
    }

    let lastDataIndex = -1;
    for (let i = dataset.length - 1; i >= 0; i--) {
      if (dataset[i] > 0) {
        lastDataIndex = i;
        break;
      }
    }

    if (lastDataIndex >= 0) {
      setTooltipPos(prev => ({
        ...prev,
        value: dataset[lastDataIndex],
        index: lastDataIndex,
        visible: true,
      }));

      const approxX = lastDataIndex * LABEL_PIXEL_WIDTH + SIDE_PADDING;
      const targetCenterX = approxX - screenWidth / 2 + LABEL_PIXEL_WIDTH / 2;
      const maxScroll = Math.max(0, chartWidth + 50 - screenWidth);
      const targetX = Math.max(0, Math.min(maxScroll, targetCenterX));

      scrollViewRef.current?.scrollTo({x: targetX, animated: true});
    } else {
      setTooltipPos(prev => ({...prev, visible: false}));
    }
  }, [isEmpty, dataset, chartWidth, screenWidth]);

  useEffect(() => {
    if (!isEmpty && dataset.length > 0) {
      const timer = setTimeout(() => {
        showLastDataTooltip();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [dataset, period, type, isEmpty, showLastDataTooltip]);

  useEffect(() => {
    const prev = prevDatasetRef.current;
    const prevLabels = prevLabelsRef.current;

    if (
      prev &&
      prev.length === dataset.length &&
      prevLabels &&
      prevLabels.join('|') === labels.join('|')
    ) {
      const changed: number[] = [];
      for (let i = 0; i < dataset.length; i++) {
        if (dataset[i] !== prev[i]) {
          changed.push(i);
        }
      }

      if (changed.length > 0) {
        const focusIndex = changed[changed.length - 1];
        const approxX = focusIndex * LABEL_PIXEL_WIDTH + SIDE_PADDING;
        const targetCenterX = approxX - screenWidth / 2 + LABEL_PIXEL_WIDTH / 2;
        const maxScroll = Math.max(0, chartWidth + 50 - screenWidth);
        const targetX = Math.max(0, Math.min(maxScroll, targetCenterX));

        setTooltipPos(prevPos => ({...prevPos, visible: false}));
        scrollViewRef.current?.scrollTo({x: targetX, animated: true});
      }
    }

    prevDatasetRef.current = dataset.slice();
    prevLabelsRef.current = labels.slice();
  }, [dataset, labels, screenWidth, chartWidth]);

  return (
    <View>
      <ChartPeriodTabs selected={period} onSelect={setPeriod} />

      <DateFilterRow
        selectedMonth={selectedMonth.toString()}
        selectedYear={selectedYear}
        onMonthChange={month => handleMonthChange(month)}
        onYearChange={year => handleYearChange(Number(year))}
        showMonth={period === 'Hari'}
        showYear={period === 'Bulan' || period === 'Hari'}
      />

      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}>
        <TouchableWithoutFeedback
          onPress={() => setTooltipPos(prev => ({...prev, visible: false}))}>
          <View
            style={[
              styles.chartScrollArea,
              isEmpty && styles.emptyChartContainer,
              {width: chartWidth + 50},
            ]}>
            {isEmpty ? (
              <CustomText style={styles.emptyText}>
                Belum ada data untuk ditampilkan
              </CustomText>
            ) : (
              <LineChart
                data={chartData}
                width={chartWidth + 50}
                height={240}
                yAxisLabel=""
                yLabelsOffset={0}
                xLabelsOffset={-10}
                withHorizontalLabels={false}
                withVerticalLabels={true}
                withDots
                withInnerLines={false}
                withVerticalLines={false}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                onDataPointClick={({value, x, y, index}) => {
                  setTooltipPos({x, y, value, index, visible: true});
                }}
                renderDotContent={({x, y, index}) => {
                  let lastDataIndex = -1;
                  for (let i = dataset.length - 1; i >= 0; i--) {
                    if (dataset[i] > 0) {
                      lastDataIndex = i;
                      break;
                    }
                  }

                  const isLastDataPoint = index === lastDataIndex;
                  const isActive =
                    tooltipPos.visible && tooltipPos.index === index;

                  if (
                    isLastDataPoint &&
                    dataset[index] > 0 &&
                    !tooltipPos.visible
                  ) {
                    pendingDotRef.current = {
                      x,
                      y,
                      index,
                      value: dataset[index],
                    };
                  }

                  if (dataset[index] > 0) {
                    return (
                      <TouchableOpacity
                        key={`touch-dot-${index}`}
                        style={{
                          position: 'absolute',
                          left: x - 20,
                          top: y - 20,
                          width: 40,
                          height: 40,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                        onPress={() => {
                          setTooltipPos({
                            x,
                            y,
                            value: dataset[index],
                            index,
                            visible: true,
                          });
                        }}>
                        {isActive && (
                          <View
                            style={[
                              type === 'income'
                                ? styles.activeDotIncome
                                : styles.activeDotExpense,
                            ]}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  }

                  return null;
                }}
              />
            )}

            {tooltipPos.visible && (
              <View
                style={[
                  styles.tooltip,
                  {
                    left: getTooltipLeft(tooltipPos.x),
                    top: Math.max(tooltipPos.y - 15, 0),
                    backgroundColor: type === 'income' ? '#D0F0FF' : '#FFD0D0',
                  },
                ]}>
                <CustomText
                  style={[
                    styles.tooltipText,
                    {color: type === 'income' ? '#0E3345' : '#B00020'},
                  ]}>
                  Rp {Math.round(tooltipPos.value).toLocaleString('id-ID')}
                </CustomText>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>

      <View style={styles.switchContainer}>
        <TouchableOpacity onPress={toggleType}>
          <Ionicons name="chevron-back" size={20} color="#0E3345" />
        </TouchableOpacity>
        <CustomText style={styles.switchLabel}>
          {type === 'income' ? 'Pendapatan' : 'Pengeluaran'}
        </CustomText>
        <TouchableOpacity onPress={toggleType}>
          <Ionicons name="chevron-forward" size={20} color="#0E3345" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  yAxisText: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'Montserrat-Regular',
  },
  chartLabel: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'Montserrat-Regular',
  },
  chartScrollArea: {
    height: 240,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingBottom: 20,
  },
  emptyChartContainer: {
    alignItems: 'flex-start',
    paddingTop: 80,
    paddingLeft: 16,
  },
  emptyText: {
    color: '#888',
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
  },
  chart: {
    borderRadius: 12,
    marginTop: 25,
    paddingRight: 12,
    marginLeft: 16,
  },
  tooltip: {
    position: 'absolute',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    zIndex: 99,
    elevation: 5,
  },
  tooltipText: {
    fontSize: 13,
    fontFamily: 'Montserrat-SemiBold',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: '#0E3345',
    fontFamily: 'Montserrat-SemiBold',
  },
  activeDotIncome: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0E3345',
  },
  activeDotExpense: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#a6090c',
  },
});

export default React.memo(TransactionChart);
