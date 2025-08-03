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

const TransactionChart = ({refreshKey}: {refreshKey: number}) => {
  const [period, setPeriod] = useState<'Hari' | 'Minggu' | 'Bulan' | 'Tahun'>('Hari');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [tooltipPos, setTooltipPos] = useState({
    x: 0,
    y: 0,
    value: 0,
    index: -1,
    visible: false,
  });

  const scrollViewRef = useRef<ScrollView | null>(null);
  const {width: screenWidth} = useWindowDimensions();

  useEffect(() => {
    scrollViewRef.current?.scrollTo({x: 0, animated: false});
    setTooltipPos(prev => ({...prev, visible: false}));
  }, [period]);

  const {labels, data: rawDataset} = useChartData(period, type, refreshKey);
  const dataset = rawDataset.map(d => (d >= 1000 ? d : 0));
  const isEmpty = dataset.length === 0 || dataset.every(d => d === 0);
  const chartWidth = Math.max(screenWidth, labels.length * 40);

  const minValue = isEmpty
    ? 0
    : Math.max(0, Math.min(...dataset) - 0.1 * Math.max(...dataset));
  const maxValue = isEmpty ? 1000 : Math.max(...dataset);

  const chartData = {
    labels,
    datasets: [{data: dataset}],
  };

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: (opacity = 1) =>
      type === 'income'
        ? `rgba(0, 122, 255, ${opacity})`
        : `rgba(255, 0, 0, ${opacity})`,
    labelColor: () => '#888',
    strokeWidth: 3,
    propsForDots: {r: '0'},
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

  return (
    <View>
      <ChartPeriodTabs selected={period} onSelect={setPeriod} />

      <View style={styles.chartRow}>
        <View style={styles.yAxis}>
          {!isEmpty &&
            Array.from({length: 5}, (_, i) => {
              const step = (maxValue - minValue) / 4 || 1;
              const value = minValue + step * (4 - i);
              if (value === 0) return null;
              const rounded =
                value >= 1_000_000
                  ? `${(value / 1_000_000).toFixed(1)}jt`
                  : `${Math.round(value / 1000)}rb`;
              return (
                <CustomText key={i} style={styles.yAxisText}>
                  {rounded}
                </CustomText>
              );
            })}
        </View>

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
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                  onDataPointClick={({value, x, y, index}) => {
                    setTooltipPos({x, y, value, index, visible: true});
                  }}
                  renderDotContent={({x, y, index}) => {
                    const isActive =
                      tooltipPos.visible && tooltipPos.index === index;
                    if (!isActive) return null;
                    return (
                      <View
                        key={`dot-${index}`}
                        style={[
                          type === 'income'
                            ? styles.activeDotIncome
                            : styles.activeDotExpense,
                          {top: y - 7, left: x - 7},
                        ]}
                      />
                    );
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
                      backgroundColor:
                        type === 'income' ? '#D0F0FF' : '#FFD0D0',
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
      </View>

      <View style={styles.switchContainer}>
        <TouchableOpacity onPress={toggleType}>
          <Ionicons name="chevron-back" size={20} color="#0E3345" />
        </TouchableOpacity>
        <CustomText style={styles.switchLabel}>
          {type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
        </CustomText>
        <TouchableOpacity onPress={toggleType}>
          <Ionicons name="chevron-forward" size={20} color="#0E3345" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  yAxis: {
    width: 50,
    height: 240,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 4,
    paddingTop: 25,
  },
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
    width: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: '#0E3345',
  },
  activeDotExpense: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: '#a6090c',
  },
});

export default TransactionChart;
