// HomeScreen.tsx
import React, {useState, useCallback, useEffect} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import CustomText from '../../components/Text/CustomText';
import ProfitCard from '../../components/Card/ProfitCard';
import TransactionItem from '../../components/TransactionList/TransactionItem';

import {useAuth} from '../../context/AuthContext';
import {useTransactionList} from '../../hooks/useTransactionList';

// 🔁 Sumber data unified (sinkron)
import {getAllTransactionsUnified} from '../../database/transactions/transactionQueriesUnified';
import {checkTodayTransactionsUnified as checkTodayTransactions} from '../../database/transactions/checkUnified';
import {useSync} from '../../hooks/useSync';

import {MONTHS} from '../../constants/months';
import {RootStackParamList} from '../../types/navigation';
import type {TransactionData} from '../../types/transaction';

import TransactionChart from '../../components/Chart/TransactionChart';
import {checkTransactions} from '../../utils/notification';

import Toast, {ErrorToast} from 'react-native-toast-message';
import {COLORS} from '../../constants';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {API_BASE} from '../../constants/api';
import Button from '../../components/Button/Button';

// DEV: insert langsung ke tabel unified (SQLite) // atau 'transactionUnified' sesuai nama file kamu

// DEV: cek DB & tabel (optional, untuk diagnosa)

const HomeScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const {companyId, role, profile, getAuthHeaders} = useAuth();
  const isOwner = role === 'OWNER';
  const {syncNow} = useSync();

  const [_, setLoaded] = useState<TransactionData[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);

  const currentDate = new Date();
  const selectedMonth = MONTHS[currentDate.getMonth()];
  const selectedYear = currentDate.getFullYear();

  // ✅ Bungkus fetcher jadi fungsi TANPA argumen (sesuai tipe useTransactionList)
  const loadUnified = useCallback(
    () => getAllTransactionsUnified(selectedMonth, selectedYear, setLoaded),
    [selectedMonth, selectedYear, setLoaded],
  );

  // ⛳️ List transaksi untuk UI sekarang diambil dari tabel unified
  const transactions = useTransactionList<TransactionData>(
    loadUnified,
    selectedMonth,
    selectedYear,
    setLoaded,
  );

  // (opsional) tes /me
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const headers = await getAuthHeaders();
        const resp = await fetch(`${API_BASE}/me`, {headers});
        const json = await resp.json();
        console.log('GET /me ->', json);
      } catch (e) {
        console.log('GET /me failed', e);
      }
    };
    fetchMe();
  }, [getAuthHeaders]);

  // === SYNC NOW manual ===
  const handleSyncNow = useCallback(async () => {
    try {
      if (!companyId) {
        Toast.show({type: 'error', text1: 'Company tidak ditemukan.'});
        return;
      }
      setIsSyncing(true);
      await syncNow(); // push dirty → pull terbaru
      setLastSyncAt(new Date().toLocaleString('id-ID'));
      setRefreshKey(prev => prev + 1); // segarkan chart/list
      Toast.show({type: 'infoCustom', text1: 'Sinkronisasi selesai'});
    } catch (e) {
      console.log('syncNow error', e);
      Toast.show({type: 'error', text1: 'Gagal sinkronisasi'});
    } finally {
      setIsSyncing(false);
    }
  }, [companyId, syncNow]);

  // === FUNGSI BUAT KODE KASIR (OWNER SAJA) ===
  const handleCreateInvite = useCallback(async () => {
    try {
      if (!isOwner) {
        Toast.show({
          type: 'error',
          text1: 'Hanya Owner yang bisa membuat kode.',
        });
        return;
      }
      if (!companyId) {
        Toast.show({type: 'error', text1: 'Company tidak ditemukan.'});
        return;
      }

      const headers = await getAuthHeaders();
      const r = await fetch(`${API_BASE}/companies/${companyId}/invites`, {
        method: 'POST',
        headers,
        body: JSON.stringify({expires_in_days: 7}),
      });

      const data = await r.json();
      if (!r.ok) {
        Toast.show({
          type: 'error',
          text1: data?.error || 'Gagal membuat undangan',
        });
        return;
      }

      const code = data?.code;
      if (!code) {
        Toast.show({type: 'error', text1: 'Server tidak mengembalikan kode.'});
        return;
      }

      try {
        Clipboard.setString(code);
      } catch {}
      Toast.show({
        type: 'infoCustom',
        text1: `Kode Kasir: ${code} (tersalin)`,
        autoHide: true,
        position: 'top',
      });
    } catch (e) {
      console.error(e);
      Toast.show({
        type: 'error',
        text1: 'Terjadi kesalahan saat membuat undangan',
      });
    }
  }, [isOwner, companyId, getAuthHeaders]);

  // const addDummyUnified = useCallback(async () => {
  //   try {
  //     // insert 1 baris ke SQLite unified
  //     const id = await addTransaction({
  //       name: 'Tes dari unified',
  //       type: 'INCOME', // atau 'EXPENSE'
  //       amount: 12000,
  //       occurred_at: new Date().toISOString(),
  //     });

  //     // segarkan UI supaya kebaca di chart/list (kalau masuk bulan berjalan)
  //     setRefreshKey(prev => prev + 1);

  //     Toast.show({type: 'infoCustom', text1: `Dummy dibuat: ${id}`});
  //   } catch (e) {
  //     console.log('addDummyUnified error', e);
  //     Toast.show({type: 'error', text1: 'Gagal membuat dummy unified tx'});
  //   }
  // }, []);

  // ======= toast helper =======
  const InfoToast = (props: any) => (
    <View style={styles.toastCard}>
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

  // refresh list ketika kembali ke Home (tanpa auto-sync)
  useFocusEffect(
    useCallback(() => {
      setRefreshKey(prev => prev + 1);
    }, []),
  );

  // cek notifikasi (tetap)
  useFocusEffect(
    useCallback(() => {
      checkTransactions();
    }, []),
  );

  // cek transaksi hari ini (pakai unified)
  useFocusEffect(
    useCallback(() => {
      async function showTransactionToast() {
        try {
          const {hasIncome, hasExpense} = await checkTodayTransactions();
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
              text1: 'Belum ada pendapatan hari ini',
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
        } catch {
          Toast.show({type: 'error', text1: 'Gagal cek transaksi hari ini'});
        }
      }
      showTransactionToast();
    }, []),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}>
        <CustomText variant="subtitle" style={styles.title}>
          Selamat Datang,
        </CustomText>
        <CustomText variant="title">{profile?.name || 'Pengguna'}</CustomText>

        {/* === TOMBOL OWNER-ONLY === */}
        {isOwner && (
          <View style={{marginTop: 12}}>
            <Button
              title="Buat Kode Kasir"
              variant="primary"
              onPress={handleCreateInvite}
            />
          </View>
        )}

        {/* {isOwner && (
          <View style={{marginTop: 12}}>
            <Button
              title="Buat Kode Kasir"
              variant="primary"
              onPress={handleCreateInvite}
            /> */}

            {/* 🔹 Tombol dev: insert langsung ke unified */}
            {/* <View style={{marginTop: 8}}>
              <Button
                title="Add Dummy Unified Tx"
                variant="secondary"
                onPress={addDummyUnified}
                disabled={isSyncing}
              />
            </View> */}
          {/* </View>
        )} */}

        {/* === TOMBOL SYNC NOW (untuk semua role) === */}
        <View style={{marginTop: 12}}>
          <Button
            title={isSyncing ? 'Menyinkronkan...' : 'Sinkronasi Sekarang'}
            variant="secondary"
            onPress={handleSyncNow}
            disabled={isSyncing}
          />
          {lastSyncAt && (
            <CustomText variant="caption" style={{marginTop: 6, color: '#666'}}>
              Terakhir sinkron: {lastSyncAt}
            </CustomText>
          )}
        </View>

        {isOwner && (
          <>
            <ProfitCard />
            <View style={styles.chartWrapper}>
              <TransactionChart refreshKey={refreshKey} />
            </View>
          </>
        )}

        <View style={styles.transactionHeader}>
          <CustomText variant="subtitle">Transaksi Terkini</CustomText>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('App', {
                screen: 'AppTabs',
                params: {screen: 'Wallet'},
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
            {transactions.length > 0 ? (
              transactions.map(item => (
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
              ))
            ) : (
              <CustomText style={styles.emptyText}>
                Belum ada transaksi
              </CustomText>
            )}
          </ScrollView>
        </View>
      </ScrollView>
      <Toast config={{infoCustom: InfoToast, error: ErrorToast}} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: 'white'},
  scrollContent: {padding: 16, paddingBottom: 40},
  title: {marginTop: 16},
  chartWrapper: {marginBottom: 5, marginTop: 20},
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
  emptyText: {color: '#888', fontSize: 13, textAlign: 'center'},
  toastCard: {
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
  },
});

export default HomeScreen;
