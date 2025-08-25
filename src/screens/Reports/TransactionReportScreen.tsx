import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
  Share,
  PermissionsAndroid,
} from 'react-native';
import CustomText from '../../components/Text/CustomText';
import {getAllTransactions} from '../../database/transactions/transactionQueries';
import {groupByMonth} from '../../utils/transactionUtils';
import {TransactionData} from '../../types/transaction';
import {COLORS} from '../../constants';
import {Picker} from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Pdf from 'react-native-pdf';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Button from '../../components/Button/Button';

const TransactionReport = () => {
  const currentYear = new Date().getFullYear();

  const [monthlyData, setMonthlyData] = useState<
    {month: string; income: number; expense: number; year: number}[]
  >([]);
  const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [allTransactions, setAllTransactions] = useState<TransactionData[]>([]);
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  const [isPdfVisible, setIsPdfVisible] = useState(false);
  const [pdfName, setPdfName] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const transactions: TransactionData[] = await getAllTransactions();
      setAllTransactions(transactions);
      const formattedData = groupByMonth(transactions);
      const years = Array.from(
        new Set(formattedData.map(item => item.year)),
      ).sort((a, b) => b - a);
      setAvailableYears(years);
      setMonthlyData(formattedData);
      if (years.length && !years.includes(Number(selectedYear))) {
        setSelectedYear(String(years[0]));
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLoadingYears = availableYears.length === 0;

  const indoMonthToIndex = (m: string): number => {
    const map: Record<string, number> = {
      Januari: 0,
      Februari: 1,
      Maret: 2,
      April: 3,
      Mei: 4,
      Juni: 5,
      Juli: 6,
      Agustus: 7,
      September: 8,
      Oktober: 9,
      November: 10,
      Desember: 11,
    };
    if (map[m] !== undefined) {
      return map[m];
    }
    const lower = m.toLowerCase();
    const list = [
      'januari',
      'februari',
      'maret',
      'april',
      'mei',
      'juni',
      'juli',
      'agustus',
      'september',
      'oktober',
      'november',
      'desember',
    ];
    const idx = list.indexOf(lower);
    return idx >= 0 ? idx : new Date().getMonth();
  };

  const getMonthTextStyle = (month: string) => {
    if (month.length >= 8) {
      return styles.smallText;
    } else if (month.length >= 7) {
      return styles.mediumText;
    }
    return null;
  };

  const formatCurrency = (n: number) =>
    (n ?? 0).toLocaleString('id-ID', {minimumFractionDigits: 0});

  const formatDate = (d: any) => {
    const date = d instanceof Date ? d : new Date(d);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const formatTime = (d: any) => {
    const date = d instanceof Date ? d : new Date(d);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const safeNumber = (x: any, fallback = 0): number =>
    typeof x === 'number' && !Number.isNaN(x)
      ? x
      : parseFloat(String(x)) || fallback;

  const escapeHtml = (s: string) =>
    String(s).replace(
      /[&<>"']/g,
      m =>
        ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[
          m
        ]!),
    );

  const getTotalsAndRows = (txs: TransactionData[]) => {
    let total = 0;

    const getDate = (x: any) =>
      new Date(x.date ?? x.createdAt ?? x.updatedAt ?? 0);

    const sortedTxs = [...txs].sort(
      (a, b) => getDate(a).getTime() - getDate(b).getTime(),
    );

    const rows = sortedTxs
      .map(t => {
        const qty = safeNumber(
          (t as any).quantity ?? (t as any).qty ?? (t as any).count,
          0,
        );
        const price = safeNumber(
          (t as any).price ?? (t as any).unitPrice ?? (t as any).amount,
          0,
        );
        const totalRow = qty * price;
        total += totalRow;
        return `
      <tr>
        <td>${formatDate((t as any).date || new Date())}</td>
        <td>${formatTime((t as any).date || new Date())}</td>
        <td>${escapeHtml((t as any).name || (t as any).title || '-')}</td>
        <td style="text-align:right">${formatCurrency(qty)}</td>
        <td style="text-align:right">${formatCurrency(price)}</td>
        <td style="text-align:right">${formatCurrency(totalRow)}</td>
      </tr>
    `;
      })
      .join('');

    return {rows, total};
  };

  const buildHtml = (
    monthLabel: string,
    yearNum: number,
    incomeTx: TransactionData[],
    expenseTx: TransactionData[],
  ) => {
    const {rows: incomeRows, total: incomeTotal} = getTotalsAndRows(incomeTx);
    const {rows: expenseRows, total: expenseTotal} =
      getTotalsAndRows(expenseTx);
    return `
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Laporan - ${escapeHtml(monthLabel)} ${yearNum}</title>
<style>
  body { font-family: -apple-system, Roboto, "Segoe UI", "Helvetica Neue", Arial, "Noto Sans", sans-serif; color: #111; margin: 24px; }
  h1 { font-size: 22px; margin: 0 0 16px; }
  h2 { font-size: 16px; margin: 20px 0 8px; }
  .section { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 8px; border-bottom: 1px solid #f0f0f0; font-size: 12px; }
  th { background: #f7fafc; text-align: left; }
  tfoot td { font-weight: bold; border-top: 1px solid #e5e7eb; }
  .muted { color: #6b7280; }
</style>
</head>
<body>
  <h1>Laporan - ${escapeHtml(monthLabel)} ${yearNum}</h1>
  <div class="section">
    <h2>Pendapatan</h2>
    <table>
      <thead>
        <tr>
          <th>Tanggal</th>
          <th>Jam</th>
          <th>Nama</th>
          <th style="text-align:right">Jumlah</th>
          <th style="text-align:right">Harga Satuan</th>
          <th style="text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${
          incomeRows ||
          '<tr><td colspan="6" style="text-align:center" class="muted">Tidak ada data pendapatan</td></tr>'
        }
      </tbody>
      <tfoot>
        <tr>
          <td colspan="5" style="text-align:right">Total Pendapatan</td>
          <td style="text-align:right">${formatCurrency(incomeTotal)}</td>
        </tr>
      </tfoot>
    </table>
  </div>
  <div class="section">
    <h2>Pengeluaran</h2>
    <table>
      <thead>
        <tr>
          <th>Tanggal</th>
          <th>Jam</th>
          <th>Nama</th>
          <th style="text-align:right">Jumlah</th>
          <th style="text-align:right">Harga Satuan</th>
          <th style="text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${
          expenseRows ||
          '<tr><td colspan="6" style="text-align:center" class="muted">Tidak ada data pengeluaran</td></tr>'
        }
      </tbody>
      <tfoot>
        <tr>
          <td colspan="5" style="text-align:right">Total Pengeluaran</td>
          <td style="text-align:right">${formatCurrency(expenseTotal)}</td>
        </tr>
      </tfoot>
    </table>
  </div>
</body>
</html>
    `;
  };

  const createPdf = async (monthLabel: string, yearNum: number) => {
    try {
      const monthIdx = indoMonthToIndex(monthLabel);
      const monthTx = allTransactions.filter((t: any) => {
        const d = new Date(t.date || t.createdAt || t.updatedAt || Date.now());
        return d.getMonth() === monthIdx && d.getFullYear() === yearNum;
      });

      const incomeTx = monthTx.filter((t: any) => {
        if (t.type?.toLowerCase?.() === 'income') {
          return true;
        }
        if (t.type?.toLowerCase?.() === 'expense') {
          return false;
        }
        return safeNumber(t.price ?? t.amount, 0) > 0;
      });
      const expenseTx = monthTx.filter((t: any) => {
        if (t.type?.toLowerCase?.() === 'expense') {
          return true;
        }
        if (t.type?.toLowerCase?.() === 'income') {
          return false;
        }
        return safeNumber(t.price ?? t.amount, 0) < 0;
      });

      const html = buildHtml(monthLabel, yearNum, incomeTx, expenseTx);
      const baseName = `Laporan_${monthLabel}_${yearNum}`.replace(/\s+/g, '_');
      setPdfName(`${baseName}.pdf`);

      const file = await RNHTMLtoPDF.convert({
        html,
        fileName: baseName,
        directory: 'Documents',
        base64: false,
      });

      if (file.filePath) {
        const path =
          Platform.OS === 'ios' ? file.filePath : `file://${file.filePath}`;
        setPdfPath(path);
        setIsPdfVisible(true);
      } else {
        Alert.alert('Gagal', 'Tidak dapat membuat file PDF.');
      }
    } catch (err) {
      console.error('PDF creation error:', err);
      Alert.alert('Gagal', 'Terjadi kesalahan saat membuat PDF.');
    }
  };

  const downloadCurrentPdf = async () => {
    if (!pdfPath || !pdfName) {
      Alert.alert('No file', 'Open a PDF first, then try downloading.');
      return;
    }

    try {
      if (Platform.OS === 'android') {
        const src = pdfPath.replace(/^file:\/\//, '');

        if (Platform.Version < 29) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert('Permission denied', 'Storage permission is required.');
            return;
          }
          const dest = `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${pdfName}`;
          await ReactNativeBlobUtil.fs.cp(src, dest);
          Alert.alert('Saved', `PDF saved to Downloads:\n${dest}`);
        } else {
          await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
            {
              name: pdfName,
              mimeType: 'application/pdf',
              parentFolder: '',
            },
            'Download',
            src,
          );
          Alert.alert('Saved', 'PDF saved to your Downloads folder.');
        }
      } else {
        await Share.share({url: pdfPath, message: 'Laporan PDF'});
      }
    } catch (e) {
      console.error('Download error:', e);
      Alert.alert('Failed', 'Could not save the PDF.');
    }
  };

  const renderPdfModal = () => {
    if (!pdfPath) {
      return null;
    }

    return (
      <Modal
        visible={isPdfVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsPdfVisible(false)}>
        <View style={styles.pdfContainer}>
          <View style={styles.pdfHeader}>
            <TouchableOpacity
              style={styles.pdfButton}
              onPress={() => setIsPdfVisible(false)}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>

            <CustomText style={styles.pdfTitle}>Laporan PDF</CustomText>

            <TouchableOpacity
              style={styles.pdfButton}
              onPress={downloadCurrentPdf}>
              <Icon name="download-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <Pdf
            source={{uri: pdfPath}}
            onLoadComplete={numberOfPages => {
              console.log(`PDF loaded with ${numberOfPages} pages`);
            }}
            onPageChanged={page => {
              console.log(`Current page: ${page}`);
            }}
            onError={error => {
              console.log('PDF error:', error);
              Alert.alert('Error', 'Gagal membuka PDF.');
            }}
            style={styles.pdf}
          />
        </View>
      </Modal>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View
            style={[
              styles.yearPickerWrapper,
              Platform.OS === 'android' && {overflow: 'visible'},
            ]}>
            <Picker
              mode="dropdown"
              selectedValue={isLoadingYears ? '' : selectedYear}
              style={[
                styles.yearPicker,
                Platform.OS === 'android' && {color: '#1a1a1a'},
              ]}
              dropdownIconColor={Platform.OS === 'android' ? '#777' : undefined}
              onValueChange={val => {
                if (val !== '') {
                  setSelectedYear(String(val));
                }
              }}>
              {isLoadingYears && (
                <Picker.Item label="Pilih tahun..." value="" />
              )}
              {availableYears.map(year => (
                <Picker.Item
                  key={year}
                  label={String(year)}
                  value={String(year)}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.tableContainer}>
          <View style={[styles.row, styles.header]}>
            <View style={[styles.cell, styles.colBulan]}>
              <CustomText style={styles.headerText}>Bulan</CustomText>
            </View>
            <View style={[styles.cell, styles.colNominal]}>
              <CustomText style={styles.headerText}>Pendapatan</CustomText>
            </View>
            <View style={[styles.cell, styles.colNominal]}>
              <CustomText style={styles.headerText}>Pengeluaran</CustomText>
            </View>
            <View style={[styles.cell, styles.colAksi]}>
              <CustomText style={styles.headerText}>Aksi</CustomText>
            </View>
          </View>

          {monthlyData
            .filter(item => String(item.year) === selectedYear)
            .map((item, index) => (
              <View
                key={`${item.month}-${item.year}`}
                style={[
                  styles.row,
                  {
                    backgroundColor:
                      index % 2 === 0 ? COLORS.veryLightGray : COLORS.white,
                  },
                ]}>
                <View style={[styles.cell, styles.colBulan]}>
                  <CustomText
                    style={[styles.cellText, getMonthTextStyle(item.month)]}>
                    {item.month}
                  </CustomText>
                </View>
                <View style={[styles.cell, styles.colNominal]}>
                  <CustomText style={[styles.cellText]}>
                    {item.income.toLocaleString('id-ID')}
                  </CustomText>
                </View>
                <View style={[styles.cell, styles.colNominal]}>
                  <CustomText style={[styles.cellText]}>
                    {item.expense.toLocaleString('id-ID')}
                  </CustomText>
                </View>
                <View style={[styles.cell, styles.colAksi]}>
                  <Button
                    title="Lihat"
                    customStyle={{
                      paddingVertical: 6,
                      paddingHorizontal: 8,
                      marginVertical: 0,
                      alignSelf: 'center',
                      width: 'auto',
                      minWidth: 60,
                      borderRadius: 6,
                    }}
                    onPress={() => createPdf(item.month, item.year)}
                  />
                </View>
              </View>
            ))}
        </View>
      </View>
      {renderPdfModal()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  yearPickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  yearPicker: {
    height: 52,
    width: 150,
    fontSize: 16,
  },
  tableContainer: {
    marginTop: 16,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  header: {
    backgroundColor: '#cbe8f3',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  cell: {
    paddingHorizontal: 4,
  },
  smallText: {
    fontSize: 10.5,
  },
  mediumText: {
    fontSize: 14,
  },
  cellText: {
    textAlignVertical: 'center',
    paddingHorizontal: 4,
  },
  colBulan: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colNominal: {
    flex: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colAksi: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  pdfHeader: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: 16,
  },
  pdfTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  pdfButton: {
    padding: 8,
  },
});

export default TransactionReport;
