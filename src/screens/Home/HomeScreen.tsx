import React, {useContext, useState, useEffect} from 'react';
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
import {
  getAllTransactions,
  checkTodayTransactions,
} from '../../database/transactions/transactionQueries';
import {MONTHS} from '../../constants/months';
import {RootStackParamList} from '../../types/navigation';
import type {TransactionData} from '../../types/transaction';
import TransactionChart from '../../components/Chart/TransactionChart';
import {checkTransactions} from '../../utils/notification';
import Toast, {ErrorToast} from 'react-native-toast-message';
import {COLORS} from '../../constants';
import Ionicons from 'react-native-vector-icons/Ionicons';

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

  const InfoToast = (props: any) => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        width: 350,
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
        position: 'absolute',
        zIndex: 9999,
        borderLeftWidth: 4,
        borderLeftColor: '#3498DB',
      }}>
      <Ionicons
        name="information-circle-outline"
        size={24}
        color="#3498DB"
        style={{marginRight: 8}}
      />
      <View style={{flex: 1}}>
        <CustomText variant="body" color={COLORS.darkBlue}>
          {props.text1}
        </CustomText>
      </View>
      <TouchableOpacity onPress={() => Toast.hide()} style={{marginLeft: 8}}>
        <Ionicons name="close" size={20} color="#888" />
      </TouchableOpacity>
    </View>
  );

  useFocusEffect(
    useCallback(() => {
      setRefreshKey(prev => prev + 1);
    }, []),
  );

  useEffect(() => {
    checkTransactions();
  }, []);

  useEffect(() => {
    async function showTransactionToast() {
      try {
        const {hasIncome, hasExpense} = await checkTodayTransactions();
        console.log('hasIncome:', hasIncome, 'hasExpense:', hasExpense);

        if (!hasIncome && !hasExpense) {
          Toast.show({
            type: 'infoCustom',
            text1: 'Belum ada transaksi hari ini',
            autoHide: false,
            position: 'top',
          });
        } else if (!hasIncome) {
          Toast.show({
            type: 'infoCustom',
            text1: 'Belum ada pemasukan hari ini',
            autoHide: false,
            position: 'top',
          });
        } else if (!hasExpense) {
          Toast.show({
            type: 'infoCustom',
            text1: 'Belum ada pengeluaran hari ini',
            autoHide: false,
            position: 'top',
          });
        } else {
          Toast.hide();
        }
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: 'Gagal cek transaksi hari ini',
        });
      }
    }

    showTransactionToast();
  }, [transactions]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}>
        <CustomText variant="subtitle" style={styles.title}>
          Selamat Datang,
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
      <Toast
        config={{
          infoCustom: InfoToast,
          error: ErrorToast,
        }}
      />
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
