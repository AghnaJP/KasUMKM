import React, {useContext, useState} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useCallback} from 'react';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import CustomText from '../../components/Text/CustomText';
import ProfitCard from '../../components/Card/ProfitCard';
import TransactionItem from '../../components/TransactionList/TransactionItem';
import {AuthContext} from '../../context/AuthContext';
import {useTransactionList} from '../../hooks/useTransactionList';
import {getAllTransactions} from '../../database/transactions/transactionQueries';
import {MONTHS} from '../../constants/months';
import {RootStackParamList} from '../../types/navigation';
import type {TransactionData} from '../../types/transaction';
import TransactionChart from '../../components/Chart/TransactionChart';

const HomeScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {userName} = useContext(AuthContext);
  const [_, setLoaded] = useState<TransactionData[]>([]);

  const [refreshKey, setRefreshKey] = useState(0);

  const currentDate = new Date();
  const selectedMonth = MONTHS[currentDate.getMonth()];
  const selectedYear = currentDate.getFullYear().toString();

  const transactions = useTransactionList<TransactionData>(
    getAllTransactions,
    selectedMonth,
    selectedYear,
    setLoaded,
  );

  useFocusEffect(
    useCallback(() => {
      setRefreshKey(prev => prev + 1);
    }, []),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}>
        <CustomText variant="subtitle" style={styles.title}>
          Selamat Sore,
        </CustomText>
        <CustomText variant="title">{userName}</CustomText>

        <ProfitCard />

        <View style={styles.chartWrapper}>
          <TransactionChart refreshKey={refreshKey} />
        </View>

        <View style={styles.transactionHeader}>
          <CustomText variant="subtitle">Transaksi Terkini</CustomText>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('App', {
                screen: 'AppTabs',
                params: {
                  screen: 'Wallet',
                },
              })
            }>
            <CustomText variant="caption" color="#007bff" uppercase>
              Lihat Semua
            </CustomText>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionCard}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
            style={{maxHeight: 300}}>
            {transactions.map(item => (
              <TransactionItem
                key={`${item.type}-${item.id}`}
                name={item.name}
                date={new Date(item.date).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
                amount={item.amount}
                type={item.type}
              />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    marginTop: 16,
  },
  chartWrapper: {
    marginBottom: 5,
    marginTop: 20,
  },
  transactionHeader: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionCard: {
    backgroundColor: '#fff',
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default HomeScreen;
